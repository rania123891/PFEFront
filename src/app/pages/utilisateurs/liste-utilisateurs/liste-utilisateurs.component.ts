import { Component, OnInit, TemplateRef } from '@angular/core';
import { ApiService, Utilisateur, RoleUtilisateur } from '../../services/api.service';
import { NbDialogService } from '@nebular/theme';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'ngx-liste-utilisateurs',
  template: `
    <nb-card>
      <nb-card-header>
        <div class="d-flex justify-content-between align-items-center">
          <h5 class="mb-0">Liste des utilisateurs</h5>
          <button nbButton status="primary" size="small">
            <nb-icon icon="plus-outline"></nb-icon>
            Ajouter un utilisateur
          </button>
        </div>
      </nb-card-header>
      <nb-card-body>
        <table class="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Email</th>
              <th>Rôle</th>
              <th class="actions-header">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let utilisateur of utilisateurs">
              <td>{{ utilisateur.id }}</td>
              <td>{{ utilisateur.email }}</td>
              <td class="role-cell">
                <span class="role-badge" [class]="getRoleClass(utilisateur.role)">
                  {{ utilisateur.role || 'User' }}
                </span>
              </td>
              <td class="actions-cell">
                <button nbButton ghost status="primary" size="small" class="mr-2" (click)="modifierUtilisateur(utilisateur, dialogModifier)">
                  <nb-icon icon="edit-2-outline"></nb-icon>
                </button>
                <button nbButton ghost status="danger" size="small" (click)="supprimerUtilisateur(utilisateur.id)">
                  <nb-icon icon="trash-2-outline"></nb-icon>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </nb-card-body>
    </nb-card>

    <ng-template #dialogModifier let-ref="dialogRef">
      <nb-card>
        <nb-card-header>Modifier l'utilisateur</nb-card-header>
        <nb-card-body>
          <form [formGroup]="modifierForm">
            <div class="form-group">
              <label for="email">Email</label>
              <input nbInput fullWidth id="email" formControlName="email" type="email">
            </div>
            <div class="form-group">
              <label for="role">Rôle</label>
              <nb-select fullWidth id="role" formControlName="role">
                <nb-option value="Admin">Admin</nb-option>
                <nb-option value="User">User</nb-option>
              </nb-select>
            </div>
          </form>
        </nb-card-body>
        <nb-card-footer>
          <button nbButton status="primary" (click)="onSubmitModification(ref)">Enregistrer</button>
          <button nbButton status="basic" class="ml-2" (click)="ref.close()">Annuler</button>
        </nb-card-footer>
      </nb-card>
    </ng-template>
  `,
  styles: [`
    :host {
      display: block;
      max-width: 100%;
      overflow-x: auto;
    }
    .table {
      width: 100%;
      margin-bottom: 0;
    }
    td, th {
      padding: 1rem;
      vertical-align: middle;
    }
    .role-cell {
      text-align: center;
    }
    .actions-cell {
      text-align: right;
      padding-right: 2rem;
    }
    .actions-header {
      text-align: right;
      padding-right: 2rem;
    }
    .role-badge {
      padding: 0.5rem 1.2rem;
      border-radius: 2rem;
      font-weight: 500;
      font-size: 0.875rem;
      text-transform: capitalize;
      display: inline-block;
      min-width: 90px;
      text-align: center;
    }
    .role-admin {
      background-color: #ff3d7114;
      color: #ff3d71;
    }
    .role-user {
      background-color: #0095ff14;
      color: #0095ff;
    }
    .mr-2 {
      margin-right: 0.5rem;
    }
    .ml-2 {
      margin-left: 0.5rem;
    }
    .form-group {
      margin-bottom: 1rem;
    }
    button nb-icon {
      font-size: 1.2rem;
    }
  `]
})
export class ListeUtilisateursComponent implements OnInit {
  utilisateurs: Utilisateur[] = [];
  modifierForm: FormGroup;
  utilisateurEnEdition: Utilisateur | null = null;

  constructor(
    private apiService: ApiService,
    private dialogService: NbDialogService,
    private formBuilder: FormBuilder,
  ) {
    this.modifierForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      role: ['User', Validators.required],
    });
  }

  ngOnInit() {
    this.chargerUtilisateurs();
  }

  chargerUtilisateurs() {
    this.apiService.getUtilisateurs().subscribe({
      next: (data) => {
        this.utilisateurs = data;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des utilisateurs:', error);
      }
    });
  }

  getRoleClass(role: string): string {
    return role === 'Admin' ? 'role-admin' : 'role-user';
  }

  supprimerUtilisateur(id: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      this.apiService.deleteUtilisateur(id).subscribe({
        next: () => {
          this.chargerUtilisateurs();
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
        }
      });
    }
  }

  modifierUtilisateur(utilisateur: Utilisateur, dialog: TemplateRef<any>) {
    this.utilisateurEnEdition = utilisateur;
    this.modifierForm.patchValue({
      email: utilisateur.email,
      role: utilisateur.role || 'User',
    });
    
    this.dialogService.open(dialog);
  }

  onSubmitModification(ref: any) {
    if (this.modifierForm.valid && this.utilisateurEnEdition) {
      const modifications = {
        ...this.utilisateurEnEdition,
        ...this.modifierForm.value,
      };

      this.apiService.updateUtilisateur(this.utilisateurEnEdition.id, modifications).subscribe({
        next: () => {
          this.chargerUtilisateurs();
          ref.close();
        },
        error: (error) => {
          console.error('Erreur lors de la modification:', error);
        }
      });
    }
  }
} 