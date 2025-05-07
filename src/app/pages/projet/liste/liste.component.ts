import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ApiService, Liste } from '../services/api.service';
import { NbButtonModule, NbIconModule, NbCardModule, NbBadgeModule, NbUserModule } from '@nebular/theme';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ngx-liste-view',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NbButtonModule,
    NbIconModule,
    NbCardModule,
    NbBadgeModule,
    NbUserModule,
  ],
  template: `
    <div class="projet-header">
      <h2>Liste des tâches</h2>
      <div class="projet-nav">
        <a nbButton ghost [routerLink]="['/pages/projet', projetId, 'resume']">
          <nb-icon icon="file-text-outline"></nb-icon>
          Résumé
        </a>
        <a nbButton ghost [routerLink]="['/pages/projet', projetId, 'liste']" [status]="'primary'">
          <nb-icon icon="list-outline"></nb-icon>
          Liste
        </a>
        <a nbButton ghost [routerLink]="['/pages/projet', projetId, 'calendrier']">
          <nb-icon icon="calendar-outline"></nb-icon>
          Calendrier
        </a>
        <a nbButton ghost [routerLink]="['/pages/projet', projetId, 'chronologie']">
          <nb-icon icon="clock-outline"></nb-icon>
          Chronologie
        </a>
        <a nbButton ghost [routerLink]="['/pages/projet', projetId, 'approbations']">
          <nb-icon icon="checkmark-square-outline"></nb-icon>
          Approbations
        </a>
        <a nbButton ghost [routerLink]="['/pages/projet', projetId, 'formulaires']">
          <nb-icon icon="file-outline"></nb-icon>
          Formulaires
        </a>
        <a nbButton ghost [routerLink]="['/pages/projet', projetId, 'pages']">
          <nb-icon icon="book-outline"></nb-icon>
          Pages
        </a>
        <a nbButton ghost [routerLink]="['/pages/projet', projetId, 'pieces-jointes']">
          <nb-icon icon="attach-outline"></nb-icon>
          Pièces jointes
        </a>
      </div>
    </div>

    <div class="d-flex justify-content-between align-items-center mb-3">
      <div class="search-box">
        <input nbInput placeholder="Rechercher une tâche..." class="search-input">
      </div>
      <div class="actions">
        <button nbButton ghost>
          <nb-icon icon="share-outline"></nb-icon>
          Partager
        </button>
        <button nbButton ghost>
          <nb-icon icon="funnel-outline"></nb-icon>
          Filtre
        </button>
        <button nbButton ghost>
          <nb-icon icon="options-2-outline"></nb-icon>
          Regrouper par : État
        </button>
        <button nbButton ghost>
          <nb-icon icon="more-horizontal-outline"></nb-icon>
          Plus
        </button>
      </div>
    </div>

    <div class="listes-container">
      <nb-card>
        <nb-card-body>
          <table class="table">
            <thead>
              <tr>
                <th>Titre</th>
                <th>Statut</th>
                <th>Priorité</th>
                <th>Assigné à</th>
                <th>Date d'échéance</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let tache of taches">
                <td>{{ tache.titre }}</td>
                <td>
                  <nb-badge [text]="tache.statut" [status]="getStatutBadgeStatus(tache.statut)"></nb-badge>
                </td>
                <td>
                  <nb-icon [icon]="getPriorityIcon(tache.priorite)" [status]="getPriorityStatus(tache.priorite)"></nb-icon>
                  {{ tache.priorite }}
                </td>
                <td>
                  <nb-user [name]="getAssigneeName(tache.assigneeId)" size="small"></nb-user>
                </td>
                <td>{{ tache.dateEcheance | date:'dd/MM/yyyy' }}</td>
                <td>
                  <button nbButton ghost size="small" (click)="modifierTache(tache)">
                    <nb-icon icon="edit-outline"></nb-icon>
                  </button>
                  <button nbButton ghost status="danger" size="small" (click)="supprimerTache(tache)">
                    <nb-icon icon="trash-2-outline"></nb-icon>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </nb-card-body>
      </nb-card>
    </div>
  `,
  styles: [`
    .projet-header {
      margin-bottom: 1.5rem;
      
      h2 {
        margin: 0 0 1rem;
        font-size: 1.5rem;
      }
    }

    .projet-nav {
      display: flex;
      gap: 0.5rem;
      border-bottom: 1px solid #edf1f7;
      padding-bottom: 1rem;
      margin-bottom: 1rem;
      overflow-x: auto;

      a {
        white-space: nowrap;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
    }

    .search-box {
      .search-input {
        width: 300px;
      }
    }

    .actions {
      display: flex;
      gap: 0.5rem;
    }

    .table {
      width: 100%;
      
      th, td {
        padding: 1rem;
        vertical-align: middle;
      }

      th {
        font-weight: 600;
        color: #8f9bb3;
        border-bottom: 1px solid #edf1f7;
      }

      td {
        border-bottom: 1px solid #edf1f7;
      }
    }

    nb-badge {
      text-transform: capitalize;
    }
  `]
})
export class ListeViewComponent implements OnInit {
  projetId: number;
  taches: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.projetId = +params['projetId'];
      this.chargerTaches();
    });
  }

  chargerTaches() {
    // TODO: Implémenter le chargement des tâches depuis l'API
  }

  getStatutBadgeStatus(statut: string): string {
    switch (statut) {
      case 'en_cours':
        return 'info';
      case 'termine':
        return 'success';
      case 'annule':
        return 'danger';
      default:
        return 'basic';
    }
  }

  getPriorityIcon(priority: string): string {
    switch (priority) {
      case 'high':
        return 'arrow-up-outline';
      case 'medium':
        return 'minus-outline';
      case 'low':
        return 'arrow-down-outline';
      default:
        return 'minus-outline';
    }
  }

  getPriorityStatus(priority: string): string {
    switch (priority) {
      case 'high':
        return 'danger';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'basic';
    }
  }

  getAssigneeName(userId: number): string {
    // TODO: Implémenter la récupération du nom de l'utilisateur
    return 'Utilisateur ' + userId;
  }

  modifierTache(tache: any) {
    // TODO: Implémenter la modification de la tâche
  }

  supprimerTache(tache: any) {
    // TODO: Implémenter la suppression de la tâche
  }
} 