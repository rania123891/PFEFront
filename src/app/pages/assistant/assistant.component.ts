import { Component, OnInit, OnDestroy } from '@angular/core';
import { AssistantService, CommandResponse } from '../../services/assistant.service';
import { NaturalLanguageService, ProcessingResult } from '../../services/natural-language.service';
import { NbToastrService } from '@nebular/theme';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { finalize } from 'rxjs/operators';

interface CommandHistory {
  text: string;
  timestamp: Date;
  status: 'success' | 'error' | 'pending';
  response?: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  commandType?: string; // Type de commande (Projet, Tache, etc.)
  confidence?: number; // Niveau de confiance
  extractedData?: { [key: string]: any }; // Données extraites
}

declare global {
  interface Window {
    webkitSpeechRecognition: any;
  }
}

@Component({
  selector: 'ngx-assistant',
  templateUrl: './assistant.component.html',
  styleUrls: ['./assistant.component.scss'],
  animations: [
    trigger('responseAnimation', [
      state('void', style({
        opacity: 0,
        transform: 'translateY(-10px)'
      })),
      state('*', style({
        opacity: 1,
        transform: 'translateY(0)'
      })),
      transition('void => *', animate('300ms ease-out')),
      transition('* => void', animate('200ms ease-in'))
    ]),
    trigger('historyItemAnimation', [
      state('void', style({
        opacity: 0,
        transform: 'translateX(-20px)'
      })),
      state('*', style({
        opacity: 1,
        transform: 'translateX(0)'
      })),
      transition('void => *', animate('300ms ease-out')),
      transition('* => void', animate('200ms ease-in'))
    ])
  ]
})
export class AssistantComponent implements OnInit, OnDestroy {
  recognition: any;
  isListening: boolean = false;
  transcription: string = '';
  interimTranscription: string = '';
  errorMessage: string = '';
  userInput: string = '';
  commandHistory: CommandHistory[] = [];
  showHistory: boolean = false;
  responseMessage: string = '';
  responseType: 'success' | 'error' | 'info' | 'warning' = 'info';
  showResponse: boolean = false;
  isLoading: boolean = false;
  
  // Nouvelles propriétés pour l'affichage enrichi
  currentConfidence: number = 0;
  currentCommandType: string = '';
  currentExtractedData: { [key: string]: any } = {};
  showDetails: boolean = false;

  // Exposer Math au template
  Math = Math;

  constructor(
    private assistantService: AssistantService,
    private naturalLanguageService: NaturalLanguageService,
    private toastrService: NbToastrService
  ) {
    this.initializeSpeechRecognition();
  }

  ngOnInit() {
    // Charger l'historique depuis le localStorage
    const savedHistory = localStorage.getItem('commandHistory');
    if (savedHistory) {
      this.commandHistory = JSON.parse(savedHistory);
    }

    // S'abonner à l'état de chargement
    this.assistantService.loading$.subscribe(loading => {
      this.isLoading = loading;
    });
  }

  ngOnDestroy() {
    if (this.recognition) {
      this.recognition.stop();
    }
  }

  private initializeSpeechRecognition() {
    if ('webkitSpeechRecognition' in window) {
      this.recognition = new window.webkitSpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'fr-FR';

      this.recognition.onstart = () => {
        this.isListening = true;
        console.log('La reconnaissance vocale a démarré');
      };

      this.recognition.onend = () => {
        this.isListening = false;
        console.log('La reconnaissance vocale s\'est arrêtée');
      };

      this.recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';

        for (let i = 0; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        this.transcription = final;
        this.userInput = final;
        this.interimTranscription = interim;
      };

      this.recognition.onerror = (event: any) => {
        this.errorMessage = 'Erreur de reconnaissance vocale: ' + event.error;
        console.error('Erreur de reconnaissance vocale:', event.error);
      };
    } else {
      this.errorMessage = 'La reconnaissance vocale n\'est pas supportée par votre navigateur';
    }
  }

  toggleListening() {
    if (this.isListening) {
      this.recognition.stop();
    } else {
      this.transcription = '';
      this.interimTranscription = '';
      this.recognition.start();
    }
  }

  clearTranscription() {
    this.transcription = '';
    this.interimTranscription = '';
    this.userInput = '';
  }

  onUserInput(event: any) {
    this.userInput = event.target.value;
    this.transcription = this.userInput;
  }

  handleEnterKey(event: KeyboardEvent) {
    if (event.key === 'Enter' && this.userInput.trim()) {
      this.addToHistory(this.userInput.trim());
      this.sendCommand(this.userInput.trim());
    }
  }

