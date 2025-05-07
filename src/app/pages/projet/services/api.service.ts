import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { StatutProjet } from '../models/statut-projet.enum';
import { switchMap, catchError, tap } from 'rxjs/operators';

export { StatutProjet };

export interface Projet {
  id?: number;
  nom: string;
  description: string;
  statut: StatutProjet;
  dateDebut: string;
  dateEcheance: string;
  duree: number;
  createurId: number;
  dateCreation?: string;
  dateModification?: string;
}

export interface Tableau {
  id: number;
  nom: string;
  description?: string;
  projetId: number;
  position?: number;
  listes: Liste[];
}

export interface Liste {
  id: number;
  nom: string;
  position: number;
  tableauId: number;
  projetId: number;
  taches: Tache[];
  reference?: string;
  dateCreation?: string;
  dateModification?: string;
}

export interface Tache {
  id?: number;
  titre: string;
  description?: string;
  statut: StatutTache;
  priorite: PrioriteTache;
  dateCreation: Date;
  dateEcheance: Date;
  projetId: number;
  listeId: number;
  assigneId: number;
  commentaires?: any[];
}

export interface PieceJointe {
  id: number;
  nom: string;
  url: string;
  type: string;
  taille: number;
  dateUpload: Date;
  uploaderId: number;
}

export interface Commentaire {
  id: number;
  texte: string;
  dateCreation: Date;
  auteurId: number;
  tacheId: number;
}

export interface Utilisateur {
  id: number;
  nom: string;
  email: string;
  avatar?: string;
}

export enum PrioriteTache {
  Faible = 0,
  Moyenne = 1,
  Elevee = 2
}

export enum StatutTache {
  EnCours = 0,
  Terminee = 1,
  Annulee = 2
}

export enum TypeTache {
  Feature = 'feature',
  Bug = 'bug',
  Task = 'task',
  Story = 'story'
}



