import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService, StatutProjet } from '../services/api.service';
import { NbToastrService } from '@nebular/theme';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'ngx-ajouter-projet',
  template: `
    <div class="row">
      <div class="col-md-12">
        <nb-card>
          <nb-card-header>
            <h5>Nouveau projet</h5>
          </nb-card-header>
          <nb-card-body>
            <form [formGroup]="projetForm" (ngSubmit)="onSubmit()">
              <div class="form-group">
                <label for="nom" class="label">Nom du projet *</label>
                <input
                  nbInput
                  fullWidth
                  id="nom"
                  formControlName="nom"
                  placeholder="Entrez le nom du projet"
                  [status]="projetForm.get('nom').touched && projetForm.get('nom').invalid ? 'danger' : 'basic'"
                >
                <span class="error" *ngIf="projetForm.get('nom').touched && projetForm.get('nom').invalid">
                  Le nom du projet est requis
                </span>
              </div>

              <div class="form-group">
                <label for="description" class="label">Description</label>
                <textarea
                  nbInput
                  fullWidth
                  id="description"
                  formControlName="description"
                  placeholder="Décrivez votre projet"
                  rows="3"
                ></textarea>
              </div>

              <div class="form-group">
                <label for="statut" class="label">Statut *</label>
                <nb-select
                  fullWidth
                  id="statut"
                  formControlName="statut"
                  placeholder="Sélectionnez le statut"
                  [status]="projetForm.get('statut').touched && projetForm.get('statut').invalid ? 'danger' : 'basic'"
                >
                  <nb-option [value]="StatutProjet.EnCours">En cours</nb-option>
                  <nb-option [value]="StatutProjet.Termine">Terminé</nb-option>
                  <nb-option [value]="StatutProjet.Annule">Annulé</nb-option>
                </nb-select>
                <span class="error" *ngIf="projetForm.get('statut').touched && projetForm.get('statut').invalid">
                  Le statut est requis
                </span>
              </div>

              <div class="form-control-group">
                <label class="label" for="dateDebut">Date de début *</label>
                <input
                  nbInput
                  fullWidth
                  id="dateDebut"
                  formControlName="dateDebut"
                  [nbDatepicker]="dateDebutPicker"
                  placeholder="Sélectionnez une date"
                  [status]="projetForm.get('dateDebut').touched && projetForm.get('dateDebut').invalid ? 'danger' : 'basic'"
                >
                <nb-datepicker #dateDebutPicker></nb-datepicker>
                <span class="error" *ngIf="projetForm.get('dateDebut').touched && projetForm.get('dateDebut').invalid">
                  La date de début est requise
                </span>
              </div>

              <div class="form-control-group">
                <label class="label" for="dateEcheance">Date d'échéance *</label>
                <input
                  nbInput
                  fullWidth
                  id="dateEcheance"
                  formControlName="dateEcheance"
                  [nbDatepicker]="dateEcheancePicker"
                  placeholder="Sélectionnez une date"
                  [status]="projetForm.get('dateEcheance').touched && projetForm.get('dateEcheance').invalid ? 'danger' : 'basic'"
                >
                <nb-datepicker #dateEcheancePicker></nb-datepicker>
                <span class="error" *ngIf="projetForm.get('dateEcheance').touched && projetForm.get('dateEcheance').invalid">
                  La date d'échéance est requise
                </span>
              </div>

              <div class="form-group">
                <label for="duree" class="label">Durée (en jours) *</label>
                <input
                  nbInput
                  fullWidth
                  type="number"
                  min="1"
                  id="duree"
                  formControlName="duree"
                  placeholder="Entrez la durée en jours"
                  [status]="projetForm.get('duree').touched && projetForm.get('duree').invalid ? 'danger' : 'basic'"
                >
                <span class="error" *ngIf="projetForm.get('duree').touched && projetForm.get('duree').invalid">
                  La durée est requise et doit être supérieure à 0
                </span>
              </div>

              <div class="form-buttons-group">
                <button nbButton
                        status="basic"
                        type="button"
                        (click)="annuler()">
                  Annuler
                </button>
                <button nbButton
                        status="primary"
                        type="submit"
                        [disabled]="projetForm.invalid || isSubmitting">
                  {{ isSubmitting ? 'Création en cours...' : 'Créer le projet' }}
                </button>
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

    .form-control-group {
      margin-bottom: 1.5rem;
    }

    .label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
    }

    .error {
      display: block;
      color: #ff3d71;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }

    .form-buttons-group {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 2rem;
    }

    nb-card {
      margin-bottom: 0;
    }

    nb-card-header h5 {
      margin: 0;
    }
  `],
})
export class AjouterProjetComponent implements OnInit {
  projetForm: FormGroup;
  isSubmitting = false;
  StatutProjet = StatutProjet; // Pour utiliser l'enum dans le template

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router,
    private toastrService: NbToastrService,
  ) {}

  ngOnInit() {
    this.projetForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      statut: [StatutProjet.EnCours, Validators.required],
      dateDebut: [new Date(), Validators.required],
      dateEcheance: [null, Validators.required],
      duree: [30, [Validators.required, Validators.min(1)]],
      createurId: [1], // À remplacer par l'ID de l'utilisateur connecté
    });

    // Mettre à jour automatiquement la durée lorsque les dates changent
    this.projetForm.get('dateDebut').valueChanges.subscribe(() => this.calculerDuree());
    this.projetForm.get('dateEcheance').valueChanges.subscribe(() => this.calculerDuree());
  }

  calculerDuree() {
    const dateDebut = this.projetForm.get('dateDebut').value;
    const dateEcheance = this.projetForm.get('dateEcheance').value;
    
    if (dateDebut && dateEcheance) {
      const diffTime = Math.abs(dateEcheance - dateDebut);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      this.projetForm.patchValue({ duree: diffDays }, { emitEvent: false });
    }
  }

  onSubmit() {
    if (this.projetForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;

      const formValue = this.projetForm.value;
      
      // Formatage des dates au format UTC sans millisecondes
      const dateDebut = new Date(formValue.dateDebut);
      const dateEcheance = new Date(formValue.dateEcheance);
      
      const projet = {
        nom: formValue.nom,
        description: formValue.description || '',
        statut: formValue.statut,
        dateDebut: dateDebut.toISOString(),
        dateEcheance: dateEcheance.toISOString(),
        duree: formValue.duree,
        createurId: formValue.createurId,
      };

      console.log('Données du projet à envoyer:', projet);

      this.apiService.createProjet(projet)
        .pipe(
          catchError(error => {
            console.error('Erreur détaillée:', error);
            console.error('Corps de la réponse:', error.error);
            let errorMessage = 'Une erreur est survenue lors de la création du projet';
            
            if (error.status === 0) {
              errorMessage = 'Impossible de contacter le serveur. Vérifiez que le backend est en cours d\'exécution.';
            } else if (error.status === 400) {
              errorMessage = 'Les données du projet sont invalides. Vérifiez les champs requis.';
              if (error.error && error.error.errors) {
                console.error('Erreurs de validation:', error.error.errors);
                // Afficher les erreurs de validation spécifiques
                const errors = error.error.errors;
                Object.keys(errors).forEach(key => {
                  this.toastrService.danger(errors[key].join(', '), `Erreur: ${key}`);
                });
              }
            } else if (error.status === 500) {
              errorMessage = 'Une erreur serveur est survenue. Veuillez réessayer plus tard.';
            }
            
            this.toastrService.danger(errorMessage, 'Erreur');
            return of(null);
          }),
          finalize(() => {
            this.isSubmitting = false;
          })
        )
        .subscribe(
          (response) => {
            if (response) {
              this.toastrService.success(
                'Le projet a été créé avec succès',
                'Succès'
              );
              this.router.navigate(['/pages/projet']);
            }
          }
        );
    } else {
      Object.keys(this.projetForm.controls).forEach(key => {
        const control = this.projetForm.get(key);
        if (control.invalid) {
          control.markAsTouched();
          console.error(`Champ invalide: ${key}`, control.errors);
        }
      });
    }
  }

  annuler() {
    this.router.navigate(['/pages/projet']);
  }
} 