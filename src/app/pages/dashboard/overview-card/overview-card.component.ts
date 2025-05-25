import { Component, Input } from '@angular/core';

@Component({
  selector: 'ngx-overview-card',
  template: `
    <nb-card [ngClass]="'card-' + color" class="overview-card">
      <nb-card-body>
        <div class="card-content">
          <div class="icon-container">
            <nb-icon [icon]="icon" class="card-icon"></nb-icon>
          </div>
          <div class="content">
            <div class="title">{{ title }}</div>
            <div class="value" *ngIf="!isLoading">{{ value | number }}</div>
            <div class="value loading" *ngIf="isLoading">
              <nb-spinner size="small"></nb-spinner>
            </div>
          </div>
        </div>
        <div class="progress-bar">
          <div class="progress" [style.width.%]="progressPercent"></div>
        </div>
      </nb-card-body>
    </nb-card>
  `,
  styles: [`
    .overview-card {
      border: none;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);
      transition: all 0.3s ease;
      height: 140px;
    }
    
    .overview-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.16);
    }
    
    .card-content {
      display: flex;
      align-items: center;
      gap: 1rem;
      height: 90px;
    }
    
    .icon-container {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.2);
    }
    
    .card-icon {
      font-size: 2rem;
      color: white;
    }
    
    .content {
      flex: 1;
    }
    
    .title {
      font-size: 0.875rem;
      color: rgba(255, 255, 255, 0.8);
      margin-bottom: 0.5rem;
      font-weight: 500;
    }
    
    .value {
      font-size: 2rem;
      font-weight: bold;
      color: white;
      line-height: 1;
    }
    
    .value.loading {
      display: flex;
      align-items: center;
    }
    
    .progress-bar {
      height: 4px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 2px;
      overflow: hidden;
      margin-top: 1rem;
    }
    
    .progress {
      height: 100%;
      background: white;
      border-radius: 2px;
      transition: width 0.3s ease;
    }
    
    .card-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    
    .card-success {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    }
    
    .card-info {
      background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
    }
    
    .card-warning {
      background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
    }
    
    .card-danger {
      background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
    }
  `]
})
export class OverviewCardComponent {
  @Input() title: string = '';
  @Input() value: number = 0;
  @Input() icon: string = 'home-outline';
  @Input() color: string = 'primary';
  @Input() isLoading: boolean = false;
  @Input() progressPercent: number = 75;
} 