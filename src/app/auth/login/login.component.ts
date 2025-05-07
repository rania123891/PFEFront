import { Component, ChangeDetectorRef } from '@angular/core';
import { NbAuthService } from '@nebular/auth';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'ngx-login',
  template: `
    <div class="auth-wrapper">
      <div class="auth-block">
        <div class="header-container">
          <div class="logo-text">
            <span class="primary-text">POULINA</span>
            <span class="secondary-text">GROUP</span>
            <span class="tertiary-text">HOLDING</span>
          </div>
          <h1>Connexion</h1>
        </div>
        
        <form (ngSubmit)="login()" #form="ngForm" aria-labelledby="title">
          <div *ngIf="errors?.length && !submitted" class="alert alert-danger" role="alert">
            <ul class="error-list">
              <li *ngFor="let error of errors">{{ error }}</li>
            </ul>
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
              Email invalide
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
                   [status]="password.dirty ? (password.invalid ? 'danger' : 'success') : 'basic'"
                   required>
            <small class="form-text text-danger" *ngIf="password.invalid && password.touched">
              Mot de passe requis
            </small>
          </div>

          <div class="form-group d-flex justify-content-between align-items-center">
            <nb-checkbox [(ngModel)]="user.rememberMe" name="rememberMe">
              Se souvenir de moi
            </nb-checkbox>
            <a routerLink="../request-password" class="forgot-password">
              Mot de passe oublié?
            </a>
          </div>

          <button nbButton
                  fullWidth
                  status="primary"
                  size="large"
                  [disabled]="submitted || !form.valid"
                  [class.btn-pulse]="submitted">
            Se connecter
          </button>

          <div class="text-center mt-3">
            <span>Pas encore de compte? </span>
            <a routerLink="../register" class="text-primary">Créer un compte</a>
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

    .error-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .forgot-password {
      font-size: 0.875rem;
      color: #0066b3;
      &:hover {
        text-decoration: underline;
      }
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
  `],
})
export class NgxLoginComponent {
  user: any = {
    email: '',
    password: '',
    rememberMe: false,
  };

  submitted = false;
  errors: string[] = [];
  messages: string[] = [];

  constructor(
    private authService: AuthService,
    nbAuthService: NbAuthService,
    cd: ChangeDetectorRef,
    router: Router,
  ) {
  }

  login() {
    this.submitted = true;
    this.errors = [];
    this.messages = [];

    this.authService.login(this.user.email, this.user.password)
      .subscribe(
        () => {
          this.submitted = false;
        },
        (error) => {
          this.submitted = false;
          this.errors = [error.message || 'Une erreur est survenue lors de la connexion.'];
        }
      );
  }
} 