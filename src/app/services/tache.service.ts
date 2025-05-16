import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
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
  projetId: number;
  listeId: number;
  assigneId: number;
  projet?: any;
  liste?: any;
  commentaires?: Commentaire[];
}

@Injectable({
  providedIn: 'root'
})
export class TacheService {
  private apiUrl = 'http://localhost:5093/projet/api/taches';

  constructor(private http: HttpClient) { }

  getTaches(): Observable<Tache[]> {
    return this.http.get<Tache[]>(this.apiUrl);
  }

  getTache(id: number): Observable<Tache> {
    return this.http.get<Tache>(`${this.apiUrl}/${id}`);
  }

  createTache(tache: Tache): Observable<Tache> {
    return this.http.post<Tache>(this.apiUrl, tache);
  }

  updateTache(id: number, tache: Tache): Observable<Tache> {
    return this.http.put<Tache>(`${this.apiUrl}/${id}`, tache);
  }

  deleteTache(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
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