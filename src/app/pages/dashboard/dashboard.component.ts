import { Component, OnDestroy, OnInit } from '@angular/core';
import { DashboardService } from '../../services/dashboard.service';
import { StatistiquesData } from '../../services/statistique.service';
import { takeWhile } from 'rxjs/operators';

interface RecentActivity {
  type: string;
  description: string;
  time: Date;
  icon: string;
  color: string;
}

@Component({
  selector: 'ngx-dashboard',
  styleUrls: ['./dashboard.component.scss'],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit, OnDestroy {
  private alive = true;
  
  statistiques: StatistiquesData | null = null;
  loading = true;
  error: string | null = null;
  lastUpdate: Date | null = null;
  
  recentActivities: RecentActivity[] = [
    {
      type: 'Projet',
      description: 'Nouveau projet créé: "Application Mobile"',
      time: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      icon: 'folder-outline',
      color: 'primary'
    },
    {
      type: 'Tâche',
      description: 'Tâche "Développement API" terminée',
      time: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      icon: 'checkmark-square-outline',
      color: 'success'
    },
    {
      type: 'Équipe',
      description: 'Nouvel utilisateur ajouté à l\'équipe Alpha',
      time: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      icon: 'people-outline',
      color: 'info'
    },
    {
      type: 'Planification',
      description: 'Nouvelle planification créée pour demain',
      time: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      icon: 'calendar-outline',
      color: 'warning'
    }
  ];

  constructor(private dashboardService: DashboardService) {}

  ngOnInit() {
    // S'abonner aux données du dashboard
    this.dashboardService.getStatistiques()
      .pipe(takeWhile(() => this.alive))
      .subscribe(data => {
        this.statistiques = data;
        console.log('📊 Dashboard - Statistiques reçues:', data);
      });

    // S'abonner à l'état de chargement
    this.dashboardService.isLoading()
      .pipe(takeWhile(() => this.alive))
      .subscribe(isLoading => {
        this.loading = isLoading;
        console.log('⏳ Dashboard - État chargement:', isLoading);
      });

    // S'abonner aux erreurs
    this.dashboardService.getError()
      .pipe(takeWhile(() => this.alive))
      .subscribe(error => {
        this.error = error;
        console.log('❌ Dashboard - Erreur:', error);
      });

    // S'abonner à la date de dernière mise à jour
    this.dashboardService.getLastUpdate()
      .pipe(takeWhile(() => this.alive))
      .subscribe(lastUpdate => {
        this.lastUpdate = lastUpdate;
        console.log('🕒 Dashboard - Dernière mise à jour:', lastUpdate);
      });
  }

  // Méthode pour forcer l'actualisation
  refreshStats(): void {
    console.log('🔄 Actualisation manuelle des statistiques...');
    this.dashboardService.refreshData();
  }

  // Méthode utilitaire pour formater la dernière mise à jour
  getLastUpdateText(): string {
    if (!this.lastUpdate) return '';
    
    const now = new Date();
    const diffMs = now.getTime() - this.lastUpdate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Mis à jour à l\'instant';
    if (diffMins < 60) return `Mis à jour il y a ${diffMins} min`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Mis à jour il y a ${diffHours}h`;
    
    return `Mis à jour le ${this.lastUpdate.toLocaleDateString()}`;
  }

  ngOnDestroy() {
    this.alive = false;
  }
}
