import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { NbAuthService } from '@nebular/auth';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { NbToastrService } from '@nebular/theme';

@Component({
  selector: 'ngx-register',
  template: `
    <div class="auth-wrapper">
      <div class="auth-block">
        <div class="header-container">
          <div class="logo-text">
            <span class="primary-text">POULINA</span>
            <span class="secondary-text">GROUP</span>
            <span class="tertiary-text">HOLDING</span>
          </div>
          <h1>Inscription</h1>
        </div>
        
        <form (ngSubmit)="register()" #form="ngForm" aria-labelledby="title">
          <div *ngIf="showErrors && errors && errors.length > 0" class="alert alert-danger" role="alert">
            <ul class="error-list">
              <li *ngFor="let error of errors">{{ error }}</li>
            </ul>
          </div>

          <div *ngIf="showSuccess" class="alert alert-success" role="alert">
            <p>{{ successMessage }}</p>
          </div>

          <div class="form-group">
            <label for="input-nom" class="label">Nom</label>
            <input nbInput
                   fullWidth
                   [(ngModel)]="user.nom"
                   #nom="ngModel"
                   name="nom"
                   id="input-nom"
                   placeholder="Votre nom"
                   [status]="nom.dirty ? (nom.invalid ? 'danger' : 'success') : 'basic'"
                   required>
            <small class="form-text text-danger" *ngIf="nom.invalid && nom.touched">
              Le nom est requis
            </small>
          </div>

          <div class="form-group">
            <label for="input-prenom" class="label">Prénom</label>
            <input nbInput
                   fullWidth
                   [(ngModel)]="user.prenom"
                   #prenom="ngModel"
                   name="prenom"
                   id="input-prenom"
                   placeholder="Votre prénom"
                   [status]="prenom.dirty ? (prenom.invalid ? 'danger' : 'success') : 'basic'"
                   required>
            <small class="form-text text-danger" *ngIf="prenom.invalid && prenom.touched">
              Le prénom est requis
            </small>
          </div>

          <div class="form-group">
            <label for="input-email" class="label">Email</label>
            <input nbInput
                   fullWidth
                   [(ngModel)]="user.email"
                   #email="ngModel"
                   name="email"
                   id="input-email"
                   pattern=".+@.+\..+"
                   placeholder="Votre email"
                   [status]="email.dirty ? (email.invalid ? 'danger' : 'success') : 'basic'"
                   required>
            <small class="form-text text-danger" *ngIf="email.invalid && email.touched">
              <span *ngIf="email.errors?.required">L'email est requis</span>
              <span *ngIf="email.errors?.pattern">Format d'email invalide</span>
            </small>
          </div>

          <div class="form-group">
            <label for="input-password" class="label">Mot de passe</label>
            <input nbInput
                   fullWidth
                   [(ngModel)]="user.password"
                   #password="ngModel"
                   name="password"
                   type="password"
                   id="input-password"
                   placeholder="Votre mot de passe"
                   [status]="password.dirty ? (password.invalid || password.value.length < 6 ? 'danger' : 'success') : 'basic'"
                   required
                   minlength="6">
            <small class="form-text text-danger" *ngIf="password.invalid && password.touched">
              <span *ngIf="password.errors?.required">Le mot de passe est requis</span>
              <span *ngIf="password.errors?.minlength">Le mot de passe doit contenir au moins 6 caractères</span>
            </small>
          </div>

          <div class="form-group">
            <label for="input-confirm-password" class="label">Confirmer le mot de passe</label>
            <input nbInput
                   fullWidth
                   [(ngModel)]="user.confirmPassword"
                   #confirmPassword="ngModel"
                   name="confirmPassword"
                   type="password"
                   id="input-confirm-password"
                   placeholder="Confirmez votre mot de passe"
                   [status]="confirmPassword.dirty ? (confirmPassword.value === password.value ? 'success' : 'danger') : 'basic'"
                   required>
            <small class="form-text text-danger" 
                   *ngIf="confirmPassword.dirty && confirmPassword.value !== password.value">
              Les mots de passe ne correspondent pas
            </small>
          </div>

          <div class="form-group">
            <label for="input-role" class="label">Rôle</label>
            <nb-select fullWidth
                      [(ngModel)]="user.role"
                      #role="ngModel"
                      name="role"
                      id="input-role"
                      placeholder="Sélectionnez un rôle"
                      required>
              <nb-option value="User">Utilisateur</nb-option>
              <nb-option value="Admin">Administrateur</nb-option>
            </nb-select>
            <small class="form-text text-danger" *ngIf="role.invalid && role.touched">
              Le rôle est requis
            </small>
          </div>

          <button nbButton
                  fullWidth
                  status="primary"
                  size="large"
                  [disabled]="submitted || !form.valid || password.value !== confirmPassword.value || password.value.length < 6"
                  [class.btn-pulse]="submitted">
            {{ submitted ? 'Inscription en cours...' : 'S\'inscrire' }}
          </button>

          <div class="text-center mt-3">
            <span>Déjà inscrit? </span>
            <a routerLink="../login" class="text-primary">Se connecter</a>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    :host {
      nb-auth nb-auth-block .back-link {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        width: 0 !important;
        height: 0 !important;
        position: absolute !important;
        pointer-events: none !important;
      }
    }

    .auth-wrapper {
      min-height: 100vh;
      background-color: #f7f9fc;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .auth-block {
      width: 100%;
      max-width: 600px;
      padding: 2.5rem;
      background: white;
      border-radius: 10px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      margin: 1rem;
    }

    .header-container {
      text-align: center;
      margin-bottom: 2.5rem;
    }

    .logo-text {
      display: inline-block;
      margin-bottom: 1rem;
      font-size: 1.5rem;
      font-weight: bold;
      letter-spacing: 1px;
      line-height: 1.2;
    }

    .primary-text {
      color: #0066b3;
    }

    .secondary-text {
      color: #666;
      margin: 0 0.25rem;
    }

    .tertiary-text {
      color: #999;
    }

    h1 {
      text-align: center;
      margin: 0;
      font-size: 2rem;
      color: #444;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .label {
      display: block;
      margin-bottom: 0.5rem;
      font-size: 1rem;
      color: #444;
    }

    input {
      height: 3rem;
      font-size: 1rem;
    }

    nb-select {
      height: 3rem;
      font-size: 1rem;
    }

    .error-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    button[nbButton] {
      height: 3rem;
      font-size: 1.1rem;
      background-color: #0066b3;
      margin-top: 1rem;
      &:hover {
        background-color: darken(#0066b3, 10%);
      }
    }

    .text-center {
      text-align: center;
    }

    .mt-3 {
      margin-top: 1.5rem;
    }

    .alert {
      margin-bottom: 1.5rem;
      padding: 1rem;
      border-radius: 5px;
    }

    .alert-danger {
      background-color: #fef2f2;
      border: 1px solid #fee2e2;
      color: #dc2626;
    }

    .text-primary {
      color: #0066b3;
      text-decoration: none;
      &:hover {
        text-decoration: underline;
      }
    }

    .alert-success {
      background-color: #ecfdf5;
      border: 1px solid #d1fae5;
      color: #059669;
    }
  `],
})
export class NgxRegisterComponent implements OnInit {
  user: any = {
    email: '',
    password: '',
    confirmPassword: '',
    nom: '',
    prenom: '',
    role: 'User',
  };

