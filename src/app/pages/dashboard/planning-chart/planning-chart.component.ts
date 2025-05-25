import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { EChartsOption } from 'echarts';

@Component({
  selector: 'ngx-planning-chart',
  template: `
    <nb-card class="chart-card">
      <nb-card-header>
        <h6>Planifications des 7 derniers jours</h6>
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
export class PlanningChartComponent implements OnChanges {
  @Input() data: { jour: string; count: number }[] | null = null;
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
    const days = this.data.map(item => item.jour);
    const values = this.data.map(item => item.count);

    this.chartOption = {
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
        type: 'category',
        data: days,
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
          name: 'Planifications',
          type: 'bar',
          data: values,
          itemStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: '#43e97b' },
                { offset: 1, color: '#38f9d7' }
              ]
            },
            borderRadius: [4, 4, 0, 0]
          },
          emphasis: {
            itemStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color: '#38f9d7' },
                  { offset: 1, color: '#43e97b' }
                ]
              }
            }
          }
        }
      ]
    };
  }
} 