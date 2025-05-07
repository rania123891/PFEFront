import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Equipe } from '../models/equipe.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EquipeService {
  private apiUrl = `${environment.apis.projet}/equipes`;

  constructor(private http: HttpClient) {
    console.log('URL de l\'API des équipes:', this.apiUrl);
  }

  // Récupérer toutes les équipes
  getEquipes(): Observable<Equipe[]> {
    return this.http.get<Equipe[]>(this.apiUrl);
  }

  // Récupérer une équipe par son ID
  getEquipe(id: number): Observable<Equipe> {
    return this.http.get<Equipe>(`${this.apiUrl}/${id}`);
  }

  // Créer une nouvelle équipe
  createEquipe(equipe: Equipe): Observable<Equipe> {
    return this.http.post<Equipe>(this.apiUrl, equipe);
  }

  // Mettre à jour une équipe
  updateEquipe(id: number, equipe: Equipe): Observable<Equipe> {
    return this.http.put<Equipe>(`${this.apiUrl}/${id}`, equipe);
  }

  // Supprimer une équipe
  deleteEquipe(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Récupérer les équipes d'un projet
  getEquipesByProjet(projetId: number): Observable<Equipe[]> {
    console.log('URL de l\'API pour getEquipesByProjet:', `${environment.apis.projet}/projets/${projetId}/equipes`);
    return this.http.get<Equipe[]>(`${environment.apis.projet}/projets/${projetId}/equipes`);
  }
} 