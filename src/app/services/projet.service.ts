import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

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
  dateDebut: Date | string;
  dateEcheance: Date | string;
  duree: number;
  createurId: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProjetService {
  private apiUrl = `${environment.apis.projet}/projets`;

  constructor(private http: HttpClient) { }

  getStatutLabel(statut: StatutProjet): string {
    switch (statut) {
      case StatutProjet.EnCours:
        return 'En cours';
      case StatutProjet.Termine:
        return 'Terminé';
      case StatutProjet.Annule:
        return 'Annulé';
      default:
        return 'Inconnu';
    }
  }

  getProjets(): Observable<Projet[]> {
    return this.http.get<Projet[]>(this.apiUrl);
  }

  getProjet(id: number): Observable<Projet> {
    return this.http.get<Projet>(`${this.apiUrl}/${id}`);
  }

  createProjet(projet: Projet): Observable<Projet> {
    const projetData = {
      nom: projet.nom,
      description: projet.description || '',
      statut: Number(projet.statut),
      dateDebut: projet.dateDebut,
      dateEcheance: projet.dateEcheance,
      duree: projet.duree,
      createurId: projet.createurId,
      Planifications: []
    };

    console.log('Données du projet à envoyer:', projetData);
    return this.http.post<Projet>(this.apiUrl, projetData);
  }

  updateProjet(id: number, projet: Projet): Observable<Projet> {
    const projetData = {
      id: id,
      nom: projet.nom,
      description: projet.description || '',
      statut: Number(projet.statut),
      dateDebut: projet.dateDebut,
      dateEcheance: projet.dateEcheance,
      duree: projet.duree,
      createurId: projet.createurId,
      Planifications: []
    };

    console.log('Données du projet à mettre à jour:', projetData);
    return this.http.put<Projet>(`${this.apiUrl}/${id}`, projetData);
  }

  deleteProjet(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
} 