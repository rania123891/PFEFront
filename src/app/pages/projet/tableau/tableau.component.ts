import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ActivatedRoute, Router } from '@angular/router';
import { CdkDragDrop, moveItemInArray, transferArrayItem, DragDropModule } from '@angular/cdk/drag-drop';
import { NbDialogService, NbCardModule, NbButtonModule, NbIconModule, NbInputModule, NbActionsModule, NbPopoverModule, NbBadgeModule } from '@nebular/theme';
import { ApiService, Tableau, Liste, Tache, PrioriteTache, StatutTache } from '../services/api.service';
import { TacheDialogComponent } from './tache-dialog/tache-dialog.component';
import { forkJoin } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ListeDialogComponent } from './liste-dialog/liste-dialog.component';
import { TableauDialogComponent } from './tableau-dialog/tableau-dialog.component';
import { AjouterListeDialogComponent } from './ajouter-liste-dialog/ajouter-liste-dialog.component';
import { ConfirmationDialogComponent } from './confirmation-dialog/confirmation-dialog.component';

interface ListeDialogData {
  tableauId: number;
  liste?: Liste;
}

interface TacheDialogData {
  listeId: number;
  tache?: Tache;
}

interface ConfirmationDialogData {
  title: string;
  message: string;
}

@Component({
  selector: 'ngx-tableau',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    DragDropModule,
    NbCardModule,
    NbButtonModule,
    NbIconModule,
    NbInputModule,
    NbActionsModule,
    NbPopoverModule,
    NbBadgeModule,
    AjouterListeDialogComponent,
    ConfirmationDialogComponent
  ],
  template: `
    <div class="projet-header">
      <h2>{{ tableau?.nom || 'Tableau du projet' }}</h2>
      <div class="projet-nav">
        <a nbButton ghost [routerLink]="['./resume']">
          <nb-icon icon="file-text-outline"></nb-icon>
          Résumé
        </a>
        <a nbButton ghost [routerLink]="['liste']" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
          <nb-icon icon="list-outline"></nb-icon>
          Liste
        </a>
        <a nbButton ghost [routerLink]="['calendar']" routerLinkActive="active">
          <nb-icon icon="calendar-outline"></nb-icon>
          Calendrier
        </a>
        <a nbButton ghost [routerLink]="['timeline']" routerLinkActive="active">
          <nb-icon icon="clock-outline"></nb-icon>
          Chronologie
        </a>
        <a nbButton ghost [routerLink]="['approvals']" routerLinkActive="active">
          <nb-icon icon="checkmark-square-outline"></nb-icon>
          Approbations
        </a>
        <a nbButton ghost [routerLink]="['forms']" routerLinkActive="active">
          <nb-icon icon="file-outline"></nb-icon>
          Formulaires
        </a>
        <a nbButton ghost [routerLink]="['pages']" routerLinkActive="active">
          <nb-icon icon="book-outline"></nb-icon>
          Pages
        </a>
        <a nbButton ghost [routerLink]="['attachments']" routerLinkActive="active">
          <nb-icon icon="attach-outline"></nb-icon>
          Pièces jointes
        </a>
      </div>
    </div>
    <router-outlet></router-outlet>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
      overflow: auto;
    }

    .projet-header {
      background: white;
      border-bottom: 1px solid #edf1f7;
      margin-bottom: 1.5rem;

      h2 {
        margin: 0 0 1rem;
        font-size: 1.5rem;
        font-weight: 600;
        padding: 1rem 1rem 0;
      }
    }

    .projet-nav {
      display: flex;
      gap: 0.5rem;
      padding: 0 1rem 1rem;
      overflow-x: auto;
      
      a {
        white-space: nowrap;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        
        &.active {
          color: #3366ff;
          font-weight: 600;
        }

        nb-icon {
          font-size: 1.25rem;
        }
      }
    }
  `]
})
export class TableauComponent implements OnInit {
  tableau: Tableau;
  projetId: number;
  tableauId: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private dialogService: NbDialogService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.projetId = +params['id'];
      this.tableauId = +params['tableauId'];
      this.chargerTableau();
    });
  }

  chargerTableau() {
    this.apiService.getTableau(this.tableauId).subscribe(
      (tableau) => {
        this.tableau = tableau;
        this.chargerListes();
      },
      (error) => {
        console.error('Erreur lors du chargement du tableau:', error);
      }
    );
  }

  chargerListes() {
    this.apiService.getListes(this.tableauId).subscribe(
      (listes) => {
        this.tableau.listes = listes;
      },
      (error) => {
        console.error('Erreur lors du chargement des listes:', error);
      }
    );
  }

  ajouterListe() {
    const data: ListeDialogData = {
      tableauId: this.tableauId
    };
    
    this.dialogService.open(ListeDialogComponent, {
      context: data
    }).onClose.subscribe(result => {
      if (result) {
        this.chargerListes();
      }
    });
  }

  renommerListe(liste: Liste) {
    const data: ListeDialogData = {
      liste: liste,
      tableauId: this.tableauId
    };
    
    this.dialogService.open(ListeDialogComponent, {
      context: data
    }).onClose.subscribe(result => {
      if (result) {
        this.chargerListes();
      }
    });
  }

  supprimerListe(liste: Liste) {
    const data: ConfirmationDialogData = {
      title: 'Supprimer la liste',
      message: `Êtes-vous sûr de vouloir supprimer la liste "${liste.nom}" ?`
    };
    
    this.dialogService.open(ConfirmationDialogComponent, {
      context: data
    }).onClose.subscribe(result => {
      if (result) {
        this.apiService.deleteListe(liste.id).subscribe(
          () => {
            this.chargerListes();
          },
          (error) => {
            console.error('Erreur lors de la suppression de la liste:', error);
          }
        );
      }
    });
  }

  ajouterTache(liste: Liste) {
    const data: TacheDialogData = {
      listeId: liste.id
    };
    
    this.dialogService.open(TacheDialogComponent, {
      context: data
    }).onClose.subscribe(result => {
      if (result) {
        this.chargerListes();
      }
    });
  }

  modifierTache(tache: Tache) {
    const data: TacheDialogData = {
      tache: tache,
      listeId: tache.listeId
    };
    
    this.dialogService.open(TacheDialogComponent, {
      context: data
    }).onClose.subscribe(result => {
      if (result) {
        this.chargerListes();
      }
    });
  }

  supprimerTache(tache: Tache) {
    const data: ConfirmationDialogData = {
      title: 'Supprimer la tâche',
      message: `Êtes-vous sûr de vouloir supprimer la tâche "${tache.titre}" ?`
    };
    
    this.dialogService.open(ConfirmationDialogComponent, {
      context: data
    }).onClose.subscribe(result => {
      if (result) {
        this.apiService.deleteTache(tache.id).subscribe(
          () => {
            this.chargerListes();
          },
          (error) => {
            console.error('Erreur lors de la suppression de la tâche:', error);
          }
        );
      }
    });
  }

  onDrop(event: CdkDragDrop<Tache[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }
  }

  getStatutBadgeStatus(statut: StatutTache): string {
    switch (statut) {
      case StatutTache.EnCours:
        return 'warning';
      case StatutTache.Terminee:
        return 'success';
      case StatutTache.Annulee:
        return 'danger';
      default:
        return 'basic';
    }
  }

  getPriorityBadgeStatus(priorite: PrioriteTache): string {
    switch (priorite) {
      case PrioriteTache.Elevee:
        return 'danger';
      case PrioriteTache.Moyenne:
        return 'warning';
      case PrioriteTache.Faible:
        return 'success';
      default:
        return 'basic';
    }
  }
} 