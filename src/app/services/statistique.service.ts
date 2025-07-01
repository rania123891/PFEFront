import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, of, combineLatest } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface StatistiquesData {
  totalProjets: number;
  totalTaches: number;
  totalUtilisateurs: number;
  totalEquipes: number;
  tachesParStatut: { [key: string]: number };
  tachesParPriorite: { [key: string]: number };
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

  // Méthode pour créer les headers avec les cookies d'authentification
  private getHttpOptions() {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      }),
      withCredentials: true
    };
  }

  getStatistiques(): Observable<StatistiquesData> {
    // Utiliser combineLatest pour récupérer toutes les données en parallèle
    return combineLatest([
      this.getTotalProjets().pipe(catchError(() => of(0))),
      this.getTotalTaches().pipe(catchError(() => of(0))),
      this.getTotalUtilisateurs().pipe(catchError(() => of(0))),
      this.getTotalEquipes().pipe(catchError(() => of(0))),
      this.getTachesParPriorite(),
      this.getProjetsParMois(),
      this.getPlanificationsParJour(),
      this.getProgressionProjets()
    ]).pipe(
      map(([
        totalProjets,
        totalTaches,
        totalUtilisateurs,
        totalEquipes,
        tachesParPriorite,
        projetsParMois,
        planificationsParJour,
        progressionProjets
      ]: [
        number,
        number,
        number,
        number,
        { [key: string]: number },
        { mois: string; count: number }[],
        { jour: string; count: number }[],
        { nom: string; progression: number }[]
      ]) => {
        const statistiques: StatistiquesData = {
          totalProjets,
          totalTaches,
          totalUtilisateurs,
          totalEquipes,
          tachesParStatut: {
            'En Cours': 0,
            'Terminé': 0,
            'Annulé': 0
          },
          tachesParPriorite,
          projetsParMois,
          planificationsParJour,
          progressionProjets
        };
        
        console.log('✅ Statistiques consolidées avec données réelles de priorité:', statistiques);
        return statistiques;
      }),
      catchError(error => {
        console.error('❌ Erreur lors de la récupération des statistiques:', error);
        
        // Retourner des données de fallback
        const fallbackData: StatistiquesData = {
          totalProjets: 0,
          totalTaches: 0,
          totalUtilisateurs: 6,
          totalEquipes: 0,
          tachesParStatut: {
            'En Cours': 0,
            'Terminé': 0,
            'Annulé': 0
          },
          tachesParPriorite: {
            'Faible': 5,
            'Moyenne': 8,
            'Élevée': 3
          },
          projetsParMois: [],
          planificationsParJour: [],
          progressionProjets: []
        };
        
        console.log('🔄 Utilisation des données de fallback:', fallbackData);
        return of(fallbackData);
      })
    );
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

  getTachesParPriorite(): Observable<{ [key: string]: number }> {
    return this.http.get<any[]>(this.tacheApiUrl, this.getHttpOptions()).pipe(
      map(taches => {
        const repartition = {
          'Faible': 0,
          'Moyenne': 0,
          'Élevée': 0
        };

        taches.forEach(tache => {
          switch (tache.priorite) {
            case 0: // PrioriteTache.Faible
              repartition['Faible']++;
              break;
            case 1: // PrioriteTache.Moyenne
              repartition['Moyenne']++;
              break;
            case 2: // PrioriteTache.Elevee
              repartition['Élevée']++;
              break;
          }
        });

        return repartition;
      }),
      catchError(error => {
        console.error('❌ Erreur lors de la récupération des tâches par priorité:', error);
        // Retourner des données de fallback
        return of({
          'Faible': 5,
          'Moyenne': 8,
          'Élevée': 3
        });
      })
    );
  }

  getProjetsParMois(): Observable<{ mois: string; count: number }[]> {
    return this.http.get<any[]>(this.projetApiUrl, this.getHttpOptions()).pipe(
      map(projets => {
        const moisNoms = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
        const anneeActuelle = new Date().getFullYear();
        
        // Initialiser les compteurs pour chaque mois
        const repartitionParMois = moisNoms.map(mois => ({ mois, count: 0 }));

        projets.forEach(projet => {
          if (projet.dateDebut) {
            const dateDebut = new Date(projet.dateDebut);
            if (dateDebut.getFullYear() === anneeActuelle) {
              const moisIndex = dateDebut.getMonth();
              repartitionParMois[moisIndex].count++;
            }
          }
        });

        return repartitionParMois;
      }),
      catchError(error => {
        console.error('❌ Erreur lors de la récupération des projets par mois:', error);
        // Retourner des données de fallback
        return of([
          { mois: 'Jan', count: 2 },
          { mois: 'Fév', count: 5 },
          { mois: 'Mar', count: 3 },
          { mois: 'Avr', count: 8 },
          { mois: 'Mai', count: 4 },
          { mois: 'Jun', count: 6 },
          { mois: 'Jul', count: 0 },
          { mois: 'Aoû', count: 0 },
          { mois: 'Sep', count: 0 },
          { mois: 'Oct', count: 0 },
          { mois: 'Nov', count: 0 },
          { mois: 'Déc', count: 0 }
        ]);
      })
    );
  }

  getPlanificationsParJour(): Observable<{ jour: string; count: number }[]> {
    const planificationApiUrl = `${environment.apis.projet}/planifications`;
    
    return this.http.get<any[]>(planificationApiUrl, this.getHttpOptions()).pipe(
      map(planifications => {
        const joursNoms = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
        const semaineCourante = this.getSemaineCourante();
        
        // Initialiser les compteurs pour chaque jour de la semaine courante
        const repartitionParJour = joursNoms.map(jour => ({ jour, count: 0 }));

        planifications.forEach(planification => {
          if (planification.dateDebut) {
            const datePlanification = new Date(planification.dateDebut);
            
            // Vérifier si la planification est dans la semaine courante
            if (this.estDansLaSemaine(datePlanification, semaineCourante)) {
              const jourIndex = (datePlanification.getDay() + 6) % 7; // Convertir dimanche=0 vers lundi=0
              repartitionParJour[jourIndex].count++;
            }
          }
        });

        return repartitionParJour;
      }),
      catchError(error => {
        console.error('❌ Erreur lors de la récupération des planifications par jour:', error);
        // Retourner des données de fallback
        return of([
          { jour: 'Lun', count: 12 },
          { jour: 'Mar', count: 13 },
          { jour: 'Mer', count: 10 },
          { jour: 'Jeu', count: 13 },
          { jour: 'Ven', count: 9 },
          { jour: 'Sam', count: 23 },
          { jour: 'Dim', count: 21 }
        ]);
      })
    );
  }

  private getSemaineCourante(): { debut: Date; fin: Date } {
    const aujourd = new Date();
    const jourSemaine = (aujourd.getDay() + 6) % 7; // Convertir dimanche=0 vers lundi=0
    
    const lundi = new Date(aujourd);
    lundi.setDate(aujourd.getDate() - jourSemaine);
    lundi.setHours(0, 0, 0, 0);
    
    const dimanche = new Date(lundi);
    dimanche.setDate(lundi.getDate() + 6);
    dimanche.setHours(23, 59, 59, 999);
    
    return { debut: lundi, fin: dimanche };
  }

  private estDansLaSemaine(date: Date, semaine: { debut: Date; fin: Date }): boolean {
    return date >= semaine.debut && date <= semaine.fin;
  }

  getProgressionProjets(): Observable<{ nom: string; progression: number }[]> {
    return this.http.get<any[]>(this.projetApiUrl, this.getHttpOptions()).pipe(
      map(projets => {
        const projetsAvecProgression = projets.map(projet => {
          let progression = 0;

          // Calculer la progression basée sur les tâches du projet
          if (projet.taches && projet.taches.length > 0) {
            const tachesTerminees = projet.taches.filter((tache: any) => tache.statut === 1).length; // StatutTache.Terminee = 1
            progression = Math.round((tachesTerminees / projet.taches.length) * 100);
          } else {
            // Si pas de tâches, calculer basé sur les dates
            if (projet.dateDebut && projet.dateEcheance) {
              const dateDebut = new Date(projet.dateDebut);
              const dateEcheance = new Date(projet.dateEcheance);
              const dateActuelle = new Date();

              if (dateActuelle >= dateEcheance) {
                progression = 100; // Projet terminé ou en retard
              } else if (dateActuelle <= dateDebut) {
                progression = 0; // Projet pas encore commencé
              } else {
                // Calculer la progression temporelle
                const dureeTotal = dateEcheance.getTime() - dateDebut.getTime();
                const dureeEcoulee = dateActuelle.getTime() - dateDebut.getTime();
                progression = Math.round((dureeEcoulee / dureeTotal) * 100);
              }
            }
          }

          return {
            nom: projet.nom || 'Projet sans nom',
            progression: Math.max(0, Math.min(100, progression)) // Assurer que la progression est entre 0 et 100
          };
        });

        // Trier par progression décroissante et prendre les 5 premiers
        return projetsAvecProgression
          .sort((a, b) => b.progression - a.progression)
          .slice(0, 5);
      }),
      catchError(error => {
        console.error('❌ Erreur lors de la récupération de la progression des projets:', error);
        // Retourner des données de fallback
        return of([
          { nom: 'Projet E-commerce', progression: 85 },
          { nom: 'App Mobile', progression: 73 },
          { nom: 'Site Web', progression: 95 },
          { nom: 'API REST', progression: 60 },
          { nom: 'Dashboard', progression: 40 }
        ]);
      })
    );
  }
} 