  submitted = false;
  showErrors = false;
  showSuccess = false;
  successMessage = '';
  errors: string[] = [];

  constructor(
    private authService: AuthService,
    private nbAuthService: NbAuthService,
    private cd: ChangeDetectorRef,
    private router: Router,
    private toastrService: NbToastrService,
  ) {}

  ngOnInit() {
    this.showErrors = false;
    this.showSuccess = false;
    this.errors = [];
    this.successMessage = '';
  }

  register() {
    if (this.submitted) return;

    this.submitted = true;
    this.showErrors = false;
    this.errors = [];

    // Validation supplémentaire
    if (this.user.password.length < 6) {
      this.errors.push('Le mot de passe doit contenir au moins 6 caractères.');
      this.submitted = false;
      this.showErrors = true;
      this.cd.detectChanges();
      return;
    }

    if (this.user.password !== this.user.confirmPassword) {
      this.errors.push('Les mots de passe ne correspondent pas.');
      this.submitted = false;
      this.showErrors = true;
      this.cd.detectChanges();
      return;
    }

    // Nettoyage des données avant envoi
    const userData = {
      email: this.user.email.trim().toLowerCase(),
      password: this.user.password,
      confirmPassword: this.user.confirmPassword,
      nom: this.user.nom.trim(),
      prenom: this.user.prenom.trim(),
      role: this.user.role || 'User'
    };

    this.authService.register(userData)
      .subscribe({
        next: () => {
          this.toastrService.success('Inscription réussie!', 'Succès');
          this.handleSuccessfulRegistration();
        },
        error: (error) => {
          if (error.status === 200) {
            this.toastrService.success('Inscription réussie!', 'Succès');
            this.handleSuccessfulRegistration();
          } else {
            this.submitted = false;
            this.showErrors = true;
            
            if (error.error && typeof error.error === 'string') {
              this.errors = [error.error];
            } else if (error.error && error.error.errors) {
              const validationErrors = error.error.errors;
              this.errors = [];
              Object.values(validationErrors).forEach((err: any) => {
                if (Array.isArray(err)) {
                  this.errors.push(...err);
                } else if (typeof err === 'string') {
                  this.errors.push(err);
                }
              });
            } else {
              this.errors = ['Une erreur est survenue lors de l\'inscription.'];
            }
            this.cd.detectChanges();
          }
        }
      });
  }

  private handleSuccessfulRegistration() {
    // Réinitialiser le formulaire
    this.user = {
      email: '',
      password: '',
      confirmPassword: '',
      nom: '',
      prenom: '',
      role: 'User'
    };
    
    // Redirection immédiate
    this.router.navigate(['/auth/login']).then(() => {
      // Forcer le rechargement de la page après la navigation
      window.location.reload();
    });
  }
} 