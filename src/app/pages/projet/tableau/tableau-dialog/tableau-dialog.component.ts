import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NbDialogRef } from '@nebular/theme';

@Component({
  selector: 'ngx-tableau-dialog',
  template: `
    <nb-card>
      <nb-card-header>
        <h5 class="mb-0">{{ titre }}</h5>
      </nb-card-header>

      <nb-card-body>
        <form [formGroup]="tableauForm" (ngSubmit)="submit()">
          <div class="form-group">
            <label for="nom" class="label">Nom du tableau</label>
            <input
              type="text"
              nbInput
              fullWidth
              id="nom"
              formControlName="nom"
              [status]="tableauForm.get('nom').touched && tableauForm.get('nom').invalid ? 'danger' : 'basic'"
              placeholder="Entrez le nom du tableau">
            <div *ngIf="tableauForm.get('nom').touched && tableauForm.get('nom').invalid" class="text-danger">
              <small *ngIf="tableauForm.get('nom').errors?.['required']">Le nom est requis</small>
            </div>
          </div>

          <div class="form-group">
            <label for="description" class="label">Description</label>
            <textarea
              nbInput
              fullWidth
              id="description"
              formControlName="description"
              [status]="tableauForm.get('description').touched && tableauForm.get('description').invalid ? 'danger' : 'basic'"
              placeholder="Description du tableau"
              rows="3">
            </textarea>
          </div>
        </form>
      </nb-card-body>

      <nb-card-footer class="d-flex justify-content-end">
        <button nbButton status="basic" (click)="annuler()">Annuler</button>
        <button nbButton status="primary" (click)="submit()" [disabled]="!tableauForm.valid" class="ml-3">
          Sauvegarder
        </button>
      </nb-card-footer>
    </nb-card>
  `,
  styles: [`
    .ml-3 {
      margin-left: 1rem;
    }
    .form-group {
      margin-bottom: 1.5rem;
    }
    .label {
      margin-bottom: 0.5rem;
      display: block;
    }
  `]
})
export class TableauDialogComponent implements OnInit {
  titre: string = 'Nouveau tableau';
  tableauForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: NbDialogRef<TableauDialogComponent>
  ) {
    this.tableauForm = this.fb.group({
      nom: ['', Validators.required],
      description: ['']
    });
  }

  ngOnInit(): void {}

  submit() {
    if (this.tableauForm.valid) {
      this.dialogRef.close(this.tableauForm.value);
    }
  }

  annuler() {
    this.dialogRef.close();
  }
} 