import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

interface ProjectProgress {
  nom: string;
  progression: number;
}

@Component({
  selector: 'ngx-projects-progress',
  template: `
    <nb-card class="progress-card">
      <nb-card-header>
        <h6>Progression des Projets</h6>
        <small>Top 5 des projets en cours</small>
      </nb-card-header>
      <nb-card-body>
        <div *ngIf="isLoading" class="loading-container">
          <nb-spinner size="large"></nb-spinner>
          <p>Chargement des données...</p>
        </div>
        <div *ngIf="!isLoading && hasData" class="projects-list">
          <div 
            *ngFor="let project of projects; let i = index" 
            class="project-item"
            [style.animation-delay]="i * 0.1 + 's'">
            <div class="project-info">
              <div class="project-name">{{ project.nom }}</div>
              <div class="project-percentage">{{ project.progression }}%</div>
            </div>
            <div class="progress-bar-container">
              <div 
                class="progress-bar" 
                [style.width.%]="project.progression"
                [ngClass]="getProgressClass(project.progression)">
              </div>
            </div>
          </div>
        </div>
        <div *ngIf="!isLoading && !hasData" class="no-data">
          <nb-icon icon="folder-outline"></nb-icon>
          <p>Aucun projet en cours</p>
        </div>
      </nb-card-body>
    </nb-card>
  `,
  styles: [`
    .progress-card {
      min-height: 350px;
    }
    
    nb-card-header {
      border-bottom: 1px solid #e4e9f2;
    }
    
    nb-card-header small {
      color: #8f9bb3;
      font-size: 0.75rem;
      display: block;
      margin-top: 0.25rem;
    }
    
    .loading-container, .no-data {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 250px;
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
    
    .projects-list {
      padding: 1rem 0;
    }
    
    .project-item {
      margin-bottom: 2rem;
      opacity: 0;
      animation: slideIn 0.6s ease forwards;
    }
    
    .project-item:last-child {
      margin-bottom: 0;
    }
    
    .project-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
    }
    
    .project-name {
      font-weight: 600;
      color: #2c2c54;
      font-size: 0.9rem;
      flex: 1;
    }
    
    .project-percentage {
      font-weight: 700;
      font-size: 0.9rem;
      color: #667eea;
    }
    
    .progress-bar-container {
      height: 8px;
      background: #e4e9f2;
      border-radius: 4px;
      overflow: hidden;
      position: relative;
    }
    
    .progress-bar {
      height: 100%;
      border-radius: 4px;
      transition: width 1s ease;
      position: relative;
      overflow: hidden;
    }
    
    .progress-bar::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
      animation: shimmer 2s infinite;
    }
    
    .progress-low {
      background: linear-gradient(90deg, #ff9a9e 0%, #fecfef 100%);
    }
    
    .progress-medium {
      background: linear-gradient(90deg, #fa709a 0%, #fee140 100%);
    }
    
    .progress-high {
      background: linear-gradient(90deg, #43e97b 0%, #38f9d7 100%);
    }
    
    .progress-complete {
      background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
    }
    
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateX(-30px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
    
    @keyframes shimmer {
      0% {
        left: -100%;
      }
      100% {
        left: 100%;
      }
    }
  `]
})
export class ProjectsProgressComponent implements OnChanges {
  @Input() projects: ProjectProgress[] | null = null;
  @Input() isLoading: boolean = false;
  
  hasData = false;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['projects']) {
      this.hasData = this.projects && this.projects.length > 0;
    }
  }

  getProgressClass(progression: number): string {
    if (progression >= 100) return 'progress-complete';
    if (progression >= 75) return 'progress-high';
    if (progression >= 50) return 'progress-medium';
    return 'progress-low';
  }
} 