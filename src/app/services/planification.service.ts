import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export enum EtatListe {
  Todo = 0,
  EnCours = 1,
  Test = 2,
  Termine = 3
}

export interface Planification {
  id?: number;
  date: Date | string;
  heureDebut: string;
  heureFin: string;
  description?: string;
  tacheId: number;
  projetId: number;
  listeId: EtatListe;
  tache?: any;
  projet?: any;
}

export interface CreatePlanificationDto {
  date: string;
  heureDebut: string;
  heureFin: string;
  description?: string;
  tacheId: number;
  projetId: number;
  listeId: EtatListe;
}

@Injectable({
  providedIn: 'root'
})
export class PlanificationService {
  private apiUrl = 'https://localhost:7207/api/planifications';
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient) { }

  getEtatLabel(etat: EtatListe): string {
    switch (etat) {
      case EtatListe.Todo:
        return 'To Do';
      case EtatListe.EnCours:
        return 'En Cours';
      case EtatListe.Test:
        return 'Test';
      case EtatListe.Termine:
        return 'Terminé';
      default:
        return 'Inconnu';
    }
  }

  private handleError(error: any): Observable<never> {
    console.error('Erreur API Planification:', error);
    return throwError(() => error);
  }

  getPlanifications(): Observable<Planification[]> {
    return this.http.get<Planification[]>(this.apiUrl)
      .pipe(catchError(this.handleError));
  }

  getPlanificationsByDate(date: string): Observable<Planification[]> {
    return this.http.get<Planification[]>(`${this.apiUrl}/date/${date}`)
      .pipe(catchError(this.handleError));
  }

  getPlanification(id: number): Observable<Planification> {
    return this.http.get<Planification>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  createPlanification(planification: CreatePlanificationDto): Observable<Planification> {
    return this.http.post<Planification>(this.apiUrl, planification, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  updatePlanification(id: number, planification: Partial<Planification>): Observable<Planification> {
    return this.http.put<Planification>(`${this.apiUrl}/${id}`, planification, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  updateStatut(id: number, nouvelEtat: EtatListe): Observable<Planification> {
    return this.http.patch<Planification>(`${this.apiUrl}/${id}/statut`, { listeId: nouvelEtat }, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  deletePlanification(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }
} 