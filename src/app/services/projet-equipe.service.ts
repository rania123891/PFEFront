import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Projet } from './projet.service';
import { Equipe } from './equipe.service';

export interface ProjetEquipe {
  projetId: number;
  equipeId: number;
  projet?: Projet;
  equipe?: Equipe;
}

export interface AffectationEquipeRequest {
  projetId: number;
  equipeId: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProjetEquipeService {
  private apiUrl = `${environment.apis.projet}/equipes`;

  constructor(private http: HttpClient) { }

  // Affecter une équipe à un projet
  affecterEquipeAuProjet(equipeId: number, projetId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${equipeId}/affecter-projet`, projetId, {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Récupérer les projets d'une équipe
  getProjetsDeLEquipe(equipeId: number): Observable<number[]> {
    return this.http.get<number[]>(`${this.apiUrl}/${equipeId}/projets`);
  }

  // Récupérer les équipes d'un projet
  getEquipesDuProjet(projetId: number): Observable<Equipe[]> {
    return this.http.get<Equipe[]>(`${environment.apis.projet}/projets/${projetId}/equipes`);
  }

  // Retirer une équipe d'un projet
  retirerEquipeDuProjet(equipeId: number, projetId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${equipeId}/projets/${projetId}`);
  }

  // Récupérer toutes les relations ProjetEquipe
  getToutesLesRelations(): Observable<ProjetEquipe[]> {
    return this.http.get<ProjetEquipe[]>(`${environment.apis.projet}/projet-equipes`);
  }

  // Affecter plusieurs équipes à un projet
  affecterPlusieursEquipes(projetId: number, equipeIds: number[]): Observable<any> {
    const requests = equipeIds.map(equipeId => 
      this.affecterEquipeAuProjet(equipeId, projetId)
    );
    
    return new Observable(observer => {
      Promise.all(requests.map(req => req.toPromise()))
        .then(results => {
          observer.next(results);
          observer.complete();
        })
        .catch(error => observer.error(error));
    });
  }

  // Récupérer les équipes disponibles pour un projet (non encore affectées)
  getEquipesDisponibles(projetId: number): Observable<Equipe[]> {
    return this.http.get<Equipe[]>(`${environment.apis.projet}/projets/${projetId}/equipes-disponibles`);
  }
} 