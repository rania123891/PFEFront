import { Component, Input } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';

@Component({
  selector: 'ngx-confirmation-dialog',
  template: `
    <nb-card>
      <nb-card-header>
        <h5 class="mb-0">{{ title }}</h5>
      </nb-card-header>
      <nb-card-body>
        <p>{{ content }}</p>
      </nb-card-body>
      <nb-card-footer class="d-flex justify-content-end">
        <button nbButton status="basic" class="mr-2" (click)="fermer()">Annuler</button>
        <button nbButton status="danger" (click)="confirmer()">Supprimer</button>
      </nb-card-footer>
    </nb-card>
  `,
  styles: [`
    .mr-2 {
      margin-right: 1rem;
    }
  `]
})
export class ConfirmationDialogComponent {
  @Input() title: string = 'Confirmation';
  @Input() content: string = 'Êtes-vous sûr ?';

  constructor(protected dialogRef: NbDialogRef<ConfirmationDialogComponent>) {}

  fermer() {
    this.dialogRef.close(false);
  }

  confirmer() {
    this.dialogRef.close(true);
  }
} 