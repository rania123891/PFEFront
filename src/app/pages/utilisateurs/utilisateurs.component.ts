import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService, User } from '../../services/user.service';
import { NbToastrService } from '@nebular/theme';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'ngx-utilisateurs',
  templateUrl: './utilisateurs.component.html',
  styleUrls: ['./utilisateurs.component.scss']
})
export class UtilisateursComponent implements OnInit {
  utilisateurs: User[] = [];
  isLoading = false;
  isSubmitting = false;
  searchQuery = '';
  utilisateurForm: FormGroup;
  editedUtilisateur: User | null = null;
  showAddForm = false;
  showEditForm = false;

  constructor(
    private userService: UserService,
    private fb: FormBuilder,
    private toastrService: NbToastrService
  ) {
    this.initForm();
  }

  ngOnInit() {
    this.loadUtilisateurs();
  }

  loadUtilisateurs() {
    this.isLoading = true;
    this.userService.getUsers().subscribe({
      next: (data) => {
        this.utilisateurs = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des utilisateurs:', error);
        this.toastrService.danger(
          'Impossible de charger les utilisateurs',
          'Erreur'
        );
        this.isLoading = false;
      }
    });
  }

  getRoleClass(role: string): string {
    if (!role) return 'status-default';
    switch (role.toUpperCase()) {
      case 'ADMINISTRATEUR':
        return 'status-info';
      case 'UTILISATEUR':
        return 'status-success';
      default:
        return 'status-default';
    }
  }

  private initForm() {
    this.utilisateurForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      role: ['UTILISATEUR', Validators.required],
      password: ['']
    });

    if (this.showAddForm) {
      this.utilisateurForm.get('password').setValidators([Validators.required, Validators.minLength(6)]);
    } else {
      this.utilisateurForm.get('password').clearValidators();
    }
    this.utilisateurForm.get('password').updateValueAndValidity();
  }

  onSearch() {
    if (!this.searchQuery.trim()) {
      this.loadUtilisateurs();
      return;
    }

    const query = this.searchQuery.toLowerCase();
    this.utilisateurs = this.utilisateurs.filter(user => 
      user.nom.toLowerCase().includes(query) ||
      user.prenom.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query)
    );
  }

  openAddForm() {
    this.showAddForm = true;
    this.showEditForm = false;
    this.editedUtilisateur = null;
    this.initForm();
  }

  openEditForm(utilisateur: User) {
    this.editedUtilisateur = utilisateur;
    this.showEditForm = true;
    this.showAddForm = false;
    this.initForm();
    this.utilisateurForm.patchValue({
      email: utilisateur.email,
      nom: utilisateur.nom,
      prenom: utilisateur.prenom,
      role: utilisateur.role
    });
  }

  cancelForm() {
    this.showAddForm = false;
    this.showEditForm = false;
    this.editedUtilisateur = null;
    this.initForm();
  }

  onSubmit() {
    if (this.utilisateurForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      const formValue = this.utilisateurForm.getRawValue();
      
      const utilisateurData: User = {
        id: this.editedUtilisateur?.id,
        email: formValue.email,
        nom: formValue.nom,
        prenom: formValue.prenom,
        role: formValue.role,
        dateCreation: this.editedUtilisateur?.dateCreation || new Date().toISOString(),
        password: formValue.password
      };

      const operation = this.editedUtilisateur
        ? this.userService.updateUser(this.editedUtilisateur.id, utilisateurData)
        : this.userService.createUser(utilisateurData);

      operation.pipe(
        catchError(error => {
          console.error('Erreur:', error);
          let errorMessage = 'Une erreur est survenue';
          
          if (error.status === 0) {
            errorMessage = 'Impossible de contacter le serveur';
          } else if (error.status === 400) {
            errorMessage = 'Données invalides';
            if (error.error?.errors) {
              Object.keys(error.error.errors).forEach(key => {
                this.toastrService.danger(error.error.errors[key].join(', '), `Erreur: ${key}`);
              });
            }
          }
          
          this.toastrService.danger(errorMessage, 'Erreur');
          return of(null);
        }),
        finalize(() => {
          this.isSubmitting = false;
        })
      ).subscribe(response => {
        if (response) {
          this.toastrService.success(
            this.editedUtilisateur ? 'Utilisateur mis à jour' : 'Utilisateur créé',
            'Succès'
          );
          this.loadUtilisateurs();
          this.cancelForm();
        }
      });
    }
  }

  onDelete(id: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      this.userService.deleteUser(id).subscribe({
        next: () => {
          this.utilisateurs = this.utilisateurs.filter(u => u.id !== id);
          this.toastrService.success('Utilisateur supprimé', 'Succès');
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          this.toastrService.danger(
            'Erreur lors de la suppression',
            'Erreur'
          );
        }
      });
    }
  }
} 