import { Injectable } from '@angular/core';
import { ProjetService } from './projet.service';
import { TacheService } from './tache.service';
import { PlanificationService, EtatListe, CreatePlanificationDto } from './planification.service';
import { Observable, forkJoin, of } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';

export interface ExtractedPlanificationData {
  projetNom?: string;
  projetId?: number;
  tacheNom?: string;
  tacheId?: number;
  heureDebut?: string;
  heureFin?: string;
  description?: string;
  statut?: EtatListe;
  date?: string;
  confidence: number;
}

export interface ProcessingResult {
  success: boolean;
  message: string;
  planification?: any;
  extractedData?: ExtractedPlanificationData;
}

@Injectable({
  providedIn: 'root'
})
export class NaturalLanguageService {

  constructor(
    private projetService: ProjetService,
    private tacheService: TacheService,
    private planificationService: PlanificationService
  ) {}

  /**
   * Analyse une commande en langage naturel et extrait les informations de planification
   */
  extractPlanificationData(command: string): Observable<ExtractedPlanificationData> {
    const commandLower = command.toLowerCase().trim();
    
    return forkJoin({
      projets: this.projetService.getProjets().pipe(catchError(() => of([]))),
      taches: this.tacheService.getTaches().pipe(catchError(() => of([])))
    }).pipe(
      map(({ projets, taches }) => {
        const extracted: ExtractedPlanificationData = {
          confidence: 0
        };

        // Extraction du projet
        const projetMatch = this.extractProjet(commandLower, projets);
        if (projetMatch.found) {
          extracted.projetNom = projetMatch.nom;
          extracted.projetId = projetMatch.id;
          extracted.confidence += 20;
        }

        // Extraction de la tâche
        const tacheMatch = this.extractTache(commandLower, taches);
        if (tacheMatch.found) {
          extracted.tacheNom = tacheMatch.nom;
          extracted.tacheId = tacheMatch.id;
          extracted.confidence += 20;
        }

        // Extraction des horaires
        const horaireMatch = this.extractHoraires(commandLower);
        if (horaireMatch.found) {
          extracted.heureDebut = horaireMatch.debut;
          extracted.heureFin = horaireMatch.fin;
          extracted.confidence += 25;
        }

        // Extraction du statut
        const statutMatch = this.extractStatut(commandLower);
        if (statutMatch.found) {
          extracted.statut = statutMatch.statut;
          extracted.confidence += 15;
        }

        // Extraction de la description
        const descriptionMatch = this.extractDescription(command, extracted);
        if (descriptionMatch.found) {
          extracted.description = descriptionMatch.description;
          extracted.confidence += 10;
        }

        // Extraction de la date (par défaut aujourd'hui)
        extracted.date = this.extractDate(commandLower);
        extracted.confidence += 10;

        return extracted;
      })
    );
  }

  /**
   * Traite une commande complète et crée la planification
   */
  processCommand(command: string): Observable<ProcessingResult> {
    return this.extractPlanificationData(command).pipe(
      switchMap(extracted => {
        if (extracted.confidence < 50) {
          return of({
            success: false,
            message: `Je n'ai pas pu comprendre suffisamment d'informations dans votre commande. (Confiance: ${extracted.confidence}%)\nAssurez-vous de mentionner au moins le projet, la tâche et les horaires.`,
            extractedData: extracted
          });
        }

        if (!extracted.projetId || !extracted.tacheId || !extracted.heureDebut || !extracted.heureFin) {
          const missing = [];
          if (!extracted.projetId) missing.push('projet');
          if (!extracted.tacheId) missing.push('tâche');
          if (!extracted.heureDebut || !extracted.heureFin) missing.push('horaires');
          
          return of({
            success: false,
            message: `Informations manquantes: ${missing.join(', ')}.\nExemple: "J'ai travaillé sur le projet [nom] pour la tâche [nom] de [heure] à [heure] avec la description [texte]"`,
            extractedData: extracted
          });
        }

        // Créer la planification
        const planificationData: CreatePlanificationDto = {
          date: extracted.date!,
          heureDebut: extracted.heureDebut!,
          heureFin: extracted.heureFin!,
          description: extracted.description || 'Créé via assistant vocal',
          tacheId: extracted.tacheId!,
          projetId: extracted.projetId!,
          listeId: extracted.statut || EtatListe.Todo
        };

        return this.planificationService.createPlanification(planificationData).pipe(
          map(planification => ({
            success: true,
            message: `✅ Planification créée avec succès!\n📋 Projet: ${extracted.projetNom}\n🎯 Tâche: ${extracted.tacheNom}\n⏰ Horaires: ${extracted.heureDebut} - ${extracted.heureFin}\n📝 Description: ${extracted.description}`,
            planification,
            extractedData: extracted
          })),
          catchError(error => of({
            success: false,
            message: `❌ Erreur lors de la création: ${error.message || error}\nDonnées extraites: ${JSON.stringify(extracted, null, 2)}`,
            extractedData: extracted
          }))
        );
      })
    );
  }

