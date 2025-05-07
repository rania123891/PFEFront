import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService, Projet, Tableau } from '../services/api.service';
import { NbToastrService } from '@nebular/theme';
import { catchError, map, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { ProjetMenuService } from '../services/projet-menu.service';
import { StatutProjet } from '../models/statut-projet.enum';

@Component({
  selector: 'ngx-liste-projets',
  template: `
    <div class="row">
      <div class="col-md-12">
        <nb-card>
          <nb-card-header class="d-flex justify-content-between align-items-center">
            <h5>Mes projets</h5>
            <button nbButton status="primary" size="small" (click)="ajouterProjet()">
              <nb-icon icon="plus-outline"></nb-icon>
              Nouveau projet
            </button>
          </nb-card-header>
          <nb-card-body>
            <div class="projet-list">
              <nb-list>
                <nb-list-item *ngFor="let projet of projets">
                  <div class="projet-item">
                    <div class="projet-info" (click)="ouvrirProjet(projet)">
                      <h6>{{ projet.nom }}</h6>
                      <p class="description">{{ projet.description }}</p>
                      <div class="metadata">
                        <span class="date">Début: {{ projet.dateDebut | date:'dd/MM/yyyy' }}</span>
                        <span class="date">Échéance: {{ projet.dateEcheance | date:'dd/MM/yyyy' }}</span>
                        <nb-badge [text]="getStatutLabel(projet.statut)" [status]="getStatutBadgeStatus(projet.statut)"></nb-badge>
                      </div>
                    </div>
                    <div class="projet-actions">
                      <button nbButton ghost size="small" (click)="modifierProjet(projet)">
                        <nb-icon icon="edit-outline"></nb-icon>
                      </button>
                      <button nbButton ghost status="danger" size="small" (click)="supprimerProjet(projet)">
                        <nb-icon icon="trash-2-outline"></nb-icon>
                      </button>
                    </div>
                  </div>
                </nb-list-item>
              </nb-list>
            </div>
          </nb-card-body>
        </nb-card>
      </div>
    </div>
  `,
  styles: [`
    .projet-list {
      margin: -0.5rem;
    }

    .projet-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .projet-item:hover {
      background-color: #f5f5f5;
    }

    .projet-info {
      flex: 1;
    }

    .projet-info h6 {
      margin: 0;
      color: #222b45;
    }

    .description {
      margin: 0.25rem 0;
      color: #8f9bb3;
      font-size: 0.875rem;
    }

    .metadata {
      display: flex;
      gap: 1rem;
      align-items: center;
      font-size: 0.875rem;
      color: #8f9bb3;
    }

    .projet-actions {
      display: flex;
      gap: 0.5rem;
    }

    nb-badge {
      margin-left: auto;
    }
  `]
})
export class ListeProjetsComponent implements OnInit {
  projets: Projet[] = [];

  constructor(
    private apiService: ApiService,
    private router: Router,
    private toastrService: NbToastrService,
    private projetMenuService: ProjetMenuService,
  ) {}

  ngOnInit() {
    this.chargerProjets();
  }

  chargerProjets() {
    console.log('Chargement des projets...');
    this.apiService.getProjets()
      .subscribe(
        (projets) => {
          console.log('Projets reçus:', projets);
          this.projets = projets;
          this.projetMenuService.updateProjetsMenu();
        },
        (error) => {
          console.error('Erreur lors du chargement des projets:', error);
          this.toastrService.danger(
            'Impossible de charger la liste des projets',
            'Erreur'
          );
        }
      );
  }

  ouvrirProjet(projet: Projet) {
    this.router.navigate(['/pages/projet', projet.id, 'tableau']);
  }

  ajouterProjet() {
    this.router.navigate(['/pages/projet/nouveau']);
  }

  modifierProjet(projet: Projet) {
    this.router.navigate(['/pages/projet', projet.id, 'modifier']);
  }

  supprimerProjet(projet: Projet) {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le projet "${projet.nom}" ?`)) {
      this.apiService.deleteProjet(projet.id)
        .subscribe(
          () => {
            this.toastrService.success(
              'Le projet a été supprimé avec succès',
              'Succès'
            );
            this.chargerProjets();
          },
          (error) => {
            console.error('Erreur lors de la suppression du projet:', error);
            this.toastrService.danger(
              'Impossible de supprimer le projet',
              'Erreur'
            );
          }
        );
    }
  }

  getStatutBadgeStatus(statut: StatutProjet): string {
    switch (statut) {
      case StatutProjet.EnCours:
        return 'info';
      case StatutProjet.Termine:
        return 'success';
      case StatutProjet.Annule:
        return 'danger';
      default:
        return 'basic';
    }
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
} 