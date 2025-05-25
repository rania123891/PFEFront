import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { ProfileService } from '../../services/profile.service';
import { NbToastrService } from '@nebular/theme';
import { environment } from '../../../environments/environment';

interface CustomJwtPayload {
  nameid?: string;
  sub?: string;
  email?: string;
  nom?: string;
  prenom?: string;
  role?: string;
  [key: string]: any;
}

@Component({
  selector: 'ngx-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  userInfo: any;
  isLoading = false;
  uploadStatus: { type: string, message: string } | null = null;
  defaultAvatar = 'assets/images/imageutilisateur.png';

  constructor(
    private authService: AuthService,
    private profileService: ProfileService,
    private toastrService: NbToastrService
  ) {}

  ngOnInit() {
    console.log('ProfileComponent initialisé');
    
    // Debug token
    const token = this.authService.getToken();
    console.log('Token brut:', token);
    
    if (token) {
      console.log('Token existe, longueur:', token.length);
      console.log('Token commence par:', token.substring(0, 50) + '...');
    }
    
    this.loadUserProfile();
  }

  loadUserProfile() {
    this.isLoading = true;
    const token = this.authService.getToken();
    
    if (token) {
      try {
        const decodedToken = this.authService['decodeToken'](token) as CustomJwtPayload;
        console.log('Token complet décodé:', decodedToken);
        
        const userId = decodedToken.nameid || decodedToken.sub;
        console.log('User ID trouvé:', userId, 'Type:', typeof userId);
        
        if (userId) {
          this.profileService.getUserProfile(parseInt(userId)).subscribe({
            next: (profile) => {
              this.userInfo = {
                id: profile.id,
                email: profile.email,
                nom: profile.nom,
                prenom: profile.prenom,
                role: profile.role,
                profilePhotoUrl: profile.profilePhotoUrl,
                dateCreation: profile.dateCreation || new Date()
              };
              this.isLoading = false;
              console.log('Profil chargé depuis API:', this.userInfo);
            },
            error: (error) => {
              console.error('Erreur lors du chargement du profil depuis API:', error);
              // Fallback avec les données du token
              this.userInfo = {
                email: decodedToken.email,
                nom: decodedToken.nom || '',
                prenom: decodedToken.prenom || '',
                role: decodedToken.role,
                profilePhotoUrl: null,
                dateCreation: new Date(),
                id: userId // Ajouter l'ID du token
              };
              this.isLoading = false;
              console.log('Profil chargé depuis token (fallback):', this.userInfo);
            }
          });
        } else {
          this.isLoading = false;
          console.warn('Impossible de récupérer l\'ID utilisateur');
      this.userInfo = {
        email: decodedToken.email,
        nom: decodedToken.nom || '',
        prenom: decodedToken.prenom || '',
            role: decodedToken.role,
            profilePhotoUrl: null,
            dateCreation: new Date()
      };
    }
      } catch (error) {
        console.error('Erreur lors du décodage du token:', error);
        this.isLoading = false;
      }
    } else {
      this.isLoading = false;
      console.warn('Aucun token d\'authentification trouvé');
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      console.log('Fichier sélectionné:', file.name, file.size, file.type);
      
      // Validation du fichier
      if (!this.isValidImageFile(file)) {
        this.uploadStatus = {
          type: 'danger',
          message: 'Veuillez sélectionner un fichier image valide (JPG, PNG, GIF)'
        };
        return;
      }

      // Validation de la taille (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.uploadStatus = {
          type: 'danger',
          message: 'Le fichier est trop volumineux. Taille maximum: 5MB'
        };
        return;
      }

      this.uploadProfilePhoto(file);
    }
  }

  uploadProfilePhoto(file: File) {
    this.uploadStatus = {
      type: 'info',
      message: 'Upload en cours...'
    };

    console.log('Début de l\'upload de la photo...');
    
    // Récupérer l'ID utilisateur depuis le token
    const token = this.authService.getToken();
    let userId = null;
    
    if (token) {
      try {
        const decodedToken = this.authService['decodeToken'](token) as CustomJwtPayload;
        userId = decodedToken.nameid || decodedToken.sub;
        console.log('ID utilisateur pour upload:', userId);
        console.log('Token complet pour debug:', decodedToken);
      } catch (error) {
        console.error('Erreur décodage token pour upload:', error);
      }
    }

    // 🚧 Temporaire : envoyer l'UserId dans le FormData
    const userIdNumber = userId ? parseInt(userId) : null;
    console.log('🆔 UserId à envoyer:', userIdNumber);
    
    if (!userIdNumber) {
      this.uploadStatus = {
        type: 'danger',
        message: 'Impossible de récupérer votre ID utilisateur. Veuillez vous reconnecter.'
      };
      return;
    }

    this.profileService.uploadProfilePhoto(file, userIdNumber).subscribe({
      next: (response) => {
        console.log('Réponse upload:', response);
        this.uploadStatus = {
          type: 'success',
          message: 'Photo de profil mise à jour avec succès!'
        };
        
        // Mettre à jour l'URL de la photo localement
        if (this.userInfo) {
          this.userInfo.profilePhotoUrl = response.photoUrl || response.url || response;
        }
        
        this.toastrService.success('Photo de profil mise à jour!', 'Succès');
        
        // Cacher le message après 3 secondes
        setTimeout(() => {
          this.uploadStatus = null;
        }, 3000);
      },
      error: (error) => {
        console.error('=== DÉBUT DEBUG ERREUR ===');
        console.error('Type de l\'erreur:', typeof error);
        console.error('Erreur complète (objet):', error);
        
        // Tentative de stringification pour voir tous les détails
        try {
          console.error('Erreur JSON stringify:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
        } catch (e) {
          console.error('Impossible de stringifier l\'erreur:', e);
        }
        
        console.error('Propriétés de l\'erreur:');
        console.error('- error.error:', error.error);
        console.error('- error.status:', error.status);
        console.error('- error.statusText:', error.statusText);
        console.error('- error.message:', error.message);
        console.error('- error.url:', error.url);
        console.error('- error.name:', error.name);
        
        // Vérifier si c'est une HttpErrorResponse
        if (error.error instanceof ProgressEvent) {
          console.error('=== ERREUR NETWORK/CORS ===');
          console.error('Probable erreur CORS ou serveur inaccessible');
        }
        
        console.error('=== FIN DEBUG ERREUR ===');
        
        // Essayer d'extraire le message d'erreur de différentes façons
        let errorMessage = 'Erreur lors de l\'upload de la photo';
        
        if (error.status === 0) {
          errorMessage = 'Impossible de contacter le serveur (CORS ou serveur arrêté)';
        } else if (error.error && typeof error.error === 'string') {
          errorMessage = error.error;
        } else if (error.error && error.error.message) {
          errorMessage = error.error.message;
        } else if (error.statusText) {
          errorMessage = `${error.status}: ${error.statusText}`;
        } else if (error.status) {
          errorMessage = `Erreur ${error.status}`;
        }
        
        this.uploadStatus = {
          type: 'danger',
          message: errorMessage
        };
        
        this.toastrService.danger(errorMessage, 'Erreur Upload');
      }
    });
  }

  getProfilePhotoUrl(): string {
    if (this.userInfo?.profilePhotoUrl) {
      // Si l'URL commence par /, c'est un chemin relatif du serveur backend
      if (this.userInfo.profilePhotoUrl.startsWith('/')) {
        // 🔧 Solution alternative : utiliser l'endpoint API pour servir les images
        const fileName = this.userInfo.profilePhotoUrl.split('/').pop(); // Extraire le nom du fichier
        const backendBaseUrl = 'http://localhost:5093';
        const imageUrl = `${backendBaseUrl}/user/api/Utilisateur/image/${fileName}`;
        
        console.log('🖼️ URL image générée:', imageUrl);
        console.log('🖼️ Nom fichier:', fileName);
        console.log('🖼️ URL originale:', this.userInfo.profilePhotoUrl);
        
        return imageUrl;
      }
      return this.userInfo.profilePhotoUrl;
    }
    return this.defaultAvatar;
  }

  getRoleBadgeStatus(role: string): string {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'danger';
      case 'manager':
        return 'warning';
      case 'user':
        return 'primary';
      default:
        return 'basic';
    }
  }

  private isValidImageFile(file: File): boolean {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    return allowedTypes.includes(file.type);
  }
} 