  private extractProjet(command: string, projets: any[]): { found: boolean, nom?: string, id?: number } {
    const patterns = [
      /(?:projet|project)\s+([a-zA-Z0-9àâäéèêëïîôöùûüÿç\s\-_]+?)(?:\s|$|,|\.|dans|pour|sur|de|la|le|les|des|avec)/i,
      /(?:dans|sur|pour)\s+(?:le\s+)?(?:projet\s+)?([a-zA-Z0-9àâäéèêëïîôöùûüÿç\s\-_]+?)(?:\s|$|,|\.|la|le|les|des|avec|de)/i
    ];

    for (const pattern of patterns) {
      const match = command.match(pattern);
      if (match) {
        const projetNom = match[1].trim();
        const projet = projets.find(p => 
          p.nom.toLowerCase().includes(projetNom.toLowerCase()) ||
          projetNom.toLowerCase().includes(p.nom.toLowerCase())
        );
        
        if (projet) {
          return { found: true, nom: projet.nom, id: projet.id };
        }
      }
    }

    return { found: false };
  }

  private extractTache(command: string, taches: any[]): { found: boolean, nom?: string, id?: number } {
    const patterns = [
      /(?:tache|tâche|task)\s+([a-zA-Z0-9àâäéèêëïîôöùûüÿç\s\-_]+?)(?:\s|$|,|\.|de|pour|avec|du|des|le|la|les)/i,
      /(?:la|le|les)\s+(?:tache|tâche|task)\s+([a-zA-Z0-9àâäéèêëïîôöùûüÿç\s\-_]+?)(?:\s|$|,|\.|de|pour|avec)/i,
      /(?:pour|sur)\s+(?:la\s+)?(?:tache\s+)?([a-zA-Z0-9àâäéèêëïîôöùûüÿç\s\-_]+?)(?:\s|$|,|\.|de|avec|du|des)/i
    ];

    for (const pattern of patterns) {
      const match = command.match(pattern);
      if (match) {
        const tacheNom = match[1].trim();
        const tache = taches.find(t => 
          t.titre.toLowerCase().includes(tacheNom.toLowerCase()) ||
          tacheNom.toLowerCase().includes(t.titre.toLowerCase())
        );
        
        if (tache) {
          return { found: true, nom: tache.titre, id: tache.id };
        }
      }
    }

    return { found: false };
  }

  private extractHoraires(command: string): { found: boolean, debut?: string, fin?: string } {
    const patterns = [
      /(?:de|from)\s+(\d{1,2})[h:]?(\d{0,2})\s*(?:à|to|-|jusqu'à|jusqu)\s*(\d{1,2})[h:]?(\d{0,2})/i,
      /(\d{1,2})[h:](\d{2})\s*(?:à|to|-)\s*(\d{1,2})[h:](\d{2})/i,
      /(\d{1,2})h\s*(?:à|to|-)\s*(\d{1,2})h/i
    ];

    for (const pattern of patterns) {
      const match = command.match(pattern);
      if (match) {
        let heureDebut: string;
        let heureFin: string;

        if (pattern === patterns[2]) {
          // Format simple: 8h à 9h
          heureDebut = `${match[1].padStart(2, '0')}:00`;
          heureFin = `${match[2].padStart(2, '0')}:00`;
        } else {
          // Formats avec minutes
          const h1 = match[1].padStart(2, '0');
          const m1 = (match[2] || '00').padStart(2, '0');
          const h2 = match[3].padStart(2, '0');
          const m2 = (match[4] || '00').padStart(2, '0');
          
          heureDebut = `${h1}:${m1}`;
          heureFin = `${h2}:${m2}`;
        }

        return { found: true, debut: heureDebut, fin: heureFin };
      }
    }

    return { found: false };
  }

  private extractStatut(command: string): { found: boolean, statut?: EtatListe } {
    const statusMap = {
      'todo': EtatListe.Todo,
      'à faire': EtatListe.Todo,
      'planifié': EtatListe.Todo,
      'en cours': EtatListe.EnCours,
      'progress': EtatListe.EnCours,
      'working': EtatListe.EnCours,
      'test': EtatListe.Test,
      'testing': EtatListe.Test,
      'à tester': EtatListe.Test,
      'terminé': EtatListe.Termine,
      'fini': EtatListe.Termine,
      'done': EtatListe.Termine,
      'completed': EtatListe.Termine
    };

    for (const [keyword, statut] of Object.entries(statusMap)) {
      if (command.toLowerCase().includes(keyword)) {
        return { found: true, statut };
      }
    }

    return { found: false };
  }

  private extractDescription(command: string, extracted: ExtractedPlanificationData): { found: boolean, description?: string } {
    const patterns = [
      /(?:avec\s+la\s+description|description|desc)\s+([^.!?]+)/i,
      /(?:pour|avec)\s+([^.!?]+?)(?:\s+je\s+suis|\s+status|\s+statut|$)/i
    ];

    for (const pattern of patterns) {
      const match = command.match(pattern);
      if (match) {
        let description = match[1].trim();
        
        // Nettoyer la description des mots-clés extraits
        if (extracted.projetNom) {
          description = description.replace(new RegExp(extracted.projetNom, 'gi'), '').trim();
        }
        if (extracted.tacheNom) {
          description = description.replace(new RegExp(extracted.tacheNom, 'gi'), '').trim();
        }
        
        description = description.replace(/\s+/g, ' ').trim();
        
        if (description.length > 3) {
          return { found: true, description };
        }
      }
    }

    return { found: false };
  }

  private extractDate(command: string): string {
    // Pour l'instant, on utilise toujours aujourd'hui
    // Vous pouvez étendre ceci pour reconnaître "hier", "demain", des dates spécifiques, etc.
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
} 