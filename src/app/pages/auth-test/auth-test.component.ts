import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'ngx-auth-test',
  template: `
    <nb-card>
      <nb-card-header>Test d'Authentification</nb-card-header>
      <nb-card-body>
        <div class="row">
          <div class="col-md-6">
            <h5>Informations d'authentification</h5>
            <p><strong>Authentifié :</strong> {{ isAuthenticated() }}</p>
            <p><strong>Rôle :</strong> {{ getRole() }}</p>
            <p><strong>Est Admin :</strong> {{ isAdmin() }}</p>
            <p><strong>Token :</strong> {{ getToken() | slice:0:50 }}...</p>
          </div>
          <div class="col-md-6">
            <h5>Actions</h5>
            <button nbButton status="danger" (click)="logout()">
              Déconnexion
            </button>
          </div>
        </div>
      </nb-card-body>
    </nb-card>
  `,
  styles: [`
    nb-card-body {
      padding: 2rem;
    }
    p {
      margin-bottom: 1rem;
    }
    button {
      margin-right: 1rem;
    }
  `]
})
export class AuthTestComponent {
  constructor(private authService: AuthService) {}

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  getRole(): string | null {
    return this.authService.getRole();
  }

  getToken(): string | null {
    return this.authService.getToken();
  }

  logout(): void {
    this.authService.logout();
  }
} 