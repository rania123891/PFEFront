import { Component, OnDestroy, OnInit } from '@angular/core';
import { NbMediaBreakpointsService, NbMenuService, NbSidebarService, NbThemeService } from '@nebular/theme';
import { LayoutService } from '../../../@core/utils';
import { map, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { AuthService } from '../../../auth/auth.service';
import { Router } from '@angular/router';
import { ProfileService } from '../../../services/profile.service';

@Component({
  selector: 'ngx-header',
  styleUrls: ['./header.component.scss'],
  template: `
    <div class="header-container">
      <div class="logo-container">
        <a (click)="toggleSidebar()" href="#" class="sidebar-toggle">
          <nb-icon icon="menu-2-outline"></nb-icon>
        </a>
        <a class="logo" href="#" (click)="navigateHome()">
          <img src="assets/images/Poulina.png" alt="Poulina Logo">
        </a>
      </div>
    </div>

    <div class="header-container">
      <nb-actions size="small">
        <nb-action class="user-action">
          <nb-user class="larger-user-picture"
                   [nbContextMenu]="userMenu"
                   [onlyPicture]="userPictureOnly"
                   [name]="userDisplayName"
                   [picture]="userProfilePhoto">
          </nb-user>
        </nb-action>
      </nb-actions>
    </div>
  `,
  styles: [`
    .larger-user-picture ::ng-deep nb-user {
      .user-picture {
        height: 3.5rem !important;
        width: 3.5rem !important;
      }
    }
  `],
})
export class HeaderComponent implements OnInit, OnDestroy {
  private destroy$: Subject<void> = new Subject<void>();
  userPictureOnly: boolean = false;
  email: string = '';
  userInfo: any = null;
  
  // Propriétés calculées pour éviter les appels répétés
  userDisplayName: string = '';
  userProfilePhoto: string | null = null;

  themes = [
    {
      value: 'default',
      name: 'Light',
    },
    {
      value: 'dark',
      name: 'Dark',
    },
    {
      value: 'cosmic',
      name: 'Cosmic',
    },
    {
      value: 'corporate',
      name: 'Corporate',
    },
  ];

  currentTheme = 'default';

  userMenu = [ 
    { title: 'Profile', data: 'profile' }, 
    { title: 'Log out', data: 'logout' }
  ];

  constructor(
    private sidebarService: NbSidebarService,
    private menuService: NbMenuService,
    private themeService: NbThemeService,
    private layoutService: LayoutService,
    private breakpointService: NbMediaBreakpointsService,
    private authService: AuthService,
    private router: Router,
    private profileService: ProfileService
  ) {
    this.menuService.onItemClick()
      .pipe(takeUntil(this.destroy$))
      .subscribe((event) => {
        if (event.item.data === 'logout') {
          this.logout();
        } else if (event.item.data === 'profile') {
          this.router.navigate(['/pages/profile']);
        }
      });
  }

  ngOnInit() {
    this.currentTheme = this.themeService.currentTheme;
    this.loadUserData();

    const { xl } = this.breakpointService.getBreakpointsMap();
    this.themeService.onMediaQueryChange()
      .pipe(
        map(([, currentBreakpoint]) => currentBreakpoint.width < xl),
        takeUntil(this.destroy$),
      )
      .subscribe((isLessThanXl: boolean) => this.userPictureOnly = isLessThanXl);

    this.themeService.onThemeChange()
      .pipe(
        map(({ name }) => name),
        takeUntil(this.destroy$),
      )
      .subscribe(themeName => this.currentTheme = themeName);
  }

  private loadUserData() {
    console.log('🔍 HEADER - loadUserData démarré');
    
    // Récupérer l'email depuis le token JWT
    const token = this.authService.getToken();
    console.log('🔍 HEADER - Token récupéré:', token ? 'Présent' : 'Absent');
    
    if (token) {
      try {
        const tokenData = JSON.parse(atob(token.split('.')[1]));
        console.log('🔍 HEADER - Données du token:', tokenData);
        
        this.email = tokenData.email || '';
        const userId = tokenData.nameid;
        console.log('🔍 HEADER - Email:', this.email, '- UserId:', userId);
        
        // Charger le profil complet depuis l'API
        if (userId) {
          this.profileService.getUserProfile(parseInt(userId)).subscribe({
            next: (profile) => {
              console.log('✅ HEADER - Profil récupéré:', profile);
              this.userInfo = profile;
              // Mettre à jour les propriétés calculées
              this.updateCalculatedProperties();
            },
            error: (error) => {
              console.error('❌ HEADER - Erreur lors du chargement du profil:', error);
              // Fallback avec les données du token
              this.userInfo = {
                email: tokenData.email,
                nom: tokenData.nom || '',
                prenom: tokenData.prenom || '',
                role: tokenData.role,
                profilePhotoUrl: null
              };
              // Mettre à jour les propriétés calculées
              this.updateCalculatedProperties();
            }
          });
        }
      } catch (e) {
        console.error('❌ HEADER - Erreur lors du décodage du token:', e);
      }
    }
  }

  private updateCalculatedProperties() {
    // Calculer le nom d'affichage
    if (this.userInfo?.prenom && this.userInfo?.nom) {
      this.userDisplayName = `${this.userInfo.prenom} ${this.userInfo.nom}`;
    } else {
      this.userDisplayName = this.email;
    }

    // Calculer l'URL de la photo
    if (this.userInfo?.profilePhotoUrl) {
      if (this.userInfo.profilePhotoUrl.startsWith('/')) {
        const fileName = this.userInfo.profilePhotoUrl.split('/').pop();
        this.userProfilePhoto = `http://localhost:5093/user/api/Utilisateur/image/${fileName}`;
      } else {
        this.userProfilePhoto = this.userInfo.profilePhotoUrl;
      }
    } else {
      this.userProfilePhoto = null;
    }
  }



  getUserInitials(): string {
    if (this.userInfo?.prenom && this.userInfo?.nom) {
      return `${this.userInfo.prenom.charAt(0)}${this.userInfo.nom.charAt(0)}`.toUpperCase();
    }
    if (this.email) {
      return this.email.substring(0, 2).toUpperCase();
    }
    return 'U';
  }

  getUserColor(): string {
    const colors = [
      '#667eea', '#4facfe', '#43e97b', '#fa709a', '#ff9a9e',
      '#a8edea', '#fed6e3', '#d299c2', '#ffecd2', '#fcb69f'
    ];
    const name = this.userDisplayName || this.email;
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  }

  logout() {
    this.authService.logout();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  changeTheme(themeName: string) {
    this.themeService.changeTheme(themeName);
  }

  toggleSidebar(): boolean {
    this.sidebarService.toggle(true, 'menu-sidebar');
    this.layoutService.changeLayoutSize();
    return false;
  }

  navigateHome() {
    this.menuService.navigateHome();
    return false;
  }


}
