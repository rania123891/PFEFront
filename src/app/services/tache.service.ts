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
  equipeId?: number;
  projet?: any;
  liste?: any;
  equipe?: any;
  commentaires?: Commentaire[];
  planifications?: any[];
}

@Injectable({
  providedIn: 'root'
})
export class TacheService {
  private apiUrl = 'http://localhost:5093/projet/api/taches';
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient) { }

  private handleError(error: any): Observable<never> {
    console.error('❌ Erreur TacheController:', error);
    
    if (error.status === 400) {
      console.error('🔍 Erreur de validation (400):', error.error);
    } else if (error.status === 404) {
      console.error('🔍 Équipe non trouvée (404):', error.error);
    } else if (error.status === 500) {
      console.error('🔍 Erreur serveur (500):', error.error);
    }
    
    return throwError(() => error);
  }

  getTaches(): Observable<Tache[]> {
    console.log('🔍 Appel API getTaches vers:', `${this.apiUrl}/all`);
    return this.http.get<Tache[]>(`${this.apiUrl}/all`)
      .pipe(catchError(this.handleError));
  }

  getTachesByProjet(projetId: number): Observable<Tache[]> {
    console.log('🔍 Appel API getTachesByProjet vers:', `${this.apiUrl}/projet/${projetId}`);
    return this.http.get<Tache[]>(`${this.apiUrl}/projet/${projetId}`)
      .pipe(catchError(this.handleError));
  }

  getTachesByEquipe(equipeId: number): Observable<Tache[]> {
    console.log('🔍 Appel API getTachesByEquipe vers:', `${this.apiUrl}/equipe/${equipeId}`);
    return this.http.get<Tache[]>(`${this.apiUrl}/equipe/${equipeId}`)
      .pipe(catchError(this.handleError));
  }

  getTache(id: number): Observable<Tache> {
    console.log('🔍 Appel API getTache vers:', `${this.apiUrl}/${id}`);
    return this.http.get<Tache>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  createTache(tache: Tache): Observable<Tache> {
    const tacheData = {
      Titre: tache.titre,
      Priorite: Number(tache.priorite),
      EquipeId: tache.equipeId
    };
    
    console.log('✅ Données envoyées au TacheController /create:', tacheData);
    return this.http.post<Tache>(`${this.apiUrl}/create`, tacheData, this.httpOptions)
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