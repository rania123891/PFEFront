import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface StatistiquesData {
  totalProjets: number;
  totalTaches: number;
  totalUtilisateurs: number;
  totalEquipes: number;
  tachesParStatut: { [key: string]: number };
  projetsParMois: { mois: string; count: number }[];
  planificationsParJour: { jour: string; count: number }[];
  progressionProjets: { nom: string; progression: number }[];
}

@Injectable({
  providedIn: 'root'
})
export class StatistiqueService {
  private projetApiUrl = `${environment.apis.projet}/projets`;
  private tacheApiUrl = `${environment.apis.projet}/taches`;
  private utilisateurApiUrl = `${environment.apis.user}/Utilisateur`;
  private equipeApiUrl = `${environment.apis.projet}/equipes`;

  constructor(private http: HttpClient) { }

  getStatistiques(): Observable<StatistiquesData> {
    return this.http.get<StatistiquesData>(`${environment.apis.projet}/statistiques`);
  }

  getTotalProjets(): Observable<number> {
    return this.http.get<any[]>(this.projetApiUrl).pipe(
      map(projets => projets.length)
    );
  }

  getTotalTaches(): Observable<number> {
    return this.http.get<any[]>(this.tacheApiUrl).pipe(
      map(taches => taches.length)
    );
  }

  getTotalUtilisateurs(): Observable<number> {
    return this.http.get<any[]>(this.utilisateurApiUrl).pipe(
      map(utilisateurs => utilisateurs.length)
    );
  }

  getTotalEquipes(): Observable<number> {
    return this.http.get<any[]>(this.equipeApiUrl).pipe(
      map(equipes => equipes.length)
    );
  }

  // Méthodes supplémentaires pour obtenir les détails
  getProjets(): Observable<any[]> {
    return this.http.get<any[]>(this.projetApiUrl);
  }

  getTaches(): Observable<any[]> {
    return this.http.get<any[]>(this.tacheApiUrl);
  }

  getUtilisateurs(): Observable<any[]> {
    return this.http.get<any[]>(this.utilisateurApiUrl);
  }

  getEquipes(): Observable<any[]> {
    return this.http.get<any[]>(this.equipeApiUrl);
  }
} 