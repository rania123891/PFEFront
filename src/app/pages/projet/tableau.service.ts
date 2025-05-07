import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Tableau, Liste, Tache } from './models/tableau.model';

@Injectable({
  providedIn: 'root'
})
export class TableauService {
  private apiUrl = 'https://localhost:7207/api';

  constructor(private http: HttpClient) { }

  getTableauxByProjet(projetId: number): Observable<Tableau[]> {
    return this.http.get<Tableau[]>(`${this.apiUrl}/projets/${projetId}/tableaux`);
  }

  getTableau(id: number): Observable<Tableau> {
    return this.http.get<Tableau>(`${this.apiUrl}/tableaux/${id}`);
  }

  creerTableau(tableau: Tableau): Observable<Tableau> {
    return this.http.post<Tableau>(`${this.apiUrl}/tableaux`, tableau);
  }

  getListes(tableauId: number): Observable<Liste[]> {
    return this.http.get<Liste[]>(`${this.apiUrl}/tableaux/${tableauId}/listes`);
  }

  creerListe(liste: Liste): Observable<Liste> {
    return this.http.post<Liste>(`${this.apiUrl}/listes`, liste);
  }

  deplacerListe(listeId: number, nouvellePosition: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/listes/${listeId}/position`, { position: nouvellePosition });
  }

  getTaches(listeId: number): Observable<Tache[]> {
    return this.http.get<Tache[]>(`${this.apiUrl}/listes/${listeId}/taches`);
  }

  deplacerTache(tacheId: number, nouvelleListe: number, nouvellePosition: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/taches/${tacheId}/position`, {
      listeId: nouvelleListe,
      position: nouvellePosition
    });
  }
} 