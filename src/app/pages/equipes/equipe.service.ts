import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Equipe, StatutEquipe, Domaine } from './equipe.model';
import { environment } from '../../../environments/environment';

export interface Projet {
  id: number;
  nom: string;
}

@Injectable({
  providedIn: 'root'
})
export class EquipeService {
  private apiUrl = `${environment.apis.projet}/equipes`;
  private projetApiUrl = `${environment.apis.projet}/projets`;

  constructor(private http: HttpClient) {
    console.log('URL de l\'API des équipes:', this.apiUrl);
  }

  // Récupérer tous les projets
  getProjets(): Observable<Projet[]> {
    return this.http.get<Projet[]>(this.projetApiUrl);
  }

  // Récupérer toutes les équipes avec leurs membres
  getEquipes(): Observable<Equipe[]> {
    return this.http.get<Equipe[]>(`${this.apiUrl}?includeMembres=true`);
  }

  // Récupérer une équipe par son ID avec ses membres
  getEquipe(id: number): Observable<Equipe> {
    return this.http.get<Equipe>(`${this.apiUrl}/${id}?includeMembres=true`);
  }

  // Créer une nouvelle équipe
  createEquipe(equipe: Equipe): Observable<Equipe> {
    console.log('Données reçues du formulaire:', equipe);
    
    const equipeData = {
      nom: equipe.nom,
      statut: Number(equipe.statut),
      domaineActivite: Number(equipe.domaineActivite),
      projetId: Number(equipe.projetId)
    };
    
    console.log('Données formatées à envoyer:', equipeData);
    return this.http.post<Equipe>(this.apiUrl, equipeData);
  }

  // Mettre à jour une équipe
  updateEquipe(id: number, equipe: Equipe): Observable<Equipe> {
    return this.http.put<Equipe>(`${this.apiUrl}/${id}`, equipe);
  }

  // Supprimer une équipe
  deleteEquipe(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Récupérer les équipes d'un projet avec leurs membres
  getEquipesByProjet(projetId: number): Observable<Equipe[]> {
    return this.http.get<Equipe[]>(`${this.apiUrl}/projet/${projetId}?includeMembres=true`);
  }

  // Ajouter un ou plusieurs membres à une équipe
  ajouterMembre(equipeId: number, membres: { utilisateurId: number, role: string }[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/${equipeId}/membres`, membres);
  }

  // Supprimer un membre d'une équipe
  supprimerMembre(equipeId: number, membreEquipeId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${equipeId}/membres/${membreEquipeId}`);
  }
} 