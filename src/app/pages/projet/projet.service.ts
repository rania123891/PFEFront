import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export enum StatutProjet {
  EnCours = 0,
  Termine = 1,
  Annule = 2
}

export interface Projet {
  id?: number;
  nom: string;
  description: string;
  statut: StatutProjet;
  dateDebut: Date;
  dateEcheance: Date;
  duree: number;
  createurId: number;
  entity?: string;
}

interface ValidationErrors {
  [key: string]: string[];
}

@Injectable({
  providedIn: 'root'
})
export class ProjetService {
  private apiUrl = 'http://localhost:5093/projet/api/projets';

  constructor(private http: HttpClient) { }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Une erreur est survenue';
    
    if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      errorMessage = `Erreur: ${error.error.message}`;
    } else {
      // Erreur côté serveur
      if (error.status === 0) {
        errorMessage = 'Le serveur n\'est pas accessible. Veuillez vérifier que le serveur backend est en cours d\'exécution.';
      } else if (error.error?.errors) {
        const validationErrors = error.error.errors as ValidationErrors;
        errorMessage = Object.entries(validationErrors)
          .map(([key, messages]) => `${key}: ${messages.join(', ')}`)
          .join('\n');
      } else {
        errorMessage = `Code d'erreur ${error.status}: ${error.error?.message || error.message}`;
      }
    }
    
    console.error('Erreur détaillée:', error);
    return throwError(errorMessage);
  }

  getProjets(): Observable<Projet[]> {
    return this.http.get<Projet[]>(this.apiUrl)
      .pipe(catchError(this.handleError));
  }

  getProjet(id: number): Observable<Projet> {
    return this.http.get<Projet>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  creerProjet(projet: Projet): Observable<Projet> {
    const projetData = {
      ...projet,
      entity: 'Projet', // Ajout du champ entity requis
      statut: Number(projet.statut), // Conversion en nombre pour le backend
    };
    return this.http.post<Projet>(this.apiUrl, projetData)
      .pipe(catchError(this.handleError));
  }

  modifierProjet(id: number, projet: Projet): Observable<Projet> {
    const projetData = {
      ...projet,
      entity: 'Projet',
      statut: Number(projet.statut),
    };
    return this.http.put<Projet>(`${this.apiUrl}/${id}`, projetData)
      .pipe(catchError(this.handleError));
  }

  supprimerProjet(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }
}
