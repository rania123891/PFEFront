import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export enum RoleMembreEquipe {
  Membre = 0,
  ChefEquipe = 1
}

export interface CreateMembreEquipeRequest {
  utilisateurId: number;
  role: number;
}

export interface MembreEquipe {
  id?: number;
  utilisateurId: number;
  utilisateur?: {
    id: number;
    email: string;
    nom?: string;
    prenom?: string;
  };
  equipeId: number;
  equipe?: {
    idEquipe: number;
    nom: string;
  };
  role: RoleMembreEquipe;
  dateAjout: Date;
}

@Injectable({
  providedIn: 'root'
})
export class MembreEquipeService {
  private baseUrl = `${environment.apis.projet}`;

  constructor(private http: HttpClient) { }

  getMembres(): Observable<MembreEquipe[]> {
    return this.http.get<MembreEquipe[]>(`${this.baseUrl}/equipes/membres?expand=utilisateur,equipe`);
  }

  getMembresEquipe(equipeId: number): Observable<MembreEquipe[]> {
    return this.http.get<MembreEquipe[]>(`${this.baseUrl}/equipes/${equipeId}/membres?expand=utilisateur,equipe`);
  }

  ajouterMembre(equipeId: number, membreEquipe: MembreEquipe): Observable<MembreEquipe> {
    const membreData: CreateMembreEquipeRequest = {
      utilisateurId: membreEquipe.utilisateurId,
      role: Number(membreEquipe.role)
    };
    
    // Envoyer les données dans un tableau comme attendu par le backend
    const requestData = [membreData];
    console.log('Données envoyées au serveur:', requestData);
    
    return this.http.post<MembreEquipe>(`${this.baseUrl}/equipes/${equipeId}/membres`, requestData);
  }

  supprimerMembre(equipeId: number, membreEquipeId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/equipes/${equipeId}/membres/${membreEquipeId}`);
  }

  getRoleLabel(role: RoleMembreEquipe): string {
    switch (role) {
      case RoleMembreEquipe.Membre:
        return 'Membre';
      case RoleMembreEquipe.ChefEquipe:
        return 'Chef d\'équipe';
      default:
        return 'Inconnu';
    }
  }
} 