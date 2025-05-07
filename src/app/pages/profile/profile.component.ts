import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'ngx-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  userData: any = {
    email: '',
    fullName: '',
    role: ''
  };

  constructor(private authService: AuthService) {}

  ngOnInit() {
    const token = this.authService.getToken();
    if (token) {
      try {
        const tokenData = JSON.parse(atob(token.split('.')[1]));
        this.userData.email = tokenData.email || '';
        this.userData.fullName = this.formatName(this.userData.email);
        this.userData.role = tokenData.role || 'Utilisateur';
      } catch (e) {
        console.error('Erreur lors du décodage du token:', e);
      }
    }
  }

  private formatName(email: string): string {
    if (!email) return '';
    const fullName = email.split('@')[0];
    const [prenom, nom] = fullName.split('.');
    if (!prenom || !nom) return fullName;
    return `${prenom.charAt(0).toUpperCase() + prenom.slice(1)} ${nom.charAt(0).toUpperCase() + nom.slice(1)}`;
  }
}
