import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NbDialogRef, NbCardModule, NbButtonModule, NbIconModule, NbInputModule } from '@nebular/theme';
import { CommonModule } from '@angular/common';
import { Liste } from '../../services/api.service';

@Component({
  selector: 'ngx-ajouter-liste-dialog',
  template: `
    <nb-card>
      <nb-card-header>
        <div class="d-flex justify-content-between align-items-center">
          <h5 class="mb-0">{{ mode === 'edit' ? 'Modifier la liste' : 'Ajouter une liste' }}</h5>
          <button nbButton ghost (click)="dismiss()">
            <nb-icon icon="close-outline"></nb-icon>
          </button>
        </div>
      </nb-card-header>
      <nb-card-body>
        <form [formGroup]="listeForm">
          <div class="form-group">
            <label for="nom" class="label">Nom de la liste *</label>
            <input nbInput
                   fullWidth
                   id="nom"
                   formControlName="nom"
                   placeholder="Entrez le nom de la liste">
            <div *ngIf="listeForm.get('nom').touched && listeForm.get('nom').invalid" class="text-danger">
              <small *ngIf="listeForm.get('nom').errors?.required">Le nom est requis</small>
            </div>
          </div>
          <div class="form-group">
            <label for="position" class="label">Position</label>
            <input nbInput
                   fullWidth
                   type="number"
                   id="position"
                   formControlName="position"
                   placeholder="Position de la liste">
          </div>
        </form>
      </nb-card-body>
      <nb-card-footer class="d-flex justify-content-end">
        <button nbButton status="basic" class="mr-2" (click)="dismiss()">Annuler</button>
        <button nbButton status="primary" [disabled]="!listeForm.valid" (click)="submit()">
          {{ mode === 'edit' ? 'Enregistrer' : 'Créer' }}
        </button>
      </nb-card-footer>
    </nb-card>
  `,
  styles: [`
    .mr-2 {
      margin-right: 1rem;
    }
  `],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NbCardModule,
    NbButtonModule,
    NbIconModule,
    NbInputModule
  ]
})
export class AjouterListeDialogComponent implements OnInit {
  @Input() liste?: Partial<Liste>;
  @Input() mode: 'create' | 'edit' = 'create';
  listeForm: FormGroup;

  constructor(
    private dialogRef: NbDialogRef<AjouterListeDialogComponent>,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.listeForm = this.fb.group({
      nom: [this.liste?.nom || '', Validators.required],
      position: [this.liste?.position || 0]
    });
  }

  dismiss() {
    this.dialogRef.close();
  }

  submit() {
    if (this.listeForm.valid) {
      const listeData = {
        ...this.liste,
        ...this.listeForm.value,
      };
      this.dialogRef.close(listeData);
    }
  }
} 