import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AssistantService {
  private apiUrl = 'http://localhost:5093/projet/api/assistant/command';
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();
  
  constructor(private http: HttpClient) { }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Une erreur est survenue';
    
    if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      errorMessage = `Erreur: ${error.error.message}`;
    } else {
      // Erreur côté serveur
      errorMessage = `Code d'erreur: ${error.status}\nMessage: ${error.message}`;
    }
    
    console.error('Détails de l\'erreur:', error);
    return throwError(() => errorMessage);
  }

  sendCommand(command: string): Observable<string> {
    this.loadingSubject.next(true);
    return this.http.post<string>(this.apiUrl, { command }).pipe(
      tap(response => console.log('Réponse du serveur:', response)),
      catchError(this.handleError),
      tap(() => this.loadingSubject.next(false))
    );
  }
} 