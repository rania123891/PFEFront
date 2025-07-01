import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';
import { tap } from 'rxjs/operators';

export interface CommandResponse {
  success: boolean;
  message: string;
  data?: any;
  type: 'Planification' | 'Projet' | 'Tache' | 'Equipe' | 'Membre' | 'General';
  confidence: number;
  extractedData: { [key: string]: any };
}

@Injectable({
  providedIn: 'root'
})
export class AssistantService {
  private apiUrl = `${environment.apis.projet}/assistant`;
  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();

  constructor(private http: HttpClient) {}

  sendCommand(command: string): Observable<any> {
    this.loadingSubject.next(true);
    return this.http.post<any>(`${this.apiUrl}/command`, { command })
      .pipe(
        tap(
          () => this.loadingSubject.next(false),
          () => this.loadingSubject.next(false)
        )
      );
  }

  getCommandHistory(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/history`);
  }

  clearHistory(): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/history`);
  }
} 