import { Component, OnInit } from '@angular/core';
import { EquipeService } from '../services/equipe.service';
import { Equipe, StatutEquipe, Domaine } from '../models/equipe.model';
import { NbDialogService } from '@nebular/theme';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute } from '@angular/router';
import { ModifierEquipeComponent } from './modifier-equipe.component';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'ngx-liste-equipes',
  template: `
    <nb-card>
      <nb-card-header class="d-flex justify-content-between align-items-center">
        <div>
          <h1>Équipes du projet</h1>
          <p class="text-hint">Gestion des équipes du projet</p>
        </div>
        <button nbButton status="primary" (click)="ajouterEquipe()">
          <nb-icon icon="plus-outline"></nb-icon>
          Nouvelle équipe
        </button>
      </nb-card-header>

      <nb-card-body>
        <!-- État de chargement -->
        <div *ngIf="isLoading" class="d-flex justify-content-center my-5">
          <nb-spinner status="primary"></nb-spinner>
        </div>

        <!-- Message d'erreur -->
        <nb-alert *ngIf="errorMessage" status="danger" class="mb-4">
          {{ errorMessage }}
          <button nbButton ghost status="primary" class="ml-3" (click)="chargerEquipes()">
            <nb-icon icon="refresh-outline"></nb-icon>
            Réessayer
          </button>
        </nb-alert>

        <!-- Liste des équipes -->
        <div *ngIf="!isLoading && !errorMessage" class="row">
          <div *ngIf="equipes.length === 0" class="col-12 text-center my-5">
            <nb-icon icon="people-outline" class="empty-icon"></nb-icon>
            <h3>Aucune équipe trouvée</h3>
            <p class="text-hint">Commencez par créer une équipe pour ce projet.</p>
            <button nbButton status="primary" (click)="ajouterEquipe()">
              <nb-icon icon="plus-outline"></nb-icon>
              Nouvelle équipe
            </button>
          </div>
          
          <div class="col-md-6 col-xl-4 mb-4" *ngFor="let equipe of equipes">
            <nb-card [ngClass]="getEquipeClass(equipe)">
              <nb-card-header>
                <div class="d-flex justify-content-between align-items-center">
                  <h5 class="mb-0">{{ equipe.nom }}</h5>
                  <nb-badge [text]="equipe.statut" [status]="getStatutBadgeStatus(equipe.statut)">
                  </nb-badge>
                </div>
              </nb-card-header>
              <nb-card-body>
                <div class="mb-3">
                  <strong>Domaine : </strong>
                  <span>{{ equipe.domaineActivite }}</span>
                </div>
                <div class="mb-3">
                  <strong>Membres : </strong>
                  <span>{{ equipe.membresEquipe?.length || 0 }}</span>
                </div>
              </nb-card-body>
              <nb-card-footer>
                <button nbButton ghost status="info" class="mr-2" (click)="modifierEquipe(equipe)">
                  <nb-icon icon="edit-outline"></nb-icon>
                </button>
                <button nbButton ghost status="danger" (click)="supprimerEquipe(equipe)">
                  <nb-icon icon="trash-2-outline"></nb-icon>
                </button>
              </nb-card-footer>
            </nb-card>
          </div>
        </div>
      </nb-card-body>
    </nb-card>
  `,
  styles: [`
    .empty-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
      opacity: 0.5;
    }

    .equipe-card {
      transition: transform 0.2s;
      &:hover {
        transform: translateY(-5px);
      }
    }

    .equipe-active {
      border-top: 3px solid nb-theme(color-success-default);
    }

    .equipe-inactive {
      border-top: 3px solid nb-theme(color-danger-default);
    }
  `]
})
export class ListeEquipesComponent implements OnInit {
  equipes: Equipe[] = [];
  isLoading = false;
  errorMessage: string | null = null;
  projetId: number;

