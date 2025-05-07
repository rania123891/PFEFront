import { Component, OnInit } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { User } from '../../services/user.service';
import { RoleMembreEquipe } from '../../services/team-member.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'ngx-ajouter-membre-dialog',
  template: `
    <nb-card>
      <nb-card-header>
        <h4>Ajouter des membres à l'équipe</h4>
      </nb-card-header>
      <nb-card-body>
        <form [formGroup]="membresForm">
          <!-- Sélection multiple des membres -->
          <div class="form-group">
            <label class="label">Sélectionner les membres *</label>
            <nb-select multiple
                      fullWidth
                      formControlName="membres"
                      placeholder="Sélectionnez un ou plusieurs membres"
                      [status]="membresForm.get('membres')?.touched ? 
                               (membresForm.get('membres')?.invalid ? 'danger' : 'success') : 'basic'">
              <nb-option *ngFor="let user of users" [value]="user.id">
                {{ user.email }}
              </nb-option>
            </nb-select>
            <small class="text-danger" *ngIf="membresForm.get('membres')?.invalid && membresForm.get('membres')?.touched">
              Veuillez sélectionner au moins un membre
            </small>
          </div>

          <!-- Sélection du chef d'équipe -->
          <div class="form-group mt-4" *ngIf="membresForm.get('membres')?.value?.length">
            <label class="label">Chef d'équipe *</label>
            <nb-radio-group formControlName="chefEquipeId">
              <nb-radio *ngFor="let userId of membresForm.get('membres')?.value"
                       [value]="userId">
                {{ getUserEmail(userId) }}
              </nb-radio>
            </nb-radio-group>
            <small class="text-danger" *ngIf="membresForm.get('chefEquipeId')?.invalid && membresForm.get('chefEquipeId')?.touched">
              Veuillez désigner un chef d'équipe
            </small>
          </div>
        </form>
      </nb-card-body>
      <nb-card-footer class="d-flex justify-content-end">
        <button nbButton status="basic" (click)="annuler()" class="mr-2">
          Annuler
        </button>
        <button nbButton 
                status="primary" 
                [disabled]="membresForm.invalid || isSubmitting"
                (click)="valider()">
          Ajouter
        </button>
      </nb-card-footer>
    </nb-card>
  `,
  styles: [`
    nb-card {
      max-width: 600px;
    }
    .form-group {
      margin-bottom: 1.5rem;
    }
    .label {
      margin-bottom: 0.5rem;
      display: block;
    }
    nb-radio {
      display: block;
      margin-bottom: 1rem;
    }
    .mr-2 {
      margin-right: 1rem;
    }
  `]
})
export class AjouterMembreDialogComponent implements OnInit {
  membresForm: FormGroup;
  users: User[] = [];
  isSubmitting = false;

  constructor(
    private dialogRef: NbDialogRef<AjouterMembreDialogComponent>,
    private fb: FormBuilder,
    private userService: UserService,
    private toastr: ToastrService
  ) {
    this.membresForm = this.fb.group({
      membres: [[], [Validators.required, Validators.minLength(1)]],
      chefEquipeId: [null, Validators.required]
    });

    // Réinitialiser le chef d'équipe quand la sélection des membres change
    this.membresForm.get('membres')?.valueChanges.subscribe(membres => {
      const chefEquipeId = this.membresForm.get('chefEquipeId')?.value;
      if (!membres.includes(chefEquipeId)) {
        this.membresForm.patchValue({ chefEquipeId: null });
      }
    });
  }

  ngOnInit() {
    this.chargerUtilisateurs();
  }

  chargerUtilisateurs() {
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des utilisateurs:', error);
        this.toastr.error('Impossible de charger la liste des utilisateurs');
      }
    });
  }

  getUserEmail(userId: number): string {
    const user = this.users.find(u => u.id === userId);
    return user ? user.email : '';
  }

  valider() {
    if (this.membresForm.valid) {
      this.isSubmitting = true;
      const membres = this.membresForm.value.membres.map((userId: number) => ({
        utilisateurId: userId,
        role: userId === this.membresForm.value.chefEquipeId ? 
              RoleMembreEquipe.ChefEquipe : 
              RoleMembreEquipe.Membre
      }));
      
      this.dialogRef.close(membres);
    } else {
      this.membresForm.markAllAsTouched();
    }
  }

  annuler() {
    this.dialogRef.close();
  }
} 