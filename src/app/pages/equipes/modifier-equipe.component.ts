import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Equipe, StatutEquipe, Domaine } from './equipe.model';
import { EquipeService, Projet } from './equipe.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'ngx-modifier-equipe',
  template: `
    <div class="row">
      <div class="col-md-12">
        <nb-card>
          <nb-card-header>
            <h1>{{ mode === 'ajout' ? 'Nouvelle équipe' : 'Modifier équipe' }}</h1>
          </nb-card-header>
          <nb-card-body>
            <div *ngIf="isLoading" class="d-flex justify-content-center my-5">
              <nb-spinner status="primary"></nb-spinner>
            </div>

            <form *ngIf="!isLoading" [formGroup]="equipeForm" (ngSubmit)="onSubmit()">
              <div class="form-group row">
                <label class="col-sm-3 col-form-label">Projet *</label>
                <div class="col-sm-9">
                  <nb-select fullWidth formControlName="projetId" placeholder="Sélectionnez un projet">
                    <nb-option *ngFor="let projet of projets" [value]="projet.id">
                      {{ projet.nom }}
                    </nb-option>
                  </nb-select>
                  <small class="text-danger" *ngIf="equipeForm.get('projetId')?.invalid && equipeForm.get('projetId')?.touched">
                    Le projet est requis
                  </small>
                </div>
              </div>

              <div class="form-group row">
                <label class="col-sm-3 col-form-label">Nom *</label>
                <div class="col-sm-9">
                  <input nbInput
                         fullWidth
                         formControlName="nom"
                         placeholder="Nom de l'équipe"
                         [status]="equipeForm.get('nom')?.touched ? (equipeForm.get('nom')?.invalid ? 'danger' : 'success') : 'basic'">
                  <small class="text-danger" *ngIf="equipeForm.get('nom')?.invalid && equipeForm.get('nom')?.touched">
                    Le nom est requis
                  </small>
                </div>
              </div>

              <div class="form-group row">
                <label class="col-sm-3 col-form-label">Statut *</label>
                <div class="col-sm-9">
                  <nb-select fullWidth formControlName="statut">
                    <nb-option [value]="0">Active</nb-option>
                    <nb-option [value]="1">Inactive</nb-option>
                  </nb-select>
                </div>
              </div>

              <div class="form-group row">
                <label class="col-sm-3 col-form-label">Domaine *</label>
                <div class="col-sm-9">
                  <nb-select fullWidth formControlName="domaineActivite">
                    <nb-option [value]="0">Front-end</nb-option>
                    <nb-option [value]="1">Back-end</nb-option>
                    <nb-option [value]="2">Base de données</nb-option>
                  </nb-select>
                </div>
              </div>

              <div class="form-group row">
                <div class="offset-sm-3 col-sm-9">
                  <button nbButton
                          status="primary"
                          type="submit"
                          [disabled]="equipeForm.invalid || isSubmitting">
                    {{ mode === 'ajout' ? 'Créer' : 'Modifier' }}
                  </button>
                  <button nbButton
                          status="basic"
                          type="button"
                          class="ml-3"
                          (click)="annuler()">
                    Annuler
                  </button>
                </div>
              </div>
            </form>
          </nb-card-body>
        </nb-card>
      </div>
    </div>
  `,
  styles: [`
    .form-group {
      margin-bottom: 1.5rem;
    }
    
    nb-select {
      width: 100%;
    }
    
    .ml-3 {
      margin-left: 1rem;
    }
  `]
})
export class ModifierEquipeComponent implements OnInit {
  equipeForm: FormGroup;
  isSubmitting = false;
  isLoading = false;
  mode: 'ajout' | 'modification' = 'ajout';
  equipeId?: number;
  StatutEquipe = StatutEquipe;
  Domaine = Domaine;
  projets: Projet[] = [];

  constructor(
    private fb: FormBuilder,
    private equipeService: EquipeService,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) {
    this.equipeForm = this.fb.group({
      projetId: [null, Validators.required],
      nom: ['', Validators.required],
      statut: [0, Validators.required],
      domaineActivite: [0, Validators.required],
    });
  }

  ngOnInit() {
    // Charger la liste des projets
    this.equipeService.getProjets().subscribe({
      next: (projets) => {
        this.projets = projets;
        console.log('Liste des projets chargée:', projets);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des projets:', error);
        this.toastr.error('Impossible de charger la liste des projets', 'Erreur');
      }
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.mode = 'modification';
      this.equipeId = +id;
      this.chargerEquipe(this.equipeId);
    }
  }

  chargerEquipe(id: number) {
    this.isLoading = true;
    this.equipeService.getEquipe(id).subscribe({
      next: (equipe) => {
        this.equipeForm.patchValue({
          projetId: equipe.projetId,
          nom: equipe.nom,
          statut: Number(equipe.statut),
          domaineActivite: Number(equipe.domaineActivite),
        });
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement de l\'équipe:', error);
        this.toastr.error('Impossible de charger l\'équipe', 'Erreur');
        this.router.navigate(['/pages/equipes']);
      }
    });
  }

  onSubmit() {
    if (this.equipeForm.valid) {
      this.isSubmitting = true;

      const equipeData: Equipe = {
        projetId: Number(this.equipeForm.value.projetId),
        nom: this.equipeForm.value.nom,
        statut: Number(this.equipeForm.value.statut),
        domaineActivite: Number(this.equipeForm.value.domaineActivite)
      };

      console.log('Données du formulaire à envoyer:', equipeData);

      const action = this.mode === 'modification'
        ? this.equipeService.updateEquipe(this.equipeId!, equipeData)
        : this.equipeService.createEquipe(equipeData);

      action.subscribe({
        next: () => {
          const message = this.mode === 'modification'
            ? 'L\'équipe a été modifiée avec succès'
            : 'L\'équipe a été créée avec succès';
          this.toastr.success(message, 'Succès');
          this.router.navigate(['/pages/equipes']);
        },
        error: (error) => {
          console.error('Erreur lors de la sauvegarde de l\'équipe:', error);
          if (error.error?.errors) {
            console.log('Détails des erreurs de validation:', error.error.errors);
          }
          this.toastr.error('Impossible de sauvegarder l\'équipe', 'Erreur');
          this.isSubmitting = false;
        }
      });
    }
  }

  annuler() {
    this.router.navigate(['/pages/equipes']);
  }
} 