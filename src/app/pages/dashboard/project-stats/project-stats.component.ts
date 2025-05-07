import { Component, OnDestroy, OnInit } from '@angular/core';
import { ProjectStats, ProjectStatsService } from '../../../@core/data/project-stats';
import { takeWhile } from 'rxjs/operators';

@Component({
  selector: 'ngx-project-stats',
  template: `
    <nb-card>
      <nb-card-header>
        Vue d'ensemble des Projets
      </nb-card-header>
      <nb-card-body>
        <div class="row">
          <div class="col-sm-6 col-md-3">
            <div class="stat-card">
              <div class="title">Tâches Totales</div>
              <div class="value">{{ stats?.totalTasks }}</div>
            </div>
          </div>
          <div class="col-sm-6 col-md-3">
            <div class="stat-card">
              <div class="title">Tâches Terminées</div>
              <div class="value">{{ stats?.completedTasks }}</div>
            </div>
          </div>
          <div class="col-sm-6 col-md-3">
            <div class="stat-card">
              <div class="title">Tâches en Retard</div>
              <div class="value warning">{{ stats?.lateTasks }}</div>
            </div>
          </div>
          <div class="col-sm-6 col-md-3">
            <div class="stat-card">
              <div class="title">Tâches en Cours</div>
              <div class="value info">{{ stats?.inProgressTasks }}</div>
            </div>
          </div>
        </div>

        <div class="row mt-4">
          <div class="col-sm-6 col-md-4">
            <div class="stat-card">
              <div class="title">Projets Actifs</div>
              <div class="value success">{{ stats?.activeProjects }}</div>
            </div>
          </div>
          <div class="col-sm-6 col-md-4">
            <div class="stat-card">
              <div class="title">Projets Terminés</div>
              <div class="value">{{ stats?.completedProjects }}</div>
            </div>
          </div>
          <div class="col-sm-12 col-md-4">
            <div class="stat-card">
              <div class="title">Équipe la Plus Active</div>
              <div class="value primary">{{ stats?.mostActiveTeam }}</div>
            </div>
          </div>
        </div>

        <div class="row mt-4">
          <div class="col-12">
            <div class="stat-card">
              <div class="title">Temps Moyen de Complétion</div>
              <div class="value">{{ stats?.averageTaskCompletionTime }} jours</div>
            </div>
          </div>
        </div>
      </nb-card-body>
    </nb-card>
  `,
  styles: [`
    .stat-card {
      padding: 1rem;
      text-align: center;
      background: nb-theme(card-background-color);
      border-radius: 0.5rem;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .title {
      color: nb-theme(text-hint-color);
      font-size: 0.875rem;
      margin-bottom: 0.5rem;
    }
    .value {
      font-size: 1.5rem;
      font-weight: bold;
      color: nb-theme(text-basic-color);
    }
    .value.warning {
      color: nb-theme(color-danger-default);
    }
    .value.success {
      color: nb-theme(color-success-default);
    }
    .value.info {
      color: nb-theme(color-info-default);
    }
    .value.primary {
      color: nb-theme(color-primary-default);
    }
    .mt-4 {
      margin-top: 1.5rem;
    }
  `],
})
export class ProjectStatsComponent implements OnInit, OnDestroy {
  private alive = true;
  stats: ProjectStats;

  constructor(private projectStatsService: ProjectStatsService) {}

  ngOnInit() {
    this.projectStatsService.getProjectStats()
      .pipe(takeWhile(() => this.alive))
      .subscribe(stats => {
        this.stats = stats;
      });
  }

  ngOnDestroy() {
    this.alive = false;
  }
} 