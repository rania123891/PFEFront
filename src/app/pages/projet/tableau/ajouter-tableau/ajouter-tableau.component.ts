import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { NbToastrService } from '@nebular/theme';
import { ProjetMenuService } from '../../services/projet-menu.service';

@Component({
  selector: 'ngx-ajouter-tableau',
  template: `
    <nb-card>
      <nb-card-header>
        <h5>Ajouter un nouveau tableau</h5>
      </nb-card-header>
      <nb-card-body>
        <form [formGroup]="tableauForm" (ngSubmit)="onSubmit()">
          <div class="form-group row">
            <label class="col-sm-3 col-form-label">Nom du tableau</label>
            <div class="col-sm-9">
              <input nbInput
                     fullWidth
                     formControlName="nom"
                     placeholder="Nom du tableau"
                     [status]="tableauForm.get('nom')?.errors && tableauForm.get('nom')?.touched ? 'danger' : 'basic'">
              <ng-container *ngIf="tableauForm.get('nom')?.errors?.['required'] && tableauForm.get('nom')?.touched">
                <p class="caption status-danger">Le nom est requis</p>
              </ng-container>
            </div>
          </div>

          <div class="form-group row">
            <label class="col-sm-3 col-form-label">Description</label>
            <div class="col-sm-9">
              <textarea nbInput
                        fullWidth
                        formControlName="description"
                        placeholder="Description du tableau"
                        rows="3">
              </textarea>
            </div>
          </div>

          <div class="form-group row">
            <div class="offset-sm-3 col-sm-9">
              <button nbButton
                      status="primary"
                      type="submit"
                      [disabled]="!tableauForm.valid">
                Créer le tableau
              </button>
              <button nbButton
                      status="basic"
                      type="button"
                      (click)="annuler()"
                      class="ml-3">
                Annuler
              </button>
            </div>
          </div>
        </form>
      </nb-card-body>
    </nb-card>
  `,
  styles: [`
    :host {
      display: block;
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
    }
    .ml-3 {
      margin-left: 1rem;
    }
  `]
})
export class AjouterTableauComponent implements OnInit {
  tableauForm: FormGroup;
  projetId: number;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private toastr: NbToastrService,
    private projetMenuService: ProjetMenuService
  ) {
    this.tableauForm = this.fb.group({
      nom: ['', Validators.required],
      description: [''],
      position: [0]
    });
  }

  ngOnInit() {
    this.projetId = Number(this.route.snapshot.paramMap.get('id'));
  }

  onSubmit() {
    if (this.tableauForm.valid) {
      const tableau = {
        ...this.tableauForm.value,
        projetId: this.projetId
      };

      this.apiService.createTableau(tableau).subscribe(
        (response) => {
          this.toastr.success('Tableau créé avec succès', 'Succès');
          this.projetMenuService.refreshCache(); // Met à jour le menu
          this.router.navigate(['/pages/projet', this.projetId, 'tableau', response.id]);
        },
        (error) => {
          this.toastr.danger('Erreur lors de la création du tableau', 'Erreur');
          console.error('Erreur:', error);
        }
      );
    }
  }

  annuler() {
    this.router.navigate(['/pages/projet', this.projetId, 'tableau']);
  }
} 