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
      totalEquipes: this.statistiqueService.getTotalEquipes()
    }).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (data) => {
        this.totalProjets = data.totalProjets;
        this.totalTaches = data.totalTaches;
        this.totalUtilisateurs = data.totalUtilisateurs;
        this.totalEquipes = data.totalEquipes;
        
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
    this.setupCharts();
  }

  private setupCharts(): void {
    this.setupPieChart();
    this.setupBarChart();
    this.setupLineChart();
    this.setupProgressChart();
  }

  private setupPieChart(): void {
    this.pieChartOption = {
      title: {
        text: 'Répartition des Tâches par Statut',
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
          data: [
            { value: Math.ceil(this.totalTaches * 0.3), name: 'En cours', itemStyle: { color: '#3366FF' } },
            { value: Math.ceil(this.totalTaches * 0.5), name: 'Terminées', itemStyle: { color: '#00D68F' } },
            { value: Math.ceil(this.totalTaches * 0.2), name: 'En attente', itemStyle: { color: '#FFAA00' } }
          ]
        }
      ]
    };
  }

  private setupBarChart(): void {
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
          data: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'],
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
          }
        }
      ],
      series: [
        {
          name: 'Projets',
          type: 'bar',
          barWidth: '60%',
          data: [2, 5, 3, 8, 4, 6],
          itemStyle: {
            color: '#3366FF'
          }
        }
      ]
    };
  }

  private setupLineChart(): void {
    this.lineChartOption = {
      title: {
        text: 'Planifications par jour',
        textStyle: {
          color: '#8f9bb3'
        }
      },
      tooltip: {
        trigger: 'axis'
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
        data: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
        axisLabel: {
          color: '#8f9bb3'
        }
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          color: '#8f9bb3'
        }
      },
      series: [
        {
          name: 'Planifications',
          type: 'line',
          stack: 'Total',
          data: [12, 13, 10, 13, 9, 23, 21],
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
        data: ['Projet E-commerce', 'App Mobile', 'Site Web', 'API REST', 'Dashboard'],
        axisLabel: {
          color: '#8f9bb3'
        }
      },
      series: [
        {
          name: 'Progression',
          type: 'bar',
          data: [85, 73, 95, 60, 40],
          itemStyle: {
            color: function(params: any) {
              const colors = ['#FF3D71', '#FFAA00', '#00D68F', '#3366FF', '#8A2BE2'];
              return colors[params.dataIndex];
            }
          }
        }
      ]
    };
  }
} 