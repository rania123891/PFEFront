import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'ngx-profile',
  template: `
    <nb-card>
      <nb-card-header>
        <h5>Profil Utilisateur</h5>
      </nb-card-header>
      <nb-card-body>
        <div class="user-info" *ngIf="userInfo">
          <div class="avatar-container">
            <nb-user [name]="userInfo.prenom + ' ' + userInfo.nom"
                    [title]="userInfo.role"
                    size="large">
            </nb-user>
          </div>
          <div class="info-container">
            <div class="info-item">
              <label>Email:</label>
              <span>{{ userInfo.email }}</span>
            </div>
            <div class="info-item">
              <label>Nom:</label>
              <span>{{ userInfo.nom }}</span>
            </div>
            <div class="info-item">
              <label>Prénom:</label>
              <span>{{ userInfo.prenom }}</span>
            </div>
            <div class="info-item">
              <label>Rôle:</label>
              <span>{{ userInfo.role }}</span>
            </div>
          </div>
        </div>
      </nb-card-body>
    </nb-card>
  `,
  styles: [`
    .user-info {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2rem;
    }

    .avatar-container {
      text-align: center;
      margin-bottom: 1rem;
    }

    .info-container {
      width: 100%;
      max-width: 400px;
    }

    .info-item {
      display: flex;
      margin-bottom: 1rem;
      padding: 0.5rem;
      background-color: nb-theme(background-basic-color-2);
      border-radius: 0.5rem;
    }

    .info-item label {
      font-weight: bold;
      min-width: 100px;
      color: nb-theme(text-hint-color);
    }

    .info-item span {
      flex: 1;
    }
  `]
})
export class ProfileComponent implements OnInit {
  userInfo: any;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    const token = this.authService.getToken();
    if (token) {
      const decodedToken = this.authService['decodeToken'](token);
      this.userInfo = {
        email: decodedToken.email,
        nom: decodedToken.nom || '',
        prenom: decodedToken.prenom || '',
        role: decodedToken.role
      };
    }
  }
} 