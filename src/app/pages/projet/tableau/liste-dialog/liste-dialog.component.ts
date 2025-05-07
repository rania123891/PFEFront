import { Component, OnInit } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'ngx-liste-dialog',
  template: `
    <nb-card>
      <nb-card-header class="d-flex justify-content-between align-items-center">
        <h5 class="mb-0">{{ titre }}</h5>
        <button nbButton ghost (click)="fermer()">
          <nb-icon icon="close-outline"></nb-icon>
        </button>
      </nb-card-header>

      <nb-card-body>
        <form (ngSubmit)="sauvegarder()" #listeForm="ngForm">
          <div class="form-group">
            <label for="nom" class="label">Nom de la liste</label>
            <input
              type="text"
              nbInput
              fullWidth
              id="nom"
              name="nom"
              [(ngModel)]="liste.nom"
              #nom="ngModel"
              required
              [status]="nom.invalid && nom.touched ? 'danger' : 'basic'"
              placeholder="Entrez le nom de la liste">
            <div *ngIf="nom.invalid && nom.touched" class="text-danger">
              <small *ngIf="nom.errors?.['required']">Le nom est requis</small>
            </div>
          </div>

          <div class="form-group">
            <label for="position" class="label">Position</label>
            <input
              type="number"
              nbInput
              fullWidth
              id="position"
              name="position"
              [(ngModel)]="liste.position"
              placeholder="Position de la liste">
          </div>
        </form>
      </nb-card-body>

      <nb-card-footer class="d-flex justify-content-end">
        <button nbButton status="basic" (click)="fermer()">Annuler</button>
        <button nbButton status="primary" (click)="sauvegarder()" [disabled]="!listeForm.valid" class="ml-3">
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
export class ListeDialogComponent implements OnInit {
  titre: string = 'Nouvelle liste';
  liste: any = {
    nom: '',
    position: 0
  };

  constructor(private dialogRef: NbDialogRef<ListeDialogComponent>) {}

  ngOnInit(): void {}

  fermer() {
    this.dialogRef.close();
  }

  sauvegarder() {
    if (this.liste.nom.trim()) {
      this.dialogRef.close(this.liste);
    }
  }
} 