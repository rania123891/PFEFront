import { Component, Input } from '@angular/core';
import { Commentaire } from '../../models/tableau.model';

@Component({
  selector: 'ngx-commentaires',
  template: `
    <div class="commentaires-section">
      <h6 class="mb-3">Commentaires</h6>
      
      <div class="nouveau-commentaire mb-4">
        <textarea
          nbInput
          fullWidth
          [(ngModel)]="nouveauCommentaire"
          placeholder="Ajouter un commentaire..."
          rows="2"
        ></textarea>
        <div class="actions">
          <button nbButton status="primary" size="small" (click)="ajouterCommentaire()" [disabled]="!nouveauCommentaire.trim()">
            Commenter
          </button>
        </div>
      </div>

      <div class="liste-commentaires">
        <div class="commentaire" *ngFor="let commentaire of commentaires">
          <div class="commentaire-header">
            <nb-user [picture]="commentaire.avatar" [name]="commentaire.auteur" size="small"></nb-user>
            <span class="date">{{ commentaire.date | date:'dd/MM/yyyy HH:mm' }}</span>
          </div>
          <div class="commentaire-texte">
            {{ commentaire.texte }}
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .commentaires-section {
      margin-top: 2rem;
      padding-top: 2rem;
      border-top: 1px solid #edf1f7;
    }

    .nouveau-commentaire {
      .actions {
        display: flex;
        justify-content: flex-end;
        margin-top: 0.5rem;
      }
    }

    .liste-commentaires {
      .commentaire {
        margin-bottom: 1.5rem;
        
        .commentaire-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.5rem;

          .date {
            font-size: 0.75rem;
            color: #8f9bb3;
          }
        }

        .commentaire-texte {
          background-color: #f8f9fa;
          padding: 1rem;
          border-radius: 0.5rem;
          font-size: 0.875rem;
        }
      }
    }
  `]
})
export class CommentaireComponent {
  @Input() tacheId: number;
  commentaires: Commentaire[] = [];
  nouveauCommentaire = '';

  constructor() {
    // Données de test
    this.commentaires = [
      {
        id: 1,
        tacheId: 1,
        texte: 'J\'ai commencé à travailler sur cette tâche.',
        auteur: 'Alice Martin',
        avatar: 'assets/images/avatar1.jpg',
        date: new Date('2024-03-10T10:30:00')
      },
      {
        id: 2,
        tacheId: 1,
        texte: 'La documentation est prête pour review.',
        auteur: 'Bob Wilson',
        avatar: 'assets/images/avatar2.jpg',
        date: new Date('2024-03-10T14:15:00')
      }
    ];
  }

  ajouterCommentaire() {
    if (this.nouveauCommentaire.trim()) {
      const nouveauCommentaire: Commentaire = {
        id: this.commentaires.length + 1,
        tacheId: this.tacheId,
        texte: this.nouveauCommentaire,
        auteur: 'Utilisateur actuel',
        avatar: 'assets/images/avatar3.jpg',
        date: new Date()
      };

      this.commentaires.unshift(nouveauCommentaire);
      this.nouveauCommentaire = '';
    }
  }
} 