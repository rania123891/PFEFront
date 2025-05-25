import { Component } from '@angular/core';
import { Router } from '@angular/router';

interface QuickAction {
  title: string;
  description: string;
  icon: string;
  color: string;
  route: string;
}

@Component({
  selector: 'ngx-quick-actions',
  template: `
    <nb-card class="actions-card">
      <nb-card-header>
        <h6>Actions Rapides</h6>
        <small>Accès direct aux fonctionnalités principales</small>
      </nb-card-header>
      <nb-card-body>
        <div class="actions-grid">
          <div 
            *ngFor="let action of actions" 
            class="action-item"
            [ngClass]="'action-' + action.color"
            (click)="navigateTo(action.route)">
            <div class="action-icon">
              <nb-icon [icon]="action.icon"></nb-icon>
            </div>
            <div class="action-content">
              <div class="action-title">{{ action.title }}</div>
              <div class="action-description">{{ action.description }}</div>
            </div>
            <div class="action-arrow">
              <nb-icon icon="arrow-forward-outline"></nb-icon>
            </div>
          </div>
        </div>
      </nb-card-body>
    </nb-card>
  `,
  styles: [`
    .actions-card {
      margin-bottom: 0;
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
    
    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1rem;
      padding: 1rem 0;
    }
    
    .action-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.25rem;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.3s ease;
      border: 2px solid transparent;
      background: #f8f9fb;
    }
    
    .action-item:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    }
    
    .action-primary:hover {
      border-color: #667eea;
      background: rgba(102, 126, 234, 0.05);
    }
    
    .action-success:hover {
      border-color: #4facfe;
      background: rgba(79, 172, 254, 0.05);
    }
    
    .action-info:hover {
      border-color: #43e97b;
      background: rgba(67, 233, 123, 0.05);
    }
    
    .action-warning:hover {
      border-color: #fa709a;
      background: rgba(247, 112, 154, 0.05);
    }
    
    .action-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 50px;
      height: 50px;
      border-radius: 12px;
      font-size: 1.5rem;
      flex-shrink: 0;
    }
    
    .action-primary .action-icon {
      background: rgba(102, 126, 234, 0.1);
      color: #667eea;
    }
    
    .action-success .action-icon {
      background: rgba(79, 172, 254, 0.1);
      color: #4facfe;
    }
    
    .action-info .action-icon {
      background: rgba(67, 233, 123, 0.1);
      color: #43e97b;
    }
    
    .action-warning .action-icon {
      background: rgba(247, 112, 154, 0.1);
      color: #fa709a;
    }
    
    .action-content {
      flex: 1;
    }
    
    .action-title {
      font-weight: 600;
      color: #2c2c54;
      font-size: 0.95rem;
      margin-bottom: 0.25rem;
    }
    
    .action-description {
      color: #6c7b7f;
      font-size: 0.8rem;
      line-height: 1.4;
    }
    
    .action-arrow {
      display: flex;
      align-items: center;
      color: #8f9bb3;
      font-size: 1.2rem;
      transition: transform 0.3s ease;
    }
    
    .action-item:hover .action-arrow {
      transform: translateX(4px);
    }
    
    @media (max-width: 768px) {
      .actions-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class QuickActionsComponent {
  actions: QuickAction[] = [
    {
      title: 'Nouveau Projet',
      description: 'Créer un nouveau projet et commencer la planification',
      icon: 'plus-circle-outline',
      color: 'primary',
      route: '/pages/projets/nouveau'
    },
    {
      title: 'Ajouter une Tâche',
      description: 'Créer une nouvelle tâche et l\'assigner à une équipe',
      icon: 'checkmark-circle-outline',
      color: 'success',
      route: '/pages/taches/nouveau'
    },
    {
      title: 'Gérer les Équipes',
      description: 'Voir et modifier les équipes et leurs membres',
      icon: 'people-outline',
      color: 'info',
      route: '/pages/equipes'
    },
    {
      title: 'Planification',
      description: 'Accéder au module de planification et calendrier',
      icon: 'calendar-outline',
      color: 'warning',
      route: '/pages/planification'
    }
  ];

  constructor(private router: Router) {}

  navigateTo(route: string) {
    this.router.navigate([route]);
  }
} 