  constructor(
    private equipeService: EquipeService,
    private dialogService: NbDialogService,
    private toastr: ToastrService,
    private route: ActivatedRoute
  ) {
    this.projetId = Number(this.route.snapshot.paramMap.get('projetId'));
    console.log('ID du projet récupéré:', this.projetId);
  }

  ngOnInit() {
    this.chargerEquipes();
  }

  chargerEquipes() {
    this.isLoading = true;
    this.errorMessage = null;

    console.log('Chargement des équipes pour le projet:', this.projetId);
    this.equipeService.getEquipesByProjet(this.projetId).subscribe({
      next: (equipes) => {
        console.log('Équipes reçues:', equipes);
        this.equipes = equipes;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des équipes:', error);
        this.isLoading = false;
        this.errorMessage = 'Impossible de charger les équipes. Veuillez réessayer plus tard.';
        this.toastr.error(this.errorMessage, 'Erreur');
      }
    });
  }

  getEquipeClass(equipe: Equipe): string {
    return equipe.statut === StatutEquipe.Active ? 'equipe-active' : 'equipe-inactive';
  }

  getStatutBadgeStatus(statut: StatutEquipe): string {
    return statut === StatutEquipe.Active ? 'success' : 'danger';
  }

  ajouterEquipe() {
    this.dialogService.open(ModifierEquipeComponent, {
      context: {
        projetId: this.projetId
      },
      closeOnBackdropClick: false,
      closeOnEsc: false
    }).onClose.subscribe((equipe: Equipe) => {
      if (equipe) {
        this.equipeService.createEquipe(equipe).subscribe({
          next: (nouvelleEquipe) => {
            this.equipes.push(nouvelleEquipe);
            this.toastr.success('L\'équipe a été créée avec succès', 'Succès');
          },
          error: (error) => {
            console.error('Erreur lors de la création de l\'équipe:', error);
            this.toastr.error('Impossible de créer l\'équipe', 'Erreur');
          }
        });
      }
    });
  }

  modifierEquipe(equipe: Equipe) {
    this.dialogService.open(ModifierEquipeComponent, {
      context: {
        equipe: equipe,
        projetId: this.projetId
      },
      closeOnBackdropClick: false,
      closeOnEsc: false
    }).onClose.subscribe((equipeModifiee: Equipe) => {
      if (equipeModifiee) {
        this.equipeService.updateEquipe(equipe.idEquipe!, equipeModifiee).subscribe({
          next: (resultat) => {
            const index = this.equipes.findIndex(e => e.idEquipe === equipe.idEquipe);
            if (index !== -1) {
              this.equipes[index] = resultat;
            }
            this.toastr.success('L\'équipe a été modifiée avec succès', 'Succès');
          },
          error: (error) => {
            console.error('Erreur lors de la modification de l\'équipe:', error);
            this.toastr.error('Impossible de modifier l\'équipe', 'Erreur');
          }
        });
      }
    });
  }

  supprimerEquipe(equipe: Equipe) {
    this.dialogService.open(ConfirmationDialogComponent, {
      context: {
        title: 'Supprimer l\'équipe',
        content: `Êtes-vous sûr de vouloir supprimer l'équipe "${equipe.nom}" ?`
      },
      closeOnBackdropClick: false,
      closeOnEsc: false
    }).onClose.subscribe((confirmation: boolean) => {
      if (confirmation) {
        this.equipeService.deleteEquipe(equipe.idEquipe!).subscribe({
          next: () => {
            const index = this.equipes.findIndex(e => e.idEquipe === equipe.idEquipe);
            if (index !== -1) {
              this.equipes.splice(index, 1);
            }
            this.toastr.success('L\'équipe a été supprimée avec succès', 'Succès');
          },
          error: (error) => {
            console.error('Erreur lors de la suppression de l\'équipe:', error);
            this.toastr.error('Impossible de supprimer l\'équipe', 'Erreur');
          }
        });
      }
    });
  }
} 