@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private projetApiUrl = environment.apis.projet;
  private userApiUrl = environment.apis.user;

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    })
  };

  constructor(private http: HttpClient) {}

  // Utilisateurs
  getUtilisateurs(): Observable<Utilisateur[]> {
    return this.http.get<Utilisateur[]>(`${this.userApiUrl}/Utilisateur`, this.httpOptions);
  }

  getUtilisateur(id: number): Observable<Utilisateur> {
    return this.http.get<Utilisateur>(`${this.userApiUrl}/Utilisateur/${id}`, this.httpOptions);
  }

  // Projets
  getProjets(): Observable<Projet[]> {
    console.log('Appel API getProjets:', `${this.projetApiUrl}/projets`);
    return this.http.get<Projet[]>(`${this.projetApiUrl}/projets`, this.httpOptions).pipe(
      tap(projets => {
        console.log('Projets reçus bruts:', projets);
        if (Array.isArray(projets)) {
          console.log('Nombre de projets reçus:', projets.length);
        } else {
          console.log('La réponse n\'est pas un tableau:', typeof projets);
        }
      }),
      catchError(error => {
        console.error('Erreur détaillée lors de la récupération des projets:', error);
        console.error('Status:', error.status);
        console.error('Message:', error.message);
        console.error('URL:', error.url);
        return throwError(() => error);
      })
    );
  }

  getProjet(id: number): Observable<Projet> {
    return this.http.get<Projet>(`${this.projetApiUrl}/projets/${id}`, this.httpOptions);
  }

  createProjet(projet: Projet): Observable<Projet> {
    console.log('URL de l\'API:', `${this.projetApiUrl}/projets`);
    console.log('Données envoyées:', projet);
    return this.http.post<Projet>(`${this.projetApiUrl}/projets`, projet, this.httpOptions);
  }

  updateProjet(id: number, projet: Projet): Observable<Projet> {
    return this.http.put<Projet>(`${this.projetApiUrl}/projets/${id}`, projet, this.httpOptions);
  }

  deleteProjet(id: number): Observable<void> {
    console.log(`Tentative de suppression du projet ${id} à l'URL: ${this.projetApiUrl}/projets/${id}`);
    return this.http.delete<void>(`${this.projetApiUrl}/projets/${id}`, this.httpOptions).pipe(
      tap(() => console.log(`Projet ${id} supprimé avec succès`)),
      catchError(error => {
        console.error(`Erreur lors de la suppression du projet ${id}:`, error);
        return throwError(() => error);
      })
    );
  }

  // Tableaux
  getTableau(id: number): Observable<Tableau> {
    return this.http.get<Tableau>(`${this.projetApiUrl}/tableaux/${id}`, this.httpOptions);
  }

  getTableauByProjet(projetId: number): Observable<Tableau> {
    return this.http.get<Tableau>(`${this.projetApiUrl}/projets/${projetId}/tableau`, this.httpOptions);
  }

  getTableauxByProjet(projetId: number): Observable<Tableau[]> {
    console.log(`Récupération des tableaux pour le projet ${projetId}`);
    return this.http.get<Tableau[]>(`${this.projetApiUrl}/tableaux/projet/${projetId}`, this.httpOptions).pipe(
      tap(tableaux => {
        console.log(`Tableaux reçus pour le projet ${projetId}:`, tableaux);
      }),
      catchError(error => {
        console.error(`Erreur lors de la récupération des tableaux du projet ${projetId}:`, error);
        console.error('Status:', error.status);
        console.error('Message:', error.message);
        console.error('Erreur détaillée:', error.error);
        console.error('URL:', error.url);
        return throwError(() => ({
          status: error.status,
          message: error.message,
          details: error.error,
          url: error.url
        }));
      })
    );
  }

  createTableau(tableau: Partial<Tableau>): Observable<Tableau> {
    return this.http.post<Tableau>(`${this.projetApiUrl}/tableaux`, tableau, this.httpOptions);
  }

  updateTableau(id: number, tableau: Partial<Tableau>): Observable<Tableau> {
    return this.http.put<Tableau>(`${this.projetApiUrl}/tableaux/${id}`, tableau, this.httpOptions);
  }

  deleteTableau(id: number): Observable<void> {
    return this.http.delete<void>(`${this.projetApiUrl}/tableaux/${id}`, this.httpOptions);
  }

  // Listes
  getListes(tableauId: number): Observable<Liste[]> {
    return this.http.get<Liste[]>(`${this.projetApiUrl}/tableaux/${tableauId}/listes`, this.httpOptions);
  }

  getListesByTableau(tableauId: number): Observable<Liste[]> {
    return this.getListes(tableauId);
  }

  createListe(liste: Liste): Observable<Liste> {
    console.log('Création de la liste:', liste);
    return this.http.post<Liste>(`${this.projetApiUrl}/listes`, liste).pipe(
      tap(response => console.log('Réponse de création de liste:', response)),
      catchError(error => {
        console.error('Erreur lors de la création de la liste:', error);
        return throwError(() => error);
      })
    );
  }

  ajouterListe(liste: Partial<Liste>): Observable<Liste> {
    return this.http.post<Liste>(`${this.projetApiUrl}/listes`, liste, this.httpOptions);
  }

  updateListe(id: number, liste: Partial<Liste>): Observable<Liste> {
    return this.http.put<Liste>(`${this.projetApiUrl}/listes/${id}`, liste, this.httpOptions);
  }

  deleteListe(id: number): Observable<void> {
    return this.http.delete<void>(`${this.projetApiUrl}/listes/${id}`, this.httpOptions);
  }

  supprimerListe(listeId: number): Observable<void> {
    return this.http.delete<void>(`${this.projetApiUrl}/listes/${listeId}`, this.httpOptions).pipe(
      tap(() => console.log(`Liste ${listeId} supprimée`)),
      catchError(error => {
        console.error(`Erreur lors de la suppression de la liste ${listeId}:`, error);
        throw error;
      })
    );
  }

  modifierListe(listeId: number, liste: Partial<Liste>): Observable<Liste> {
    return this.http.put<Liste>(`${this.projetApiUrl}/listes/${listeId}`, liste, this.httpOptions).pipe(
      tap(listeModifiee => console.log('Liste modifiée:', listeModifiee)),
      catchError(error => {
        console.error(`Erreur lors de la modification de la liste ${listeId}:`, error);
        throw error;
      })
    );
  }

  // Listes
  getListesByTableauId(tableauId: number): Observable<Liste[]> {
    console.log(`Appel API pour récupérer les listes du tableau ${tableauId}`);
    return this.http.get<Liste[]>(`${this.projetApiUrl}/tableaux/${tableauId}/listes`, this.httpOptions).pipe(
      tap(response => console.log('Réponse API listes:', response))
    );
  }

  // Tâches
  getTachesByListeId(listeId: number): Observable<Tache[]> {
    console.log(`Récupération des tâches pour la liste ${listeId}`);
    return this.http.get<Tache[]>(`${this.projetApiUrl}/taches/liste/${listeId}`, this.httpOptions).pipe(
      tap(taches => console.log('Tâches reçues:', taches)),
      catchError(error => {
        console.error(`Erreur lors de la récupération des tâches pour la liste ${listeId}:`, error);
        return of([]); // Retourner un tableau vide en cas d'erreur
      })
    );
  }

  createTache(tache: Partial<Tache>): Observable<Tache> {
    const tacheToSend = {
      titre: tache.titre,
      description: tache.description,
      statut: tache.statut,
      priorite: tache.priorite,
      dateCreation: new Date().toISOString(),
      dateEcheance: tache.dateEcheance.toISOString(),
      projetId: +tache.projetId,
      listeId: +tache.listeId,
      assigneId: tache.assigneId,
    };

    console.log('Données formatées à envoyer à l\'API:', tacheToSend);
    return this.http.post<Tache>(`${this.projetApiUrl}/taches`, tacheToSend, {
      ...this.httpOptions,
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      })
    }).pipe(
      tap(response => console.log('Réponse de l\'API:', response))
    );
  }

  updateTache(id: number, tache: Partial<Tache>): Observable<Tache> {
    return this.http.put<Tache>(`${this.projetApiUrl}/taches/${id}`, tache, this.httpOptions);
  }

  deleteTache(id: number): Observable<void> {
    return this.http.delete<void>(`${this.projetApiUrl}/taches/${id}`, this.httpOptions);
  }

  // Pièces jointes
  uploadPieceJointe(tacheId: number, file: File): Observable<PieceJointe> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<PieceJointe>(`${this.projetApiUrl}/taches/${tacheId}/pieces-jointes`, formData);
  }

  deletePieceJointe(tacheId: number, pieceJointeId: number): Observable<void> {
    return this.http.delete<void>(`${this.projetApiUrl}/taches/${tacheId}/pieces-jointes/${pieceJointeId}`, this.httpOptions);
  }

  // Commentaires
  getCommentaires(tacheId: number): Observable<Commentaire[]> {
    return this.http.get<Commentaire[]>(`${this.projetApiUrl}/taches/${tacheId}/commentaires`, this.httpOptions);
  }

  createCommentaire(tacheId: number, commentaire: Partial<Commentaire>): Observable<Commentaire> {
    return this.http.post<Commentaire>(`${this.projetApiUrl}/taches/${tacheId}/commentaires`, commentaire, this.httpOptions);
  }

  deleteCommentaire(tacheId: number, commentaireId: number): Observable<void> {
    return this.http.delete<void>(`${this.projetApiUrl}/taches/${tacheId}/commentaires/${commentaireId}`, this.httpOptions);
  }

  
}