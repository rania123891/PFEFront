import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NbDialogRef } from '@nebular/theme';
import { Projet } from '../models/projet.model';
import { StatutProjet } from '../models/statut-projet.enum';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'ngx-modifier-projet',
  template: `
    <nb-card>
      <nb-card-header class="d-flex justify-content-between align-items-center">
        <h5 class="mb-0">{{ title }}</h5>
        <button nbButton ghost (click)="fermer()">
          <nb-icon icon="close-outline"></nb-icon>
        </button>
      </nb-card-header>
      <nb-card-body>
        <div *ngIf="!isDelete">
          <form [formGroup]="projetForm" (ngSubmit)="sauvegarder()">
            <div class="form-group mb-3">
              <label class="label" for="nom">Nom du projet *</label>
              <input nbInput fullWidth id="nom" formControlName="nom" placeholder="Entrez le nom du projet">
            </div>

            <div class="form-group mb-3">
              <label class="label" for="description">Description</label>
              <textarea nbInput fullWidth id="description" formControlName="description" placeholder="Décrivez votre projet" rows="4"></textarea>
            </div>

            <div class="form-group mb-3">
              <label class="label" for="statut">Statut *</label>
              <nb-select fullWidth id="statut" formControlName="statut">
                <nb-option *ngFor="let statut of statutsPossibles" [value]="statut">
                  {{ getStatutLabel(statut) }}
                </nb-option>
              </nb-select>
            </div>

            <div class="row">
              <div class="col-md-6">
                <div class="form-group mb-3">
                  <label class="label" for="dateDebut">Date de début *</label>
                  <input nbInput fullWidth id="dateDebut" formControlName="dateDebut" type="date">
                </div>
              </div>
              <div class="col-md-6">
                <div class="form-group mb-3">
                  <label class="label" for="dateEcheance">Date d'échéance *</label>
                  <input nbInput fullWidth id="dateEcheance" formControlName="dateEcheance" type="date">
                </div>
              </div>
            </div>

            <div class="form-group mb-3">
              <label class="label" for="duree">Durée (en jours) *</label>
              <input nbInput fullWidth id="duree" formControlName="duree" type="number" min="1">
            </div>

            <div class="d-flex justify-content-end mt-4">
              <button nbButton status="basic" type="button" (click)="fermer()" class="mr-2">Annuler</button>
              <button nbButton status="primary" type="submit" [disabled]="!projetForm.valid">Sauvegarder</button>
            </div>
          </form>
        </div>
        <div *ngIf="isDelete">
          <p>{{ content }}</p>
          <div class="d-flex justify-content-end mt-4">
            <button nbButton status="basic" type="button" (click)="fermer()" class="mr-2">Annuler</button>
            <button nbButton status="danger" type="button" (click)="confirmerSuppression()">Supprimer</button>
          </div>
        </div>
      </nb-card-body>
    </nb-card>
  `,
  styles: [`
    :host {
      display: block;
      max-width: 600px;
      margin: 0 auto;
    }
    .mr-2 {
      margin-right: 1rem;
    }
  `]
})
export class ModifierProjetComponent implements OnInit {
  @Input() projet: Projet;
  @Input() isDelete: boolean = false;
  @Input() title: string = 'Modifier le projet';
  @Input() content: string = '';
  projetForm: FormGroup;
  statutsPossibles = Object.values(StatutProjet);

  constructor(
    private formBuilder: FormBuilder,
    private dialogRef: NbDialogRef<ModifierProjetComponent>,
    private apiService: ApiService,
  ) {
    this.projetForm = this.formBuilder.group({
      nom: ['', Validators.required],
      description: [''],
      statut: [null, Validators.required],
      dateDebut: ['', Validators.required],
      dateEcheance: ['', Validators.required],
      duree: [1, [Validators.required, Validators.min(1)]],
    });
  }

  ngOnInit() {
    if (this.projet && !this.isDelete) {
      this.projetForm.patchValue({
        nom: this.projet.nom,
        description: this.projet.description,
        statut: this.projet.statut,
        dateDebut: this.formatDate(new Date(this.projet.dateDebut)),
        dateEcheance: this.formatDate(new Date(this.projet.dateEcheance)),
        duree: this.projet.duree,
      });
    }
  }

  getStatutLabel(statut: StatutProjet): string {
    switch (statut) {
      case StatutProjet.EnCours:
        return 'En cours';
      case StatutProjet.Termine:
        return 'Terminé';
      case StatutProjet.Annule:
        return 'Annulé';
      default:
        return 'Inconnu';
    }
  }

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  sauvegarder() {
    if (this.projetForm.valid) {
      const projetModifie = {
        ...this.projet,
        ...this.projetForm.value,
      };
      this.dialogRef.close(projetModifie);
    }
  }

  fermer() {
    this.dialogRef.close();
  }

  confirmerSuppression() {
    this.dialogRef.close(true);
  }
} 