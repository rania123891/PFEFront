import { Component, Input, OnInit } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Equipe, StatutEquipe, Domaine } from '../models/equipe.model';

@Component({
  selector: 'ngx-modifier-equipe',
  template: `
    <nb-card>
      <nb-card-header>
        <h3>{{ equipe ? 'Modifier l\'équipe' : 'Nouvelle équipe' }}</h3>
      </nb-card-header>
      <nb-card-body>
        <form [formGroup]="equipeForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="nom" class="label">Nom de l'équipe *</label>
            <input nbInput
                   fullWidth
                   id="nom"
                   formControlName="nom"
                   placeholder="Nom de l'équipe"
                   [status]="equipeForm.get('nom')?.touched ? (equipeForm.get('nom')?.invalid ? 'danger' : 'success') : 'basic'">
            <small class="text-danger" *ngIf="equipeForm.get('nom')?.invalid && equipeForm.get('nom')?.touched">
              Le nom de l'équipe est requis
            </small>
          </div>

          <div class="form-group">
            <label for="statut" class="label">Statut *</label>
            <nb-select fullWidth id="statut" formControlName="statut">
              <nb-option [value]="StatutEquipe.Active">Active</nb-option>
              <nb-option [value]="StatutEquipe.Inactive">Inactive</nb-option>
            </nb-select>
          </div>

          <div class="form-group">
            <label for="domaineActivite" class="label">Domaine d'activité *</label>
            <nb-select fullWidth id="domaineActivite" formControlName="domaineActivite">
              <nb-option [value]="Domaine.FrontEnd">Front-end</nb-option>
              <nb-option [value]="Domaine.BackEnd">Back-end</nb-option>
              <nb-option [value]="Domaine.BaseDonnee">Base de données</nb-option>
            </nb-select>
          </div>

          <div class="d-flex justify-content-end mt-4">
            <button nbButton status="basic" type="button" class="mr-2" (click)="annuler()">
              Annuler
            </button>
            <button nbButton
                    status="primary"
                    type="submit"
                    [disabled]="equipeForm.invalid || isSubmitting">
              {{ equipe ? 'Modifier' : 'Créer' }}
            </button>
          </div>
        </form>
      </nb-card-body>
    </nb-card>
  `,
  styles: [`
    .form-group {
      margin-bottom: 1.5rem;
    }

    .label {
      display: block;
      margin-bottom: 0.5rem;
      font-size: 1rem;
      color: #444;
    }
  `]
})
export class ModifierEquipeComponent implements OnInit {
  @Input() equipe?: Equipe;
  @Input() projetId!: number;

  equipeForm: FormGroup;
  isSubmitting = false;
  StatutEquipe = StatutEquipe;
  Domaine = Domaine;

  constructor(
    private dialogRef: NbDialogRef<ModifierEquipeComponent>,
    private fb: FormBuilder
  ) {
    this.equipeForm = this.fb.group({
      nom: ['', Validators.required],
      statut: [StatutEquipe.Active, Validators.required],
      domaineActivite: [Domaine.FrontEnd, Validators.required],
    });
  }

  ngOnInit() {
    if (this.equipe) {
      this.equipeForm.patchValue({
        nom: this.equipe.nom,
        statut: this.equipe.statut,
        domaineActivite: this.equipe.domaineActivite,
      });
    }
  }

  onSubmit() {
    if (this.equipeForm.valid) {
      this.isSubmitting = true;
      const equipeData: Equipe = {
        ...this.equipeForm.value,
        projetId: this.projetId,
      };
      
      if (this.equipe?.idEquipe) {
        equipeData.idEquipe = this.equipe.idEquipe;
      }

      this.dialogRef.close(equipeData);
    }
  }

  annuler() {
    this.dialogRef.close();
  }
} 