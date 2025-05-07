import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { NbDialogService } from '@nebular/theme';
import { Liste, Tache } from '../../services/api.service';
import { TacheDialogComponent } from '../tache-dialog/tache-dialog.component';

@Component({
  selector: 'ngx-liste',
  template: `
    <div class="liste-container" [id]="'liste-' + liste.id">
      <div class="liste-header">
        <div class="liste-titre">
          <h6>{{ liste.nom }}</h6>
          <span class="badge">{{ liste.taches?.length || 0 }}</span>
        </div>
        <div class="liste-actions">
          <button nbButton ghost size="tiny" (click)="ajouterTache()">
            <nb-icon icon="plus-outline"></nb-icon>
          </button>
          <button nbButton ghost size="tiny" [nbContextMenu]="listeActions">
            <nb-icon icon="more-vertical-outline"></nb-icon>
          </button>
        </div>
      </div>

      <div class="liste-content"
           cdkDropList
           [cdkDropListData]="liste.taches"
           (cdkDropListDropped)="drop.emit($event)">
        <div class="tache-item"
             *ngFor="let tache of liste.taches"
             cdkDrag
             [ngClass]="{'date-proche': isDateEcheanceProche(tache.dateEcheance)}"
             (click)="modifierTache(tache)">
          <div class="tache-content">
            <div class="tache-header">
              <span class="reference">#{{ tache.reference }}</span>
              <span class="date" *ngIf="tache.dateEcheance">
                <nb-icon icon="calendar-outline" [status]="isDateEcheanceProche(tache.dateEcheance) ? 'warning' : 'basic'"></nb-icon>
                {{ tache.dateEcheance | date:'dd/MM/yyyy' }}
              </span>
            </div>
            <div class="task-title">{{ tache.titre }}</div>
            <div class="tache-footer">
              <div class="task-meta">
                <span class="creation-date">
                  Créé le {{ tache.dateCreation | date:'dd/MM/yyyy' }}
                </span>
                <span class="assignee" *ngIf="tache.assigneeId">
                  <nb-user [name]="getAssigneeName(tache.assigneeId)" size="tiny"></nb-user>
                </span>
              </div>
              <div class="tache-indicators">
                <nb-icon icon="attach-outline" *ngIf="tache.pieceJointes?.length"></nb-icon>
                <nb-icon icon="message-circle-outline" *ngIf="tache.commentaires?.length"></nb-icon>
              </div>
            </div>
          </div>
        </div>

        <div class="empty-state" *ngIf="!liste.taches?.length">
          <span>Aucune tâche</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .liste-container {
      background-color: #f8f9fa;
      border-radius: 0.5rem;
      width: 300px;
      margin: 0 0.5rem;
      padding: 1rem;
    }

    .liste-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .liste-titre {
      display: flex;
      align-items: center;
      gap: 0.5rem;

      h6 {
        margin: 0;
      }

      .badge {
        background-color: #e4e9f2;
        color: #8f9bb3;
        padding: 0.25rem 0.5rem;
        border-radius: 1rem;
        font-size: 0.75rem;
      }
    }

    .liste-actions {
      display: flex;
      gap: 0.25rem;
    }

    .liste-content {
      min-height: 50px;
    }

    .tache-item {
      background-color: white;
      border-radius: 0.25rem;
      margin-bottom: 0.5rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      cursor: pointer;
      transition: box-shadow 0.2s;

      &:hover {
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
      }
    }

    .tache-content {
      padding: 0.75rem;
    }

    .tache-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 0.5rem;
    }

    .tache-titre {
      font-weight: 500;
      line-height: 1.2;
    }

    .tache-description {
      color: #8f9bb3;
      font-size: 0.875rem;
      margin: 0.5rem 0;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .tache-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 0.75rem;
      font-size: 0.875rem;
    }

    .tache-meta {
      display: flex;
      align-items: center;
      gap: 0.75rem;

      .date {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        color: #8f9bb3;
      }
    }

    .tache-indicators {
      display: flex;
      gap: 0.5rem;
      color: #8f9bb3;
    }

    .empty-state {
      text-align: center;
      color: #8f9bb3;
      padding: 1rem;
      font-style: italic;
    }

    .cdk-drag-preview {
      box-sizing: border-box;
      border-radius: 4px;
      box-shadow: 0 5px 5px -3px rgba(0, 0, 0, 0.2),
                  0 8px 10px 1px rgba(0, 0, 0, 0.14),
                  0 3px 14px 2px rgba(0, 0, 0, 0.12);
    }

    .cdk-drag-placeholder {
      opacity: 0;
    }

    .cdk-drag-animating {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }
  `],
})
export class ListeComponent {
  @Input() liste: Liste;
  @Output() drop = new EventEmitter<CdkDragDrop<Tache[]>>();

  listeActions = [
    { title: 'Renommer', icon: 'edit-outline' },
    { title: 'Supprimer', icon: 'trash-2-outline' },
  ];

  constructor(private dialogService: NbDialogService) {}

  ajouterTache() {
    const nouvelleTache: Partial<Tache> = {
      listeId: this.liste.id,
      projetId: this.liste.projetId,
    };

    this.dialogService.open(TacheDialogComponent, {
      context: {
        tache: nouvelleTache,
      },
    }).onClose.subscribe(result => {
      if (result) {
        if (!this.liste.taches) this.liste.taches = [];
        this.liste.taches.push(result);
      }
    });
  }

  modifierTache(tache: Tache) {
    this.dialogService.open(TacheDialogComponent, {
      context: {
        tache: { ...tache },
      },
    }).onClose.subscribe(result => {
      if (result) {
        const index = this.liste.taches.findIndex(t => t.id === tache.id);
        if (index !== -1) {
          this.liste.taches[index] = result;
        }
      }
    });
  }

  getPriorityIcon(priority: string): string {
    const icons = {
      'low': 'arrow-down-outline',
      'medium': 'minus-outline',
      'high': 'arrow-up-outline',
    };
    return icons[priority] || 'minus-outline';
  }

  getPriorityStatus(priority: string): string {
    const statuses = {
      'low': 'info',
      'medium': 'basic',
      'high': 'danger',
    };
    return statuses[priority] || 'basic';
  }

  getAssigneeName(userId: number): string {
    // TODO: Implémenter la récupération du nom de l'utilisateur
    return 'Utilisateur ' + userId;
  }

  isDateEcheanceProche(dateEcheance: string): boolean {
    if (!dateEcheance) return false;
    const aujourdhui = new Date();
    const dateEch = new Date(dateEcheance);
    const diffJours = Math.ceil((dateEch.getTime() - aujourdhui.getTime()) / (1000 * 60 * 60 * 24));
    return diffJours <= 3 && diffJours >= 0;
  }
} 