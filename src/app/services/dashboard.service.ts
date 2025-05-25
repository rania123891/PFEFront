import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, combineLatest, interval } from 'rxjs';
import { map, catchError, startWith, switchMap } from 'rxjs/operators';
import { StatistiqueService, StatistiquesData } from './statistique.service';

export interface DashboardData {
  statistiques: StatistiquesData | null;
  lastUpdate: Date;
  error: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private dataSubject = new BehaviorSubject<DashboardData>({
    statistiques: null,
    lastUpdate: new Date(),
    error: null
  });

  public data$ = this.dataSubject.asObservable();

  constructor(private statistiqueService: StatistiqueService) {
    this.initializeRealTimeUpdates();
  }

  private initializeRealTimeUpdates() {
    // Actualiser les données toutes les 5 minutes
    const updateInterval = interval(5 * 60 * 1000).pipe(startWith(0));

    updateInterval.pipe(
      switchMap(() => this.loadAllData())
    ).subscribe({
      next: (statistiques) => {
        this.dataSubject.next({
          statistiques,
          lastUpdate: new Date(),
          error: null
        });
      },
      error: (error) => {
        console.error('Erreur lors du chargement des données dashboard:', error);
        this.dataSubject.next({
          statistiques: null,
          lastUpdate: new Date(),
          error: 'Erreur lors du chargement des données'
        });
      }
    });
  }

  private loadAllData(): Observable<StatistiquesData> {
    return this.statistiqueService.getStatistiques().pipe(
      catchError((error) => {
        console.error('Erreur API statistiques:', error);
        
        // Données de fallback en cas d'erreur
        const fallbackData: StatistiquesData = {
          totalProjets: 0,
          totalTaches: 0,
          totalUtilisateurs: 0,
          totalEquipes: 0,
          tachesParStatut: {
            'En cours': 12,
            'Terminé': 8,
            'En attente': 5,
            'En retard': 3
          },
          projetsParMois: [
            { mois: '01/2024', count: 3 },
            { mois: '02/2024', count: 5 },
            { mois: '03/2024', count: 7 },
            { mois: '04/2024', count: 4 },
            { mois: '05/2024', count: 8 },
            { mois: '06/2024', count: 6 }
          ],
          planificationsParJour: [
            { jour: '01/06', count: 4 },
            { jour: '02/06', count: 2 },
            { jour: '03/06', count: 6 },
            { jour: '04/06', count: 3 },
            { jour: '05/06', count: 5 },
            { jour: '06/06', count: 7 },
            { jour: '07/06', count: 4 }
          ],
          progressionProjets: [
            { nom: 'Projet Alpha', progression: 85 },
            { nom: 'Projet Beta', progression: 67 },
            { nom: 'Projet Gamma', progression: 42 },
            { nom: 'Projet Delta', progression: 91 },
            { nom: 'Projet Epsilon', progression: 23 }
          ]
        };
        
        return [fallbackData];
      })
    );
  }

  // Méthode pour forcer une actualisation manuelle
  refreshData(): void {
    this.loadAllData().subscribe({
      next: (statistiques) => {
        this.dataSubject.next({
          statistiques,
          lastUpdate: new Date(),
          error: null
        });
      },
      error: (error) => {
        console.error('Erreur lors de l\'actualisation:', error);
        this.dataSubject.next({
          statistiques: this.dataSubject.value.statistiques,
          lastUpdate: new Date(),
          error: 'Erreur lors de l\'actualisation'
        });
      }
    });
  }

  // Méthodes utilitaires pour les composants
  getStatistiques(): Observable<StatistiquesData | null> {
    return this.data$.pipe(map(data => data.statistiques));
  }

  getLastUpdate(): Observable<Date> {
    return this.data$.pipe(map(data => data.lastUpdate));
  }

  getError(): Observable<string | null> {
    return this.data$.pipe(map(data => data.error));
  }

  isLoading(): Observable<boolean> {
    return this.data$.pipe(map(data => data.statistiques === null && data.error === null));
  }
} 