  addToHistory(command: string) {
    const newCommand: CommandHistory = {
      text: command,
      timestamp: new Date(),
      status: 'pending'
    };
    
    this.commandHistory.unshift(newCommand);
    if (this.commandHistory.length > 10) {
      this.commandHistory.pop();
    }
    
    // Sauvegarder dans localStorage
    localStorage.setItem('commandHistory', JSON.stringify(this.commandHistory));
  }

  useHistoryCommand(command: CommandHistory) {
    this.userInput = command.text;
    this.transcription = command.text;
  }

  toggleHistory() {
    this.showHistory = !this.showHistory;
  }

  clearHistory() {
    this.commandHistory = [];
    localStorage.removeItem('commandHistory');
  }

  sendCommand(command: string) {
    if (!command.trim()) {
      this.toastrService.warning('Veuillez entrer une commande', 'Attention');
      return;
    }

    this.isLoading = true;
    const commandIndex = this.commandHistory.findIndex(cmd => cmd.text === command);
    
    if (commandIndex !== -1) {
      this.commandHistory[commandIndex].status = 'pending';
    } else {
      // Ajouter la nouvelle commande à l'historique
      this.commandHistory.unshift({
        text: command,
        timestamp: new Date(),
        status: 'pending'
      });
    }

    // Détecter le type de commande
    if (this.isPlanificationCommand(command)) {
      // Traitement intelligent pour les planifications
      this.processPlanificationCommand(command, commandIndex);
    } else {
      // Traitement classique via le backend
      this.processGeneralCommand(command, commandIndex);
    }
  }

  private isPlanificationCommand(command: string): boolean {
    const commandLower = command.toLowerCase();
    
    // Exclure explicitement les commandes de création
    const creationKeywords = [
      'créer un projet', 'nouveau projet', 'ajouter un projet',
      'créer une tâche', 'nouvelle tâche', 'ajouter une tâche', 'tâche nommée', 'tâche qui s\'appelle',
      'créer une équipe', 'nouvelle équipe', 'ajouter une équipe',
      'ajouter un membre', 'nouveau membre', 'membre nommé'
    ];
    
    // Si c'est une commande de création, ce n'est PAS une planification
    if (creationKeywords.some(keyword => commandLower.includes(keyword))) {
      return false;
    }
    
    // Pour être une planification, doit contenir des mots clés de travail ET des horaires
    const workKeywords = ['j\'ai fait', 'j\'ai travaillé', 'j\'ai bossé', 'travail'];
    const timeKeywords = ['de', 'à', 'heure', 'h', 'h00', 'h30'];
    
    const hasWorkKeyword = workKeywords.some(keyword => commandLower.includes(keyword));
    const hasTimeKeyword = timeKeywords.some(keyword => commandLower.includes(keyword));
    
    // Une vraie planification doit avoir les deux
    return hasWorkKeyword && hasTimeKeyword;
  }

