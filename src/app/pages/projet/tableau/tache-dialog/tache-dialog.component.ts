import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NbDialogRef, NbCardModule, NbButtonModule, NbInputModule, NbSelectModule, NbDatepickerModule } from '@nebular/theme';
import { PrioriteTache, StatutTache } from '../../services/api.service';

@Component({
  selector: 'ngx-tache-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NbCardModule,
    NbButtonModule,
    NbInputModule,
    NbSelectModule,
    NbDatepickerModule
  ],
  template: `
    <nb-card>
      <nb-card-header>
        {{ tache?.id ? 'Modifier la tâche' : 'Nouvelle tâche' }}
      </nb-card-header>
      <nb-card-body>
        <form [formGroup]="tacheForm">
          <div class="form-group">
            <label for="titre">Titre *</label>
            <input nbInput fullWidth id="titre" formControlName="titre" placeholder="Titre de la tâche">
          </div>

          <div class="form-group">
            <label for="description">Description</label>
            <textarea nbInput fullWidth id="description" formControlName="description" placeholder="Description"></textarea>
          </div>

          <div class="form-group">
            <label for="statut">Statut *</label>
            <nb-select fullWidth id="statut" formControlName="statut">
              <nb-option [value]="StatutTache.EnCours">En cours</nb-option>
              <nb-option [value]="StatutTache.Terminee">Terminée</nb-option>
              <nb-option [value]="StatutTache.Annulee">Annulée</nb-option>
            </nb-select>
          </div>

          <div class="form-group">
            <label for="priorite">Priorité *</label>
            <nb-select fullWidth id="priorite" formControlName="priorite">
              <nb-option [value]="PrioriteTache.Faible">Faible</nb-option>
              <nb-option [value]="PrioriteTache.Moyenne">Moyenne</nb-option>
              <nb-option [value]="PrioriteTache.Elevee">Élevée</nb-option>
            </nb-select>
          </div>

          <div class="form-group">
            <label for="dateEcheance">Date d'échéance</label>
            <input nbInput fullWidth id="dateEcheance" formControlName="dateEcheance" [nbDatepicker]="datepicker">
            <nb-datepicker #datepicker></nb-datepicker>
          </div>

          <div class="form-group">
            <label for="assigneId">Assigné à</label>
            <nb-select fullWidth id="assigneId" formControlName="assigneId">
              <nb-option [value]="null">Non assigné</nb-option>
              <nb-option *ngFor="let user of users" [value]="user.id">{{ user.name }}</nb-option>
            </nb-select>
          </div>
        </form>
      </nb-card-body>
      <nb-card-footer class="d-flex justify-content-end">
        <button nbButton status="basic" (click)="annuler()">Annuler</button>
        <button nbButton status="primary" (click)="valider()" [disabled]="!tacheForm.valid" class="ms-2">
          {{ tache?.id ? 'Modifier' : 'Créer' }}
        </button>
      </nb-card-footer>
    </nb-card>
  `,
  styles: [`
    .form-group {
      margin-bottom: 1rem;
    }
    label {
      display: block;
      margin-bottom: 0.5rem;
    }
    .ms-2 {
      margin-left: 0.5rem;
    }
  `]
})
export class TacheDialogComponent {
  @Input() tache?: any;
  @Input() users: any[] = [];
  @Input() mode: 'create' | 'edit' = 'create';

  tacheForm: FormGroup;
  StatutTache = StatutTache;
  PrioriteTache = PrioriteTache;

  constructor(
    private dialogRef: NbDialogRef<TacheDialogComponent>,
    private fb: FormBuilder
  ) {
    this.tacheForm = this.fb.group({
      titre: ['', Validators.required],
      description: [''],
      statut: [StatutTache.EnCours, Validators.required],
      priorite: [PrioriteTache.Moyenne, Validators.required],
      dateEcheance: [null],
      assigneId: [null],
      projetId: [null],
      listeId: [null]
    });
  }

  ngOnInit() {
    if (this.tache) {
      this.tacheForm.patchValue(this.tache);
    }
  }

  annuler() {
    this.dialogRef.close();
  }

  valider() {
    if (this.tacheForm.valid) {
      this.dialogRef.close(this.tacheForm.value);
    }
  }
} 