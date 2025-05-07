import { Injectable } from '@angular/core';
import { NbMenuItem } from '@nebular/theme';
import { ApiService } from './api.service';
import { MENU_ITEMS } from '../../pages-menu';
import { BehaviorSubject, forkJoin, of } from 'rxjs';
import { map, switchMap, tap, catchError } from 'rxjs/operators';
import { Projet } from '../models/projet.model';
import { Tableau } from '../models/tableau.model';

@Injectable({
  providedIn: 'root'
})
export class ProjetMenuService {
  private projetsCache$ = new BehaviorSubject<Projet[]>([]);
  private lastUpdate: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes en millisecondes
  private isLoading = false;

  constructor(private apiService: ApiService) {}

  updateProjetsMenu() {
    if (this.isLoading) {
      console.log('Chargement déjà en cours...');
      return;
    }

    const now = Date.now();
    
    if (this.lastUpdate > 0 && now - this.lastUpdate < this.CACHE_DURATION) {
      console.log('Utilisation du cache...');
      this.updateMenu(this.projetsCache$.value);
      return;
    }

    console.log('Début du chargement des projets...');
    this.isLoading = true;

    this.apiService.getProjets().pipe(
      tap(projets => {
        console.log('Projets reçus dans le menu service:', projets);
        if (!Array.isArray(projets)) {
          throw new Error('La réponse n\'est pas un tableau de projets');
        }
      }),
      switchMap(projets => {
        if (projets.length === 0) {
          console.log('Aucun projet trouvé');
          return of([]);
        }

        console.log('Chargement des tableaux pour', projets.length, 'projets');
        const tableauxRequests = projets.map(projet =>
        this.apiService.getTableauxByProjet(projet.id).pipe(
            map(tableaux => ({
              ...projet,
              tableaux: tableaux || []
            })),
          catchError(error => {
              console.error(`Erreur pour les tableaux du projet ${projet.id}:`, error);
              return of({ ...projet, tableaux: [] });
          })
        )
      );
        return forkJoin(tableauxRequests);
      }),
      catchError(error => {
        console.error('Erreur globale:', error);
        return of([]);
      }),
      tap(() => {
        this.isLoading = false;
        console.log('Chargement terminé');
      })
    ).subscribe(
      projetsAvecTableaux => {
        console.log('Mise à jour du menu avec:', projetsAvecTableaux);
        this.lastUpdate = now;
        this.projetsCache$.next(projetsAvecTableaux as Projet[]);
        this.updateMenu(projetsAvecTableaux as Projet[]);
      },
      error => {
        console.error('Erreur lors du chargement des projets:', error);
        this.isLoading = false;
      }
    );
  }

  private updateMenu(projets: Projet[]) {
    console.log('Mise à jour du menu avec les projets:', projets);
    const projetMenuIndex = MENU_ITEMS.findIndex(item => item.title === 'Projet');
    if (projetMenuIndex === -1) {
      console.error('Menu Projet non trouvé dans MENU_ITEMS');
      return;
    }

    const projetMenu = {
      title: 'Projet',
      icon: 'folder-outline',
      children: [
        {
          title: 'Liste des projets',
          icon: 'list-outline',
          children: projets.map(projet => ({
            title: projet.nom,
            icon: 'folder-outline',
            children: [
              
              {
                title: 'Tableaux',
                icon: 'grid-outline',
                children: [
                  ...(projet.tableaux || []).map(tableau => ({
                      title: tableau.nom,
                    icon: 'file-text-outline',
                    link: `/pages/projet/${projet.id}/tableau/${tableau.id}`
                  })),
                  {
                    title: 'Tableau',
                    icon: 'plus-outline',
                    link: `/pages/projet/${projet.id}/tableau/nouveau`
                  }
                ]
              }
            ]
          }))
        },
          {
            title: 'Afficher tous les projets',
            icon: 'grid-outline',
          link: '/pages/projet'
          },
          {
            title: 'Ajouter un projet',
            icon: 'plus-outline',
            link: '/pages/projet/nouveau'
          }
      ]
    };

    console.log('Nouveau menu des projets:', projetMenu);
    MENU_ITEMS[projetMenuIndex] = projetMenu;
  }

  refreshCache() {
    this.lastUpdate = 0;
    this.updateProjetsMenu();
  }

  getProjetsCaches() {
    return this.projetsCache$.asObservable();
  }
} 