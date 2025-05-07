import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Tableau, Liste, Tache } from '../models/tableau.model';

@Injectable({
  providedIn: 'root',
})
export class TableauService {
  private apiUrl = 'api/tableaux'; // À remplacer par votre URL d'API

  constructor(private http: HttpClient) {}

  getTableauByProjet(projetId: number): Observable<Tableau> {
    const maintenant = new Date();
    
    const tableau: Tableau = {
      id: 1,
      projetId: projetId,
      titre: 'Tableau principal',
      listes: [
        {
          id: 1,
          titre: 'À FAIRE',
          taches: [
            {
              id: 205,
              titre: 'Implémenter la nouvelle interface',
              description: 'Créer une interface moderne et responsive',
              etiquettes: ['UI', 'DESIGN'],
              assignedTo: 'Alice Martin',
              priorite: 'high',
              type: 'feature',
              dateCreation: maintenant,
              tempsPasseEnHeures: 0
            },
            {
              id: 206,
              titre: 'Optimiser les performances',
              description: 'Améliorer le temps de chargement',
              etiquettes: ['PERFORMANCE'],
              assignedTo: 'Bob Wilson',
              priorite: 'medium',
              type: 'task',
              dateCreation: maintenant,
              tempsPasseEnHeures: 2
            }
          ]
        },
        {
          id: 2,
          titre: 'EN COURS',
          taches: [
            {
              id: 213,
              titre: 'Mettre à jour la documentation',
              description: 'Documenter les nouvelles fonctionnalités',
              etiquettes: ['DOCS'],
              assignedTo: 'Charlie Davis',
              priorite: 'low',
              type: 'task',
              dateCreation: maintenant,
              tempsPasseEnHeures: 4
            }
          ]
        },
        {
          id: 3,
          titre: 'EN TEST',
          taches: [
            {
              id: 346,
              titre: 'Corriger le bug d\'authentification',
              description: 'Résoudre le problème de connexion',
              etiquettes: ['AUTH', 'SECURITY'],
              assignedTo: 'David Brown',
              priorite: 'high',
              type: 'bug',
              dateCreation: maintenant,
              tempsPasseEnHeures: 6
            }
          ]
        },
        {
          id: 4,
          titre: 'TERMINÉ',
          taches: [
            {
              id: 336,
              titre: 'Ajouter le support multilingue',
              description: 'Implémenter l\'internationalisation',
              etiquettes: ['I18N'],
              assignedTo: 'Eve White',
              priorite: 'medium',
              type: 'feature',
              dateCreation: maintenant,
              tempsPasseEnHeures: 8
            }
          ]
        }
      ]
    };

    return of(tableau);
  }

  ajouterListe(projetId: number, titre: string): Observable<Liste> {
    return this.http.post<Liste>(`${this.apiUrl}/${projetId}/listes`, { titre });
  }

  ajouterTache(listeId: number, tache: Partial<Tache>): Observable<Tache> {
    return this.http.post<Tache>(`${this.apiUrl}/listes/${listeId}/taches`, tache);
  }

  deplacerTache(tacheId: number, listeId: number, position: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/taches/${tacheId}/deplacer`, {
      listeId,
      position,
    });
  }
} 