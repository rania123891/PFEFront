import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

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

export interface Commentaire {
  id: number;
  contenu: string;
  dateCreation: Date;
}

export interface Tache {
  id: number;
  titre: string;
  description?: string;
  statut: StatutTache;
  priorite: PrioriteTache;
  dateCreation: Date;
  dateEcheance: Date;
  projetId?: number;
  listeId?: number;
  assigneId?: number;
  projet?: any;
  liste?: any;
  commentaires?: Commentaire[];
  planifications?: any[];
}

@Injectable({
  providedIn: 'root'
})
export class TacheService {
  private apiUrl = `${environment.apis.projet}/taches`;
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient) { }

  private handleError(error: any): Observable<never> {
    console.error('Erreur API Tâches:', error);
    return throwError(() => error);
  }

  getTaches(): Observable<Tache[]> {
    console.log('🔍 Appel API getTaches vers:', this.apiUrl);
    return this.http.get<Tache[]>(this.apiUrl)
      .pipe(catchError(this.handleError));
  }

  getTachesByProjet(projetId: number): Observable<Tache[]> {
    console.log('🔍 Appel API getTachesByProjet vers:', `${this.apiUrl}/projet/${projetId}`);
    return this.http.get<Tache[]>(`${this.apiUrl}/projet/${projetId}`)
      .pipe(catchError(this.handleError));
  }

  getTache(id: number): Observable<Tache> {
    return this.http.get<Tache>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  createTache(tache: Tache): Observable<Tache> {
    const tacheData = {
      titre: tache.titre,
      description: tache.description || '',
      priorite: Number(tache.priorite),
      statut: Number(tache.statut || StatutTache.EnCours),
      dateCreation: new Date().toISOString(),
      dateEcheance: tache.dateEcheance || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // +7 jours par défaut
      planifications: []
      // projetId, listeId, assigneId omis car optionnels
    };
    
    console.log('Données de la tâche à envoyer:', tacheData);
    return this.http.post<Tache>(this.apiUrl, tacheData, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  updateTache(id: number, tache: Tache): Observable<Tache> {
    return this.http.put<Tache>(`${this.apiUrl}/${id}`, tache, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  deleteTache(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  getPrioriteLabel(priorite: PrioriteTache): string {
    switch (priorite) {
      case PrioriteTache.Faible:
        return 'Faible';
      case PrioriteTache.Moyenne:
        return 'Moyenne';
      case PrioriteTache.Elevee:
        return 'Élevée';
      default:
        return 'Inconnue';
    }
  }

  getStatutLabel(statut: StatutTache): string {
    switch (statut) {
      case StatutTache.EnCours:
        return 'En cours';
      case StatutTache.Terminee:
        return 'Terminée';
      case StatutTache.Annulee:
        return 'Annulée';
      default:
        return 'Inconnu';
    }
  }
} 