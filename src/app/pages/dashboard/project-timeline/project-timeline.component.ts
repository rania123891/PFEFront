import { Component, OnDestroy, OnInit } from '@angular/core';
import { ProjectTimeline, ProjectStatsService } from '../../../@core/data/project-stats';
import { takeWhile } from 'rxjs/operators';
import { NbThemeService } from '@nebular/theme';

@Component({
  selector: 'ngx-project-timeline',
  template: `
    <nb-card>
      <nb-card-header class="d-flex justify-content-between align-items-center">
        <span>Timeline des Projets</span>
        <nb-select [(selected)]="selectedPeriod" (selectedChange)="onPeriodChange($event)">
          <nb-option value="day">Jour</nb-option>
          <nb-option value="week">Semaine</nb-option>
          <nb-option value="month">Mois</nb-option>
        </nb-select>
      </nb-card-header>
      <nb-card-body>
        <div echarts [options]="options" class="echart"></div>
      </nb-card-body>
    </nb-card>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
    }
    .echart {
      width: 100%;
      height: 400px;
    }
  `],
})
export class ProjectTimelineComponent implements OnInit, OnDestroy {
  private alive = true;
  options: any = {};
  selectedPeriod = 'week';
  timeline: ProjectTimeline[] = [];

  constructor(
    private projectStatsService: ProjectStatsService,
    private theme: NbThemeService,
  ) {}

  ngOnInit() {
    this.projectStatsService.getProjectTimeline()
      .pipe(takeWhile(() => this.alive))
      .subscribe(timeline => {
        this.timeline = timeline;
        this.updateChartOptions();
      });
  }

  onPeriodChange(period: string) {
    this.selectedPeriod = period;
    this.updateChartOptions();
  }

  private updateChartOptions() {
    const colors = {
      completed: '#00d68f',
      inProgress: '#0095ff',
      late: '#ff3d71',
    };

    const series = this.timeline.map(project => ({
      name: project.projectName,
      type: 'bar',
      stack: 'total',
      data: [{
        value: [
          new Date(project.startDate),
          new Date(project.endDate),
        ],
        itemStyle: {
          color: this.getProjectColor(project.progress),
        },
      }],
    }));

    this.options = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
        formatter: (params) => {
          const data = params[0];
          const project = this.timeline[data.seriesIndex];
          return `
            <strong>${project.projectName}</strong><br/>
            Début: ${new Date(project.startDate).toLocaleDateString()}<br/>
            Fin: ${new Date(project.endDate).toLocaleDateString()}<br/>
            Progression: ${project.progress}%
          `;
        },
      },
      grid: {
        top: 20,
        bottom: 30,
        left: 100,
        right: 20,
      },
      xAxis: {
        type: 'time',
        axisLabel: {
          formatter: (value) => new Date(value).toLocaleDateString(),
        },
      },
      yAxis: {
        type: 'category',
        data: this.timeline.map(p => p.projectName),
      },
      series,
    };
  }

  private getProjectColor(progress: number): string {
    if (progress >= 100) return '#00d68f';
    if (progress >= 50) return '#0095ff';
    return '#ff3d71';
  }

  ngOnDestroy() {
    this.alive = false;
  }
} 