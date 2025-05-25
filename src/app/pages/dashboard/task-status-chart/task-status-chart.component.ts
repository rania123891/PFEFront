import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { EChartsOption } from 'echarts';

@Component({
  selector: 'ngx-task-status-chart',
  template: `
    <nb-card class="chart-card">
      <nb-card-header>
        <h6>Répartition des Tâches par Statut</h6>
      </nb-card-header>
      <nb-card-body>
        <div *ngIf="isLoading" class="loading-container">
          <nb-spinner size="large"></nb-spinner>
          <p>Chargement des données...</p>
        </div>
        <div *ngIf="!isLoading && hasData" class="chart-container">
          <ngx-echarts [options]="chartOption" [loading]="isLoading"></ngx-echarts>
        </div>
        <div *ngIf="!isLoading && !hasData" class="no-data">
          <nb-icon icon="info-outline"></nb-icon>
          <p>Aucune donnée disponible</p>
        </div>
      </nb-card-body>
    </nb-card>
  `,
  styles: [`
    .chart-card {
      height: 400px;
    }
    
    .chart-container {
      height: 300px;
    }
    
    .loading-container, .no-data {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 300px;
      color: #8f9bb3;
    }
    
    .loading-container p, .no-data p {
      margin-top: 1rem;
      font-size: 0.875rem;
    }
    
    .no-data nb-icon {
      font-size: 3rem;
      opacity: 0.5;
    }
  `]
})
export class TaskStatusChartComponent implements OnChanges {
  @Input() data: { [key: string]: number } | null = null;
  @Input() isLoading: boolean = false;
  
  chartOption: EChartsOption = {};
  hasData = false;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data'] && this.data) {
      this.updateChart();
    }
  }

  private updateChart() {
    if (!this.data || Object.keys(this.data).length === 0) {
      this.hasData = false;
      return;
    }

    this.hasData = true;
    const chartData = Object.entries(this.data).map(([key, value]) => ({
      name: key,
      value: value
    }));

    this.chartOption = {
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        textStyle: {
          color: '#8f9bb3'
        }
      },
      series: [
        {
          name: 'Statut des Tâches',
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['60%', '50%'],
          avoidLabelOverlap: false,
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: '18',
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: chartData,
          itemStyle: {
            color: (params: any) => {
              const colors = ['#667eea', '#4facfe', '#43e97b', '#fa709a', '#ff9a9e'];
              return colors[params.dataIndex % colors.length];
            }
          }
        }
      ]
    };
  }
} 