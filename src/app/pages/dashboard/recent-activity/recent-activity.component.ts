import { Component, Input } from '@angular/core';

interface RecentActivity {
  type: string;
  description: string;
  time: Date;
  icon: string;
  color: string;
}

@Component({
  selector: 'ngx-recent-activity',
  template: `
    <nb-card class="activity-card">
      <nb-card-header>
        <h6>Activité Récente</h6>
      </nb-card-header>
      <nb-card-body>
        <div *ngIf="isLoading" class="loading-container">
          <nb-spinner size="medium"></nb-spinner>
          <p>Chargement...</p>
        </div>
        <div *ngIf="!isLoading" class="activity-list">
          <div 
            *ngFor="let activity of activities" 
            class="activity-item"
            [class.fade-in]="!isLoading">
            <div class="activity-icon" [ngClass]="'icon-' + activity.color">
              <nb-icon [icon]="activity.icon"></nb-icon>
            </div>
            <div class="activity-content">
              <div class="activity-type">{{ activity.type }}</div>
              <div class="activity-description">{{ activity.description }}</div>
              <div class="activity-time">{{ getTimeAgo(activity.time) }}</div>
            </div>
          </div>
          <div *ngIf="activities.length === 0" class="no-activity">
            <nb-icon icon="info-outline"></nb-icon>
            <p>Aucune activité récente</p>
          </div>
        </div>
      </nb-card-body>
    </nb-card>
  `,
  styles: [`
    .activity-card {
      height: 400px;
    }
    
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 300px;
      color: #8f9bb3;
    }
    
    .loading-container p {
      margin-top: 1rem;
      font-size: 0.875rem;
    }
    
    .activity-list {
      max-height: 320px;
      overflow-y: auto;
    }
    
    .activity-item {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      padding: 1rem 0;
      border-bottom: 1px solid #e4e9f2;
      opacity: 0;
      animation: fadeIn 0.5s ease forwards;
    }
    
    .activity-item:last-child {
      border-bottom: none;
    }
    
    .activity-item.fade-in {
      animation-delay: calc(var(--index) * 0.1s);
    }
    
    .activity-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      font-size: 1.2rem;
      flex-shrink: 0;
    }
    
    .icon-primary {
      background: rgba(102, 126, 234, 0.2);
      color: #667eea;
    }
    
    .icon-success {
      background: rgba(79, 172, 254, 0.2);
      color: #4facfe;
    }
    
    .icon-info {
      background: rgba(67, 233, 123, 0.2);
      color: #43e97b;
    }
    
    .icon-warning {
      background: rgba(247, 112, 154, 0.2);
      color: #fa709a;
    }
    
    .activity-content {
      flex: 1;
    }
    
    .activity-type {
      font-weight: 600;
      color: #2c2c54;
      font-size: 0.875rem;
      margin-bottom: 0.25rem;
    }
    
    .activity-description {
      color: #6c7b7f;
      font-size: 0.8rem;
      line-height: 1.4;
      margin-bottom: 0.5rem;
    }
    
    .activity-time {
      color: #8f9bb3;
      font-size: 0.75rem;
    }
    
    .no-activity {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 200px;
      color: #8f9bb3;
    }
    
    .no-activity nb-icon {
      font-size: 2rem;
      opacity: 0.5;
      margin-bottom: 1rem;
    }
    
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `]
})
export class RecentActivityComponent {
  @Input() activities: RecentActivity[] = [];
  @Input() isLoading: boolean = false;

  getTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
  }
} 