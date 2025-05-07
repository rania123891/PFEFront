import { Component, Input } from '@angular/core';
import { NbDialogRef, NbCardModule, NbButtonModule, NbIconModule } from '@nebular/theme';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ngx-confirmation-dialog',
  standalone: true,
  imports: [
    CommonModule,
    NbCardModule,
    NbButtonModule,
    NbIconModule
  ],
  template: `
    <nb-card>
      <nb-card-header>
        <div class="d-flex justify-content-between align-items-center">
          <h5 class="mb-0">{{ title }}</h5>
          <button nbButton ghost (click)="annuler()">
            <nb-icon icon="close-outline"></nb-icon>
          </button>
        </div>
      </nb-card-header>
      <nb-card-body>
        <p>{{ content }}</p>
      </nb-card-body>
      <nb-card-footer class="d-flex justify-content-end">
        <button nbButton status="basic" class="mr-2" (click)="annuler()">Annuler</button>
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
  @Input() content: string = 'Êtes-vous sûr de vouloir effectuer cette action ?';

  constructor(private dialogRef: NbDialogRef<ConfirmationDialogComponent>) {}

  annuler() {
    this.dialogRef.close(false);
  }

  confirmer() {
    this.dialogRef.close(true);
  }
} 