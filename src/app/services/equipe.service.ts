import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export enum StatutEquipe {
  Active = 0,
  Inactive = 1
}

export enum Domaine {
  FrontEnd = 0,
  BackEnd = 1,
  BaseDonnee = 2
}

export interface Equipe {
  idEquipe?: number;
  nom: string;
  statut: StatutEquipe;
  domaineActivite: Domaine;
  projetId?: number;
  projet?: any;
}

@Injectable({
  providedIn: 'root'
})
export class EquipeService {
  private apiUrl = `${environment.apis.projet}/equipes`;

  constructor(private http: HttpClient) { }

  getEquipes(): Observable<Equipe[]> {
    return this.http.get<Equipe[]>(this.apiUrl).pipe(
      map(equipes => equipes.map(equipe => {
        if (equipe.projetId && !equipe.projet) {
          // Si nous avons un projetId mais pas de projet, on fait une requête pour obtenir le projet
          this.http.get(`${environment.apis.projet}/projets/${equipe.projetId}`).subscribe(
            (projet: any) => {
              equipe.projet = projet;
            }
          );
        }
        return equipe;
      }))
    );
  }

  getEquipe(id: number): Observable<Equipe> {
    return this.http.get<Equipe>(`${this.apiUrl}/${id}`);
  }

  createEquipe(equipe: Equipe): Observable<Equipe> {
    const equipeData = {
      nom: equipe.nom,
      statut: Number(equipe.statut),
      domaineActivite: Number(equipe.domaineActivite),
      projetId: equipe.projetId,
      entity: "Equipe"
    };

    console.log('Données de l\'équipe à envoyer:', equipeData);
    return this.http.post<Equipe>(this.apiUrl, equipeData);
  }

  updateEquipe(id: number, equipe: Equipe): Observable<Equipe> {
    const equipeData = {
      id: id,
      nom: equipe.nom,
      statut: Number(equipe.statut),
      domaineActivite: Number(equipe.domaineActivite),
      projetId: equipe.projetId,
      entity: "Equipe"
    };

    return this.http.put<Equipe>(`${this.apiUrl}/${id}`, equipeData);
  }

  deleteEquipe(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getStatutLabel(statut: StatutEquipe): string {
    switch (statut) {
      case StatutEquipe.Active:
        return 'Active';
      case StatutEquipe.Inactive:
        return 'Inactive';
      default:
        return 'Inconnu';
    }
  }

  getStatutBadgeStatus(statut: StatutEquipe): string {
    return statut === StatutEquipe.Active ? 'success' : 'danger';
  }

  getDomaineLabel(domaine: Domaine): string {
    switch (domaine) {
      case Domaine.FrontEnd:
        return 'Front-End';
      case Domaine.BackEnd:
        return 'Back-End';
      case Domaine.BaseDonnee:
        return 'Base de Données';
      default:
        return 'Inconnu';
    }
  }

  getStatutClass(statut: StatutEquipe): string {
    switch (statut) {
      case StatutEquipe.Active:
        return 'status-success';
      case StatutEquipe.Inactive:
        return 'status-danger';
      default:
        return 'status-basic';
    }
  }
} 