  private processPlanificationCommand(command: string, commandIndex: number) {
    this.naturalLanguageService.processCommand(command)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (result: ProcessingResult) => {
          console.log('Résultat du traitement NLP:', result);
          
          this.responseMessage = result.message;
          this.responseType = result.success ? 'success' : 'error';
          this.showResponse = true;
          
          const index = commandIndex !== -1 ? commandIndex : 0;
          this.commandHistory[index].status = result.success ? 'success' : 'error';
          this.commandHistory[index].response = result.message;
          this.commandHistory[index].type = this.responseType;
          
          localStorage.setItem('commandHistory', JSON.stringify(this.commandHistory));
          
          if (result.success) {
            this.toastrService.success('Planification créée avec succès!', 'Assistant IA');
            // Vider le champ de saisie après succès
            this.userInput = '';
            this.transcription = '';
          } else {
            this.toastrService.warning(result.message, 'Assistant IA');
          }
        },
        error: (error: any) => {
          console.error('Erreur du traitement NLP:', error);
          this.responseMessage = `Erreur lors du traitement: ${error.message || error}`;
          this.responseType = 'error';
          this.showResponse = true;
          
          const index = commandIndex !== -1 ? commandIndex : 0;
          this.commandHistory[index].status = 'error';
          this.commandHistory[index].response = this.responseMessage;
          this.commandHistory[index].type = 'error';
          
          localStorage.setItem('commandHistory', JSON.stringify(this.commandHistory));
          this.toastrService.danger('Erreur lors du traitement', 'Assistant IA');
        }
      });
  }

  private processGeneralCommand(command: string, commandIndex: number) {
    this.assistantService.sendCommand(command)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (response: any) => {
          console.log('Réponse reçue:', response);
          
          // Adapter selon le type de réponse (ancienne string ou nouvelle structure)
          let processedResponse: CommandResponse;
          
          if (typeof response === 'string') {
            // Ancienne réponse string - on l'adapte
            processedResponse = {
              success: true,
              message: response,
              type: 'General',
              confidence: 0,
              extractedData: {}
            };
          } else if (response && typeof response === 'object') {
            // Nouvelle réponse enrichie
            processedResponse = {
              success: response.success ?? true,
              message: response.message || response,
              type: response.type || 'General',
              confidence: response.confidence || 0,
              extractedData: response.extractedData || {}
            };
          } else {
            // Fallback
            processedResponse = {
              success: true,
              message: 'Commande traitée avec succès',
              type: 'General',
              confidence: 0,
              extractedData: {}
            };
          }
          
          // Mettre à jour les propriétés d'affichage
          this.responseMessage = processedResponse.message;
          this.responseType = processedResponse.success ? 'success' : 'error';
          this.currentConfidence = processedResponse.confidence;
          this.currentCommandType = processedResponse.type;
          this.currentExtractedData = processedResponse.extractedData || {};
          this.showResponse = true;
          this.showDetails = processedResponse.confidence > 0 || Object.keys(this.currentExtractedData).length > 0;
          
          const index = commandIndex !== -1 ? commandIndex : 0;
          this.commandHistory[index].status = processedResponse.success ? 'success' : 'error';
          this.commandHistory[index].response = processedResponse.message;
          this.commandHistory[index].type = this.responseType;
          this.commandHistory[index].commandType = processedResponse.type;
          this.commandHistory[index].confidence = processedResponse.confidence;
          this.commandHistory[index].extractedData = processedResponse.extractedData;
          
          localStorage.setItem('commandHistory', JSON.stringify(this.commandHistory));
          
          // Messages de notification améliorés
          if (processedResponse.success) {
            const confidenceText = processedResponse.confidence > 0 ? ` (Confiance: ${Math.round(processedResponse.confidence)}%)` : '';
            this.toastrService.success(`${processedResponse.type} exécuté avec succès${confidenceText}`, 'Assistant IA');
            
            // Vider le champ de saisie après succès
            this.userInput = '';
            this.transcription = '';
          } else {
            const confidenceText = processedResponse.confidence > 0 ? ` (Confiance: ${Math.round(processedResponse.confidence)}%)` : '';
            this.toastrService.warning(`${processedResponse.message}${confidenceText}`, 'Assistant IA');
          }
        },
        error: (error: any) => {
          console.error('Erreur détaillée:', error);
          this.responseMessage = typeof error === 'string' ? error : (error.message || 'Erreur inconnue');
          this.responseType = 'error';
          this.showResponse = true;
          this.currentConfidence = 0;
          this.currentCommandType = 'General';
          this.currentExtractedData = {};
          this.showDetails = false;
          
          const index = commandIndex !== -1 ? commandIndex : 0;
          this.commandHistory[index].status = 'error';
          this.commandHistory[index].response = this.responseMessage;
          this.commandHistory[index].type = 'error';
          
          localStorage.setItem('commandHistory', JSON.stringify(this.commandHistory));
          this.toastrService.danger(this.responseMessage, 'Erreur');
        }
      });
  }

  getResponseIcon(): string {
    switch (this.responseType) {
      case 'success':
        return 'checkmark-circle-2-outline';
      case 'error':
        return 'close-circle-outline';
      case 'warning':
        return 'alert-triangle-outline';
      default:
        return 'info-outline';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'success':
        return 'checkmark-circle-2-outline';
      case 'error':
        return 'close-circle-outline';
      default:
        return 'clock-outline';
    }
  }

  // Nouvelles méthodes utilitaires
  getConfidenceColor(): string {
    if (this.currentConfidence >= 80) return 'success';
    if (this.currentConfidence >= 60) return 'warning';
    if (this.currentConfidence >= 40) return 'info';
    return 'danger';
  }

  getCommandTypeIcon(type: string): string {
    switch (type) {
      case 'Projet':
        return 'briefcase-outline';
      case 'Tache':
        return 'checkmark-square-outline';
      case 'Equipe':
        return 'people-outline';
      case 'Membre':
        return 'person-add-outline';
      case 'Planification':
        return 'calendar-outline';
      default:
        return 'question-mark-circle-outline';
    }
  }

  getExtractedDataEntries(): Array<{key: string, value: any}> {
    return Object.entries(this.currentExtractedData).map(([key, value]) => ({
      key: this.formatKey(key),
      value: value
    }));
  }

  private formatKey(key: string): string {
    const keyMap: { [key: string]: string } = {
      'nom': 'Nom',
      'description': 'Description',
      'priorite': 'Priorité',
      'projet': 'Projet',
      'equipe': 'Équipe',
      'membre': 'Membre'
    };
    return keyMap[key] || key;
  }

  toggleDetails() {
    this.showDetails = !this.showDetails;
  }

  trackByCommand(index: number, item: CommandHistory): string {
    return item.text + item.timestamp.getTime();
  }
} 