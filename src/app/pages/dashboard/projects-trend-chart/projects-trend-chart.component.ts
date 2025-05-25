import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { EChartsOption } from 'echarts';

@Component({
  selector: 'ngx-projects-trend-chart',
  template: `
    <nb-card class="chart-card">
      <nb-card-header>
        <h6>Tendance des Projets (6 derniers mois)</h6>
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
export class ProjectsTrendChartComponent implements OnChanges {
  @Input() data: { mois: string; count: number }[] | null = null;
  @Input() isLoading: boolean = false;
  
  chartOption: EChartsOption = {};
  hasData = false;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data'] && this.data) {
      this.updateChart();
    }
  }

  private updateChart() {
    if (!this.data || this.data.length === 0) {
      this.hasData = false;
      return;
    }

    this.hasData = true;
    const months = this.data.map(item => item.mois);
    const values = this.data.map(item => item.count);

    this.chartOption = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          label: {
            backgroundColor: '#6a7985'
          }
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
        data: months,
        axisLabel: {
          color: '#8f9bb3'
        },
        axisLine: {
          lineStyle: {
            color: '#e4e9f2'
          }
        }
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          color: '#8f9bb3'
        },
        axisLine: {
          lineStyle: {
            color: '#e4e9f2'
          }
        },
        splitLine: {
          lineStyle: {
            color: '#e4e9f2'
          }
        }
      },
      series: [
        {
          name: 'Projets créés',
          type: 'line',
          stack: 'Total',
          smooth: true,
          lineStyle: {
            width: 3,
            color: '#667eea'
          },
          areaStyle: {
            opacity: 0.3,
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: '#667eea' },
                { offset: 1, color: 'rgba(102, 126, 234, 0.1)' }
              ]
            }
          },
          emphasis: {
            focus: 'series'
          },
          data: values
        }
      ]
    };
  }
} 