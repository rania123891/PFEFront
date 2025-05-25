import { Component, OnInit, OnDestroy } from '@angular/core';
import { takeWhile } from 'rxjs/operators';
import { EquipeService, Team, TeamMember } from '../../../services/equipe.service';

@Component({
  selector: 'ngx-teams-overview',
  template: `
    <nb-card class="teams-card">
      <nb-card-header>
        <h6>Équipes & Membres</h6>
        <small>Cliquez sur une équipe pour voir ses membres</small>
      </nb-card-header>
      <nb-card-body>
        <div *ngIf="isLoading" class="loading-container">
          <nb-spinner size="large"></nb-spinner>
          <p>Chargement des équipes...</p>
        </div>
        
        <div *ngIf="!isLoading" class="teams-container">
          <!-- Liste des équipes -->
          <div class="teams-grid">
            <div 
              *ngFor="let team of teams" 
              class="team-card"
              [class.active]="selectedTeam?.id === team.id"
              (click)="selectTeam(team)">
              <div class="team-header">
                <div class="team-avatar" [style.background-color]="team.couleur">
                  <nb-icon icon="people-outline"></nb-icon>
                </div>
                <div class="team-info">
                  <div class="team-name">{{ team.nom }}</div>
                  <div class="team-stats">
                    {{ team.membres.length }} membre{{ team.membres.length > 1 ? 's' : '' }}
                  </div>
                </div>
                <div class="team-metrics">
                  <div class="metric">
                    <span class="metric-value">{{ team.nombreProjets }}</span>
                    <span class="metric-label">Projets</span>
                  </div>
                  <div class="metric">
                    <span class="metric-value">{{ team.nombreTaches }}</span>
                    <span class="metric-label">Tâches</span>
                  </div>
                </div>
              </div>
              <div class="team-description">{{ team.description }}</div>
            </div>
          </div>

          <!-- Détails de l'équipe sélectionnée -->
          <div *ngIf="selectedTeam" class="team-details">
            <div class="details-header">
              <h6>Membres de {{ selectedTeam.nom }}</h6>
              <button 
                nb-button 
                ghost 
                size="small" 
                (click)="selectedTeam = null">
                <nb-icon icon="close-outline"></nb-icon>
              </button>
            </div>

            <!-- Chef d'équipe -->
            <div *ngIf="selectedTeam.chef" class="team-leader">
              <div class="section-title">
                <nb-icon icon="star-outline"></nb-icon>
                Chef d'équipe
              </div>
              <div class="member-card leader">
                <div class="member-avatar">
                  <img *ngIf="selectedTeam.chef.avatar" [src]="selectedTeam.chef.avatar" [alt]="selectedTeam.chef.nom">
                  <div *ngIf="!selectedTeam.chef.avatar" class="avatar-placeholder">
                    {{ getInitials(selectedTeam.chef.nom, selectedTeam.chef.prenom) }}
                  </div>
                </div>
                <div class="member-info">
                  <div class="member-name">{{ selectedTeam.chef.prenom }} {{ selectedTeam.chef.nom }}</div>
                  <div class="member-email">{{ selectedTeam.chef.email }}</div>
                  <div class="member-role">{{ selectedTeam.chef.role }}</div>
                </div>
                <div class="member-status">
                  <div class="status-indicator" [class.active]="selectedTeam.chef.isActive"></div>
                  <span>{{ selectedTeam.chef.isActive ? 'En ligne' : 'Hors ligne' }}</span>
                </div>
              </div>
            </div>

            <!-- Membres de l'équipe -->
            <div class="team-members">
              <div class="section-title">
                <nb-icon icon="people-outline"></nb-icon>
                Membres ({{ selectedTeam.membres.length }})
              </div>
              <div class="members-list">
                <div 
                  *ngFor="let member of selectedTeam.membres" 
                  class="member-card"
                  [class.leader]="member.id === selectedTeam.chef?.id">
                  <div class="member-avatar">
                    <img *ngIf="member.avatar" [src]="member.avatar" [alt]="member.nom">
                    <div *ngIf="!member.avatar" class="avatar-placeholder">
                      {{ getInitials(member.nom, member.prenom) }}
                    </div>
                  </div>
                  <div class="member-info">
                    <div class="member-name">{{ member.prenom }} {{ member.nom }}</div>
                    <div class="member-email">{{ member.email }}</div>
                    <div class="member-role">{{ member.role }}</div>
                  </div>
                  <div class="member-status">
                    <div class="status-indicator" [class.active]="member.isActive"></div>
                    <span>{{ member.isActive ? 'En ligne' : 'Hors ligne' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Message si aucune équipe -->
          <div *ngIf="teams.length === 0" class="no-teams">
            <nb-icon icon="people-outline"></nb-icon>
            <p>Aucune équipe trouvée</p>
          </div>
        </div>
      </nb-card-body>
    </nb-card>
  `,
  styles: [`
    .teams-card {
      min-height: 500px;
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

    .loading-container, .no-teams {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 300px;
      color: #8f9bb3;
    }

    .loading-container p, .no-teams p {
      margin-top: 1rem;
      font-size: 0.875rem;
    }

    .no-teams nb-icon {
      font-size: 3rem;
      opacity: 0.5;
    }

    .teams-container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
      min-height: 400px;
    }

    .teams-grid {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      max-height: 450px;
      overflow-y: auto;
      padding-right: 0.5rem;
    }

    .team-card {
      border: 2px solid #e4e9f2;
      border-radius: 12px;
      padding: 1rem;
      cursor: pointer;
      transition: all 0.3s ease;
      background: #f8f9fb;
    }

    .team-card:hover {
      border-color: #667eea;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
    }

    .team-card.active {
      border-color: #667eea;
      background: rgba(102, 126, 234, 0.05);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
    }

    .team-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 0.75rem;
    }

    .team-avatar {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 1.5rem;
      flex-shrink: 0;
    }

    .team-info {
      flex: 1;
    }

    .team-name {
      font-weight: 600;
      color: #2c2c54;
      font-size: 1rem;
      margin-bottom: 0.25rem;
    }

    .team-stats {
      color: #6c7b7f;
      font-size: 0.8rem;
    }

    .team-metrics {
      display: flex;
      gap: 1rem;
    }

    .metric {
      text-align: center;
    }

    .metric-value {
      display: block;
      font-weight: 700;
      color: #667eea;
      font-size: 1.1rem;
    }

    .metric-label {
      font-size: 0.7rem;
      color: #8f9bb3;
    }

    .team-description {
      color: #6c7b7f;
      font-size: 0.8rem;
      line-height: 1.4;
    }

    .team-details {
      border: 1px solid #e4e9f2;
      border-radius: 12px;
      padding: 1.5rem;
      background: white;
      max-height: 450px;
      overflow-y: auto;
    }

    .details-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #e4e9f2;
    }

    .details-header h6 {
      margin: 0;
      color: #2c2c54;
    }

    .section-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 600;
      color: #2c2c54;
      margin-bottom: 1rem;
      font-size: 0.9rem;
    }

    .section-title nb-icon {
      color: #667eea;
    }

    .team-leader {
      margin-bottom: 2rem;
    }

    .member-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      border: 1px solid #e4e9f2;
      border-radius: 8px;
      margin-bottom: 0.75rem;
      transition: all 0.3s ease;
    }

    .member-card:hover {
      background: #f8f9fb;
      border-color: #d1d5db;
    }

    .member-card.leader {
      background: rgba(102, 126, 234, 0.05);
      border-color: rgba(102, 126, 234, 0.2);
    }

    .member-avatar {
      width: 45px;
      height: 45px;
      border-radius: 50%;
      overflow: hidden;
      flex-shrink: 0;
      position: relative;
    }

    .member-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .avatar-placeholder {
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #667eea, #764ba2);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 600;
      font-size: 0.9rem;
    }

    .member-info {
      flex: 1;
    }

    .member-name {
      font-weight: 600;
      color: #2c2c54;
      font-size: 0.9rem;
      margin-bottom: 0.25rem;
    }

    .member-email {
      color: #6c7b7f;
      font-size: 0.8rem;
      margin-bottom: 0.25rem;
    }

    .member-role {
      color: #667eea;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .member-status {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.75rem;
      color: #8f9bb3;
    }

    .status-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #ddd;
    }

    .status-indicator.active {
      background: #43e97b;
    }

    .members-list {
      max-height: 300px;
      overflow-y: auto;
    }

    /* Responsive */
    @media (max-width: 1024px) {
      .teams-container {
        grid-template-columns: 1fr;
        gap: 1rem;
      }

      .team-details {
        order: -1;
      }
    }

    @media (max-width: 768px) {
      .team-header {
        flex-wrap: wrap;
      }

      .team-metrics {
        width: 100%;
        justify-content: flex-start;
        margin-top: 0.5rem;
      }

      .member-card {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.75rem;
      }

      .member-status {
        align-self: flex-end;
      }
    }

    /* Scrollbar personnalisée */
    .teams-grid::-webkit-scrollbar,
    .team-details::-webkit-scrollbar,
    .members-list::-webkit-scrollbar {
      width: 6px;
    }

    .teams-grid::-webkit-scrollbar-track,
    .team-details::-webkit-scrollbar-track,
    .members-list::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 3px;
    }

    .teams-grid::-webkit-scrollbar-thumb,
    .team-details::-webkit-scrollbar-thumb,
    .members-list::-webkit-scrollbar-thumb {
      background: #c1c1c1;
      border-radius: 3px;
    }

    .teams-grid::-webkit-scrollbar-thumb:hover,
    .team-details::-webkit-scrollbar-thumb:hover,
    .members-list::-webkit-scrollbar-thumb:hover {
      background: #a8a8a8;
    }
  `]
})
export class TeamsOverviewComponent implements OnInit, OnDestroy {
  private alive = true;
  
  teams: Team[] = [];
  selectedTeam: Team | null = null;
  isLoading = true;

  constructor(private equipeService: EquipeService) {}

  ngOnInit() {
    this.loadTeams();
  }

  ngOnDestroy() {
    this.alive = false;
  }

  private loadTeams() {
    this.equipeService.getEquipes()
      .pipe(takeWhile(() => this.alive))
      .subscribe({
        next: (teams) => {
          this.teams = teams;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Erreur lors du chargement des équipes:', error);
          this.isLoading = false;
        }
      });
  }

  selectTeam(team: Team) {
    this.selectedTeam = this.selectedTeam?.id === team.id ? null : team;
  }

  getInitials(nom: string, prenom: string): string {
    return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
  }
} 