import { Component, OnInit, OnDestroy } from '@angular/core';
import { StatistiqueService, StatistiquesData } from '../../services/statistique.service';
import { Subject, forkJoin } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { EChartsOption } from 'echarts';

@Component({
  selector: 'ngx-statistique',
  templateUrl: './statistique.component.html',
  styleUrls: ['./statistique.component.scss']
})
export class StatistiqueComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // Données de base
  totalProjets = 0;
  totalTaches = 0;
  totalUtilisateurs = 0;
  totalEquipes = 0;
  
  // Données pour les graphiques
  tachesParPriorite: { [key: string]: number } = {};
  projetsParMois: { mois: string; count: number }[] = [];
  planificationsParJour: { jour: string; count: number }[] = [];
  progressionProjets: { nom: string; progression: number }[] = [];
  
  loading = true;
  currentDate = new Date();
  
  // Options pour les graphiques ECharts
  pieChartOption: EChartsOption = {};
  barChartOption: EChartsOption = {};
  lineChartOption: EChartsOption = {};
  progressChartOption: EChartsOption = {};

  constructor(private statistiqueService: StatistiqueService) { }

  ngOnInit(): void {
    this.loadStatistiques();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadStatistiques(): void {
    this.loading = true;
    
    // Chargement parallèle des données
    forkJoin({
      totalProjets: this.statistiqueService.getTotalProjets(),
      totalTaches: this.statistiqueService.getTotalTaches(),
      totalUtilisateurs: this.statistiqueService.getTotalUtilisateurs(),
      totalEquipes: this.statistiqueService.getTotalEquipes(),
      tachesParPriorite: this.statistiqueService.getTachesParPriorite(),
      projetsParMois: this.statistiqueService.getProjetsParMois(),
      planificationsParJour: this.statistiqueService.getPlanificationsParJour(),
      progressionProjets: this.statistiqueService.getProgressionProjets()
    }).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (data) => {
        this.totalProjets = data.totalProjets;
        this.totalTaches = data.totalTaches;
        this.totalUtilisateurs = data.totalUtilisateurs;
        this.totalEquipes = data.totalEquipes;
        this.tachesParPriorite = data.tachesParPriorite;
        this.projetsParMois = data.projetsParMois;
        this.planificationsParJour = data.planificationsParJour;
        this.progressionProjets = data.progressionProjets;
        
        this.setupCharts();
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des statistiques:', error);
        // Utiliser des données de démonstration en cas d'erreur
        this.loadDemoData();
        this.loading = false;
      }
    });
  }

  private loadDemoData(): void {
    this.totalProjets = 15;
    this.totalTaches = 45;
    this.totalUtilisateurs = 12;
    this.totalEquipes = 5;
    this.tachesParPriorite = {
      'Faible': 12,
      'Moyenne': 20,
      'Élevée': 13
    };
    this.projetsParMois = [
      { mois: 'Jan', count: 2 },
      { mois: 'Fév', count: 5 },
      { mois: 'Mar', count: 3 },
      { mois: 'Avr', count: 8 },
      { mois: 'Mai', count: 4 },
      { mois: 'Jun', count: 6 }
    ];
    this.planificationsParJour = [
      { jour: 'Lun', count: 12 },
      { jour: 'Mar', count: 13 },
      { jour: 'Mer', count: 10 },
      { jour: 'Jeu', count: 13 },
      { jour: 'Ven', count: 9 },
      { jour: 'Sam', count: 23 },
      { jour: 'Dim', count: 21 }
    ];
    this.progressionProjets = [
      { nom: 'Projet E-commerce', progression: 85 },
      { nom: 'App Mobile', progression: 73 },
      { nom: 'Site Web', progression: 95 },
      { nom: 'API REST', progression: 60 },
      { nom: 'Dashboard', progression: 40 }
    ];
    this.setupCharts();
  }

  private setupCharts(): void {
    this.setupPieChart();
    this.setupBarChart();
    this.setupLineChart();
    this.setupProgressChart();
  }

  private setupPieChart(): void {
    // Convertir les données de priorité en format pour le graphique
    const chartData = Object.entries(this.tachesParPriorite).map(([priorite, count]) => {
      let color = '#8f9bb3'; // couleur par défaut
      
      switch (priorite) {
        case 'Élevée':
          color = '#FF3D71'; // Rouge pour priorité élevée
          break;
        case 'Moyenne':
          color = '#FFAA00'; // Orange pour priorité moyenne
          break;
        case 'Faible':
          color = '#00D68F'; // Vert pour priorité faible
          break;
      }
      
      return {
        value: count,
        name: priorite,
        itemStyle: { color }
      };
    });

    this.pieChartOption = {
      title: {
        text: 'Répartition des Tâches par Priorité',
        left: 'center',
        textStyle: {
          color: '#8f9bb3'
        }
      },
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        bottom: '0%',
        textStyle: {
          color: '#8f9bb3'
        }
      },
      series: [
        {
          name: 'Tâches',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: '30',
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: chartData
        }
      ]
    };
  }

  private setupBarChart(): void {
    // Extraire les données réelles des projets par mois
    const moisLabels = this.projetsParMois.map(item => item.mois);
    const projetsData = this.projetsParMois.map(item => item.count);

    this.barChartOption = {
      title: {
        text: 'Projets créés par mois',
        textStyle: {
          color: '#8f9bb3'
        }
      },
      color: ['#3398DB'],
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        formatter: function (params: any) {
          const data = params[0];
          return `${data.name}<br/>${data.seriesName}: ${data.value} projet${data.value > 1 ? 's' : ''}`;
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: [
        {
          type: 'category',
          data: moisLabels,
          axisLabel: {
            color: '#8f9bb3'
          }
        }
      ],
      yAxis: [
        {
          type: 'value',
          axisLabel: {
            color: '#8f9bb3'
          },
          minInterval: 1 // Assurer que l'axe Y affiche des nombres entiers
        }
      ],
      series: [
        {
          name: 'Projets',
          type: 'bar',
          barWidth: '60%',
          data: projetsData,
          itemStyle: {
            color: '#3366FF'
          }
        }
      ]
    };
  }

  private setupLineChart(): void {
    // Extraire les données réelles des planifications par jour
    const joursLabels = this.planificationsParJour.map(item => item.jour);
    const planificationsData = this.planificationsParJour.map(item => item.count);

    this.lineChartOption = {
      title: {
        text: 'Planifications par jour',
        textStyle: {
          color: '#8f9bb3'
        }
      },
      tooltip: {
        trigger: 'axis',
        formatter: function (params: any) {
          const data = params[0];
          return `${data.name}<br/>${data.seriesName}: ${data.value} planification${data.value > 1 ? 's' : ''}`;
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: joursLabels,
        axisLabel: {
          color: '#8f9bb3'
        }
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          color: '#8f9bb3'
        },
        minInterval: 1 // Assurer que l'axe Y affiche des nombres entiers
      },
      series: [
        {
          name: 'Planifications',
          type: 'line',
          stack: 'Total',
          data: planificationsData,
          itemStyle: {
            color: '#00D68F'
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [{
                offset: 0, color: 'rgba(0, 214, 143, 0.8)'
              }, {
                offset: 1, color: 'rgba(0, 214, 143, 0.1)'
              }]
            }
          }
        }
      ]
    };
  }

  private setupProgressChart(): void {
    // Extraire les données réelles de progression des projets
    const nomsProjet = this.progressionProjets.map(item => item.nom);
    const progressionsData = this.progressionProjets.map(item => item.progression);

    this.progressChartOption = {
      title: {
        text: 'Progression des Projets',
        textStyle: {
          color: '#8f9bb3'
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        formatter: function (params: any) {
          const data = params[0];
          return `${data.name}<br/>${data.seriesName}: ${data.value}%`;
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'value',
        max: 100,
        axisLabel: {
          color: '#8f9bb3',
          formatter: '{value}%'
        }
      },
      yAxis: {
        type: 'category',
        data: nomsProjet,
        axisLabel: {
          color: '#8f9bb3'
        }
      },
      series: [
        {
          name: 'Progression',
          type: 'bar',
          data: progressionsData,
          itemStyle: {
            color: function(params: any) {
              // Couleur basée sur le pourcentage de progression
              const progression = params.value;
              if (progression >= 90) return '#00D68F'; // Vert pour très avancé
              if (progression >= 70) return '#3366FF'; // Bleu pour bien avancé
              if (progression >= 50) return '#FFAA00'; // Orange pour moyennement avancé
              if (progression >= 30) return '#FF9F43'; // Orange foncé pour peu avancé
              return '#FF3D71'; // Rouge pour très peu avancé
            }
          }
        }
      ]
    };
  }
} 