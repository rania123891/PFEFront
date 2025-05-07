import { Component, OnInit, OnDestroy } from '@angular/core';
import { AssistantService } from '../../services/assistant.service';
import { NbToastrService } from '@nebular/theme';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { finalize } from 'rxjs/operators';

interface CommandHistory {
  text: string;
  timestamp: Date;
  status: 'success' | 'error' | 'pending';
  response?: string;
  type?: 'success' | 'error' | 'info' | 'warning';
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

  constructor(
    private assistantService: AssistantService,
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

    this.assistantService.sendCommand(command)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (response: string) => {
          console.log('Réponse reçue:', response);
          this.responseMessage = response;
          this.showResponse = true;
          
          const index = commandIndex !== -1 ? commandIndex : 0;
          this.commandHistory[index].status = 'success';
          this.commandHistory[index].response = response;
          
          localStorage.setItem('commandHistory', JSON.stringify(this.commandHistory));
          this.toastrService.success('Commande exécutée avec succès', 'Succès');
        },
        error: (error: string) => {
          console.error('Erreur détaillée:', error);
          this.responseMessage = error;
          this.showResponse = true;
          
          const index = commandIndex !== -1 ? commandIndex : 0;
          this.commandHistory[index].status = 'error';
          this.commandHistory[index].response = error;
          
          localStorage.setItem('commandHistory', JSON.stringify(this.commandHistory));
          this.toastrService.danger(error, 'Erreur');
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
}
