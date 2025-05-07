import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EquipeService } from './equipe.service';
import { Equipe, StatutEquipe, Domaine } from './equipe.model';
import { NbDialogService } from '@nebular/theme';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationDialogComponent } from '../projet/confirmation-dialog/confirmation-dialog.component';
import { AjouterMembreDialogComponent } from './ajouter-membre-dialog.component';
import { MembreEquipe } from './membre-equipe.model';
import { TeamMemberService } from '../../services/team-member.service';

@Component({
  selector: 'ngx-liste-equipes',
  template: `
    <nb-card>
      <nb-card-header class="d-flex justify-content-between align-items-center">
        <div>
          <h1>Équipes</h1>
          <p class="text-hint">Gestion des équipes</p>
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
            <p class="text-hint">Commencez par créer une équipe.</p>
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
                  <nb-badge [text]="getStatutText(equipe.statut)" [status]="getStatutBadgeStatus(equipe.statut)">
                  </nb-badge>
                </div>
              </nb-card-header>
              <nb-card-body>
                <div class="mb-3">
                  <strong>Domaine : </strong>
                  <span>{{ getDomaineName(equipe.domaineActivite) }}</span>
                </div>
                <div class="mb-3">
                  <strong>Membres : </strong>
                  <span>{{ equipe.membresEquipe?.length || 0 }}</span>
                  
                  <!-- Liste des membres -->
                  <div class="membres-list mt-2">
                    <ul class="list-unstyled" *ngIf="equipe.membresEquipe?.length">
                      <li *ngFor="let membre of equipe.membresEquipe" class="membre-item">
                        <div class="d-flex align-items-center justify-content-between">
                          <div>
                            <nb-icon icon="person-outline"></nb-icon>
                            <span class="ml-2" [class.chef-equipe]="membre.role === 1">
                              {{ membre.utilisateur?.email }}
                            </span>
                          </div>
                          <button nbButton ghost size="tiny" status="danger" 
                                  (click)="supprimerMembre(equipe.idEquipe, membre.id)">
                            <nb-icon icon="trash-2-outline"></nb-icon>
                          </button>
                        </div>
                      </li>
                    </ul>
                    
                    <!-- Bouton Ajouter membre -->
                    <button nbButton outline size="small" status="primary" class="mt-2"
                            (click)="ouvrirDialogAjoutMembre(equipe.idEquipe)">
                      <nb-icon icon="person-add-outline"></nb-icon>
                      AJOUTER MEMBRE
                    </button>
                  </div>
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

    .membres-list {
      margin-top: 1rem;
    }

    .chef-equipe {
      color: #ff3d71;
      font-weight: bold;
    }

    .membre-item {
      padding: 0.5rem;
      margin-bottom: 0.5rem;
      border-radius: 0.25rem;
      background-color: nb-theme(background-basic-color-2);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .ml-2 {
      margin-left: 0.5rem;
    }
  `]
})
export class ListeEquipesComponent implements OnInit {
  equipes: Equipe[] = [];
  isLoading = false;
  errorMessage: string | null = null;
  equipeFormulaireOuvert: number | null = null;
  nouveauMembre = { utilisateurId: 0, role: 'Membre' };

  constructor(
    private equipeService: EquipeService,
    private dialogService: NbDialogService,
    private toastr: ToastrService,
    private router: Router,
    private teamMemberService: TeamMemberService
  ) {}

  ngOnInit() {
    this.chargerEquipes();
  }

  chargerEquipes() {
    this.isLoading = true;
    this.errorMessage = null;

    this.equipeService.getEquipes().subscribe({
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
    return `equipe-card equipe-${equipe.statut === StatutEquipe.Active ? 'active' : 'inactive'}`;
  }

  getStatutText(statut: StatutEquipe): string {
    return statut === StatutEquipe.Active ? 'Active' : 'Inactive';
  }

  getStatutBadgeStatus(statut: StatutEquipe): string {
    return statut === StatutEquipe.Active ? 'success' : 'danger';
  }

  ajouterEquipe() {
    this.router.navigate(['/pages/equipes/ajouter']);
  }

  modifierEquipe(equipe: Equipe) {
    this.router.navigate(['/pages/equipes/modifier', equipe.idEquipe]);
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

  getDomaineName(domaine: number): string {
    const domaineMap = {
      0: 'FrontEnd',
      1: 'BackEnd',
      2: 'BaseDonnee'
    };
    return domaineMap[domaine] || domaine.toString();
  }

  ouvrirDialogAjoutMembre(equipeId: number) {
    this.dialogService.open(AjouterMembreDialogComponent, {
      context: {},
      closeOnBackdropClick: false,
      closeOnEsc: false
    }).onClose.subscribe((membres: MembreEquipe[]) => {
      if (membres) {
        this.teamMemberService.addTeamMembers(equipeId, membres).subscribe({
          next: () => {
            this.equipeService.getEquipe(equipeId).subscribe({
              next: (equipeUpdated) => {
                const index = this.equipes.findIndex(e => e.idEquipe === equipeId);
                if (index !== -1) {
                  this.equipes[index] = equipeUpdated;
                }
                this.toastr.success('Les membres ont été ajoutés avec succès', 'Succès');
              },
              error: (error) => {
                console.error('Erreur lors du rechargement de l\'équipe:', error);
                this.chargerEquipes();
              }
            });
          },
          error: (error) => {
            console.error('Erreur lors de l\'ajout des membres:', error);
            this.toastr.error('Impossible d\'ajouter les membres', 'Erreur');
          }
        });
      }
    });
  }

  supprimerMembre(equipeId: number, membreEquipeId: number) {
    this.dialogService.open(ConfirmationDialogComponent, {
      context: {
        title: 'Supprimer le membre',
        content: 'Êtes-vous sûr de vouloir retirer ce membre de l\'équipe ?'
      }
    }).onClose.subscribe((confirm: boolean) => {
      if (confirm) {
        this.equipeService.supprimerMembre(equipeId, membreEquipeId).subscribe({
          next: () => {
            this.chargerEquipes();
            this.toastr.success('Membre supprimé avec succès', 'Succès');
          },
          error: (error) => {
            console.error('Erreur lors de la suppression du membre:', error);
            this.toastr.error('Impossible de supprimer le membre', 'Erreur');
          }
        });
      }
    });
  }
} 