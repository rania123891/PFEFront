import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';
import { Projet } from '../models/projet.model';
import { StatutProjet } from '../models/statut-projet.enum';
import { NbDialogService, NbDialogConfig } from '@nebular/theme';
import { ToastrService } from 'ngx-toastr';
import { ModifierProjetComponent } from '../modifier-projet/modifier-projet.component';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { ProjetMenuService } from '../services/projet-menu.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'ngx-tous-projets',
  template: `
    <nb-card>
      <nb-card-header class="d-flex justify-content-between align-items-center">
        <div>
          <h1>Tous les projets</h1>
          <p class="text-hint">Vue d'ensemble de tous vos projets</p>
        </div>
        <div class="actions">
          <button nbButton status="primary" (click)="ajouterProjet()">
            <nb-icon icon="plus-outline"></nb-icon>
            Nouveau projet
          </button>
        </div>
      </nb-card-header>

      <nb-card-body>
        <!-- Filtres et recherche -->
        <div class="row mb-4">
          <div class="col-md-4">
            <nb-form-field>
              <nb-icon nbPrefix icon="search-outline"></nb-icon>
              <input 
                type="text" 
                nbInput 
                fullWidth
                placeholder="Rechercher un projet..." 
                [(ngModel)]="searchTerm"
                (ngModelChange)="filtrerProjets()">
            </nb-form-field>
          </div>
          <div class="col-md-4">
            <nb-select 
              fullWidth 
              placeholder="Filtrer par statut" 
              [(ngModel)]="statutFiltre"
              (selectedChange)="filtrerProjets()">
              <nb-option [value]="null">Tous les statuts</nb-option>
              <nb-option *ngFor="let statut of statutsPossibles" [value]="statut">
                {{ getStatutLabel(statut) }}
              </nb-option>
            </nb-select>
          </div>
          <div class="col-md-4">
            <nb-select 
              fullWidth 
              placeholder="Trier par" 
              [(ngModel)]="triActuel"
              (selectedChange)="filtrerProjets()">
              <nb-option value="nom">Nom</nb-option>
              <nb-option value="dateDebut">Date de début</nb-option>
              <nb-option value="dateEcheance">Date d'échéance</nb-option>
            </nb-select>
          </div>
        </div>

        <!-- État de chargement -->
        <div *ngIf="isLoading" class="d-flex justify-content-center my-5">
          <nb-spinner status="primary"></nb-spinner>
        </div>

        <!-- Message d'erreur -->
        <nb-alert *ngIf="errorMessage" status="danger" class="mb-4">
          {{ errorMessage }}
          <button nbButton ghost status="primary" class="ml-3" (click)="chargerProjets()">
            <nb-icon icon="refresh-outline"></nb-icon>
            Réessayer
          </button>
        </nb-alert>

        <!-- Statistiques -->
        <div *ngIf="!isLoading && !errorMessage" class="row mb-4">
          <div class="col-md-3">
            <nb-card class="stat-card">
              <nb-card-body>
                <div class="stat-icon">
                  <nb-icon icon="folder-outline"></nb-icon>
                </div>
                <div class="stat-details">
                  <div class="stat-value">{{ projets.length }}</div>
                  <div class="stat-label">Total projets</div>
                </div>
              </nb-card-body>
            </nb-card>
          </div>
          <div class="col-md-3">
            <nb-card class="stat-card">
              <nb-card-body>
                <div class="stat-icon warning">
                  <nb-icon icon="activity-outline"></nb-icon>
                </div>
                <div class="stat-details">
                  <div class="stat-value">{{ getProjetsParStatut(StatutProjet.EnCours).length }}</div>
                  <div class="stat-label">En cours</div>
                </div>
              </nb-card-body>
            </nb-card>
          </div>
          <div class="col-md-3">
            <nb-card class="stat-card">
              <nb-card-body>
                <div class="stat-icon success">
                  <nb-icon icon="checkmark-circle-2-outline"></nb-icon>
                </div>
                <div class="stat-details">
                  <div class="stat-value">{{ getProjetsParStatut(StatutProjet.Termine).length }}</div>
                  <div class="stat-label">Terminés</div>
                </div>
              </nb-card-body>
            </nb-card>
          </div>
          <div class="col-md-3">
            <nb-card class="stat-card">
              <nb-card-body>
                <div class="stat-icon danger">
                  <nb-icon icon="slash-outline"></nb-icon>
                </div>
                <div class="stat-details">
                  <div class="stat-value">{{ getProjetsParStatut(StatutProjet.Annule).length }}</div>
                  <div class="stat-label">Annulés</div>
                </div>
              </nb-card-body>
            </nb-card>
          </div>
        </div>

        <!-- Liste des projets -->
        <div *ngIf="!isLoading && !errorMessage" class="row">
          <div *ngIf="projetsFiltres.length === 0" class="col-12 text-center my-5">
            <nb-icon icon="folder-outline" class="empty-icon"></nb-icon>
            <h3>Aucun projet trouvé</h3>
            <p class="text-hint">{{ searchTerm || statutFiltre ? 'Aucun projet ne correspond à vos critères de recherche.' : 'Commencez par créer votre premier projet.' }}</p>
            <button nbButton status="primary" (click)="ajouterProjet()">
              <nb-icon icon="plus-outline"></nb-icon>
              Nouveau projet
            </button>
          </div>
          
          <div class="col-md-6 col-xl-4 mb-4" *ngFor="let projet of projetsFiltres">
            <nb-card class="projet-card" [ngClass]="getProjetClass(projet)">
              <nb-card-header>
                <div class="d-flex justify-content-between align-items-center">
                  <h5 class="mb-0">{{ projet.nom }}</h5>
                  <nb-badge [text]="getStatutLabel(projet.statut)" [status]="getStatutBadgeStatus(projet.statut)">
                  </nb-badge>
                </div>
              </nb-card-header>
              <nb-card-body>
                <p class="description mb-4">{{ projet.description }}</p>
                <div class="dates mb-4">
                  <div class="date-item">
                    <nb-icon icon="calendar-outline"></nb-icon>
                    <span>Début: {{ projet.dateDebut | date:'dd/MM/yyyy' }}</span>
                  </div>
                  <div class="date-item">
                    <nb-icon icon="clock-outline"></nb-icon>
                    <span>Échéance: {{ projet.dateEcheance | date:'dd/MM/yyyy' }}</span>
                  </div>
                </div>
                <nb-progress-bar 
                  [value]="getProgression(projet)" 
                  [status]="getProgressStatus(projet.statut)"
                  [displayValue]="true">
                </nb-progress-bar>
              </nb-card-body>
              <nb-card-footer>
                <button nbButton ghost status="primary" (click)="ouvrirProjet(projet)">
                  <nb-icon icon="eye-outline"></nb-icon>
                  Voir le projet
                </button>
                <div class="actions">
                  <button nbButton ghost status="info" class="mr-2" (click)="modifierProjet(projet)">
                    <nb-icon icon="edit-outline"></nb-icon>
                  </button>
                  <button nbButton ghost status="danger" (click)="supprimerProjet(projet)">
                    <nb-icon icon="trash-2-outline"></nb-icon>
                  </button>
                </div>
              </nb-card-footer>
            </nb-card>
          </div>
        </div>
      </nb-card-body>
    </nb-card>
  `,
  styles: [`
    .stat-card nb-card-body {
      display: flex;
      align-items: center;
      padding: 1.5rem;
    }

    .stat-icon {
      font-size: 2.5rem;
      margin-right: 1rem;
      color: var(--primary-500);
      
      &.warning {
        color: var(--warning-500);
      }
      
      &.success {
        color: var(--success-500);
      }
      
      &.danger {
        color: var(--danger-500);
      }
    }

    .stat-details {
      .stat-value {
        font-size: 1.5rem;
        font-weight: bold;
        line-height: 1;
        margin-bottom: 0.25rem;
      }
      
      .stat-label {
        color: var(--text-hint-color);
        font-size: 0.875rem;
      }
    }

    .projet-card {
      height: 100%;
      transition: transform 0.2s, box-shadow 0.2s;
      
      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }

      &.en-cours {
        border-left: 4px solid var(--warning-500);
      }
      
      &.termine {
        border-left: 4px solid var(--success-500);
      }
      
      &.annule {
        border-left: 4px solid var(--danger-500);
      }
    }

    .description {
      color: var(--text-hint-color);
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .dates {
      .date-item {
        display: flex;
        align-items: center;
        margin-bottom: 0.5rem;
        color: var(--text-hint-color);
        
        nb-icon {
          margin-right: 0.5rem;
          font-size: 1.25rem;
        }
      }
    }

    nb-card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .actions {
        display: flex;
        gap: 0.5rem;
      }
    }

    .mb-4 {
      margin-bottom: 1.5rem;
    }

    .mr-2 {
      margin-right: 0.5rem;
    }

    .empty-icon {
      font-size: 4rem;
      color: var(--text-hint-color);
      margin-bottom: 1rem;
    }
    
    .ml-3 {
      margin-left: 1rem;
    }
    
    .my-5 {
      margin-top: 2rem;
      margin-bottom: 2rem;
    }
  `]
})
export class TousProjetsComponent implements OnInit {
  projets: Projet[] = [];
  projetsFiltres: Projet[] = [];
  searchTerm: string = '';
  statutFiltre: StatutProjet | null = null;
  triActuel: string = 'nom';
  StatutProjet = StatutProjet;
  statutsPossibles = Object.values(StatutProjet);
  isLoading: boolean = true;
  errorMessage: string | null = null;

  constructor(
    private apiService: ApiService,
    private router: Router,
    private dialogService: NbDialogService,
    private toastr: ToastrService,
    private projetMenuService: ProjetMenuService
  ) {}

  ngOnInit() {
    console.log('TousProjetsComponent - ngOnInit');
    this.chargerProjets();
  }

  chargerProjets() {
    this.isLoading = true;
    this.errorMessage = null;

    // D'abord, vérifier le cache
    this.projetMenuService.getProjetsCaches()
      .pipe(take(1))
      .subscribe({
        next: (projetsCache) => {
          if (projetsCache.length > 0) {
            this.projets = projetsCache;
            this.projetsFiltres = projetsCache;
            this.filtrerProjets();
            this.isLoading = false;
          } else {
            // Si le cache est vide, forcer un rafraîchissement
            this.projetMenuService.refreshCache();
            this.projetMenuService.getProjetsCaches()
              .pipe(take(1))
              .subscribe({
                next: (projets) => {
                  this.projets = projets;
                  this.projetsFiltres = projets;
                  this.filtrerProjets();
                  this.isLoading = false;
                },
                error: (err) => {
                  console.error('Erreur lors du chargement des projets:', err);
                  this.errorMessage = 'Une erreur est survenue lors du chargement des projets.';
                  this.isLoading = false;
                }
              });
          }
        },
        error: (err) => {
          console.error('Erreur lors de l\'accès au cache des projets:', err);
          this.errorMessage = 'Une erreur est survenue lors du chargement des projets.';
          this.isLoading = false;
        }
      });
  }

  filtrerProjets() {
    let projetsFiltered = [...this.projets];
    
    // Filtre par recherche
    if (this.searchTerm) {
      const searchLower = this.searchTerm.toLowerCase();
      projetsFiltered = projetsFiltered.filter(p => 
        p.nom.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower)
      );
    }
    
    // Filtre par statut
    if (this.statutFiltre !== null) {
      projetsFiltered = projetsFiltered.filter(p => p.statut === this.statutFiltre);
    }
    
    // Tri
    projetsFiltered.sort((a, b) => {
      switch (this.triActuel) {
        case 'nom':
          return a.nom.localeCompare(b.nom);
        case 'dateDebut':
          return new Date(a.dateDebut).getTime() - new Date(b.dateDebut).getTime();
        case 'dateEcheance':
          return new Date(a.dateEcheance).getTime() - new Date(b.dateEcheance).getTime();
        default:
          return 0;
      }
    });
    
    this.projetsFiltres = projetsFiltered;
  }

  getProjetsParStatut(statut: StatutProjet): Projet[] {
    return this.projets.filter(p => p.statut === statut);
  }

  getStatutLabel(statut: StatutProjet): string {
    switch (statut) {
      case StatutProjet.EnCours:
        return 'En cours';
      case StatutProjet.Termine:
        return 'Terminé';
      case StatutProjet.Annule:
        return 'Annulé';
      default:
        return 'Inconnu';
    }
  }

  getStatutBadgeStatus(statut: StatutProjet): string {
    switch (statut) {
      case StatutProjet.EnCours:
        return 'warning';
      case StatutProjet.Termine:
        return 'success';
      case StatutProjet.Annule:
        return 'danger';
      default:
        return 'basic';
    }
  }

  getProgressStatus(statut: StatutProjet): string {
    switch (statut) {
      case StatutProjet.EnCours:
        return 'warning';
      case StatutProjet.Termine:
        return 'success';
      case StatutProjet.Annule:
        return 'danger';
      default:
        return 'basic';
    }
  }

  getProjetClass(projet: Projet): string {
    switch (projet.statut) {
      case StatutProjet.EnCours:
        return 'en-cours';
      case StatutProjet.Termine:
        return 'termine';
      case StatutProjet.Annule:
        return 'annule';
      default:
        return '';
    }
  }

  getProgression(projet: Projet): number {
    if (projet.statut === StatutProjet.Termine) return 100;
    if (projet.statut === StatutProjet.Annule) return 0;
    
    const debut = new Date(projet.dateDebut).getTime();
    const fin = new Date(projet.dateEcheance).getTime();
    const maintenant = new Date().getTime();
    
    if (maintenant <= debut) return 0;
    if (maintenant >= fin) return 100;
    
    const dureeTotal = fin - debut;
    const dureePassee = maintenant - debut;
    
    return Math.round((dureePassee / dureeTotal) * 100);
  }

  ajouterProjet() {
    this.router.navigate(['/pages/projet/nouveau']);
  }

  ouvrirProjet(projet: Projet) {
    this.router.navigate(['/pages/projet', projet.id, 'tableau']);
  }

  modifierProjet(projet: Projet) {
    this.dialogService.open(ModifierProjetComponent, {
      context: {
        projet: { ...projet },
      },
      hasBackdrop: true,
      closeOnBackdropClick: true,
      closeOnEsc: true,
    }).onClose.subscribe((projetModifie: Projet) => {
      if (projetModifie) {
        this.apiService.updateProjet(projetModifie.id, projetModifie).subscribe(
          (resultat) => {
            this.toastr.success('Projet modifié avec succès', 'Succès');
            this.chargerProjets();
          },
          (erreur) => {
            this.toastr.error('Erreur lors de la modification du projet', 'Erreur');
            console.error('Erreur:', erreur);
          }
        );
      }
    });
  }

  supprimerProjet(projet: Projet) {
    this.dialogService.open(ConfirmationDialogComponent, {
      context: {
        title: 'Supprimer le projet',
        content: `Êtes-vous sûr de vouloir supprimer le projet "${projet.nom}" ?`
      },
      hasBackdrop: true,
      closeOnBackdropClick: true,
      closeOnEsc: true,
    }).onClose.subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.apiService.deleteProjet(projet.id).subscribe(
          () => {
            this.toastr.success('Projet supprimé avec succès', 'Succès');
            this.chargerProjets();
          },
          (erreur) => {
            this.toastr.error('Erreur lors de la suppression du projet', 'Erreur');
            console.error('Erreur:', erreur);
          }
        );
      }
    });
  }
} 