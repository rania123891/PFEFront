import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService, User } from '../../services/user.service';
import { ProfileService } from '../../services/profile.service';
import { NbToastrService } from '@nebular/theme';
import { catchError, finalize } from 'rxjs/operators';
import { of, forkJoin } from 'rxjs';

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
  
  // Propriétés pour la gestion des photos de profil
  previewImage: string | null = null;
  selectedFile: File | null = null;
  showPreviewInitials = false;

  constructor(
    private userService: UserService,
    private profileService: ProfileService,
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
        console.log('📋 Données utilisateurs reçues:', data);
        
        // Récupérer les profils complets avec photos pour chaque utilisateur
        const profileRequests = data.map(user => 
          this.profileService.getUserProfile(user.id).pipe(
            catchError(error => {
              console.error(`❌ Erreur profil pour ${user.email}:`, error);
              return of(null);
            })
          )
        );

        forkJoin(profileRequests).subscribe({
          next: (profiles) => {
            console.log('📋 Profils récupérés:', profiles);
            
            this.utilisateurs = data.map((user, index) => {
              const profile = profiles[index];
              const profilePhotoUrl = profile?.profilePhotoUrl || null;
              
              console.log(`🔍 Utilisateur ${user.email}:`, {
                user,
                profile,
                profilePhotoUrl
              });
              
              return {
                ...user,
                profilePicture: this.buildProfilePictureUrl(profilePhotoUrl)
              };
            });
            
            console.log('✅ Utilisateurs finaux avec photos:', this.utilisateurs);
            this.isLoading = false;
          },
          error: (error) => {
            console.error('❌ Erreur lors du chargement des profils:', error);
            // Fallback sans photos
            this.utilisateurs = data.map(user => ({
              ...user,
              profilePicture: null
            }));
        this.isLoading = false;
          }
        });
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

  buildProfilePictureUrl(profilePhotoUrl: string | null): string | null {
    if (!profilePhotoUrl) {
      return null;
    }
    
    if (profilePhotoUrl.startsWith('/')) {
      const fileName = profilePhotoUrl.split('/').pop();
      return `http://localhost:5093/user/api/Utilisateur/image/${fileName}`;
    }
    
    return profilePhotoUrl;
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

  getUserInitials(user: User): string {
    const nom = user.nom || '';
    const prenom = user.prenom || '';
    return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
  }

  getUserColor(userId: number): string {
    const colors = [
      '#667eea', '#4facfe', '#43e97b', '#fa709a', '#ff9a9e',
      '#a8edea', '#fed6e3', '#d299c2', '#ffecd2', '#fcb69f',
      '#89f7fe', '#66a6ff', '#f093fb', '#f5576c', '#4facfe'
    ];
    return colors[userId % colors.length];
  }

  onImageError(event: any, user: User) {
    // En cas d'erreur de chargement de l'image, afficher les initiales
    (user as any).showInitials = true;
    event.target.style.display = 'none';
  }

  // Méthodes pour la gestion des photos de profil
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      
      // Créer une prévisualisation
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewImage = e.target.result;
        this.showPreviewInitials = false;
      };
      reader.readAsDataURL(file);
    }
  }

  onPreviewImageError(event: any) {
    this.showPreviewInitials = true;
    event.target.style.display = 'none';
  }

  removeProfilePicture() {
    this.previewImage = null;
    this.selectedFile = null;
    this.showPreviewInitials = false;
    
    // Si on édite un utilisateur, marquer la photo comme supprimée
    if (this.editedUtilisateur) {
      this.editedUtilisateur.profilePicture = '';
    }
  }

  getPreviewInitials(): string {
    const nom = this.utilisateurForm.get('nom')?.value || '';
    const prenom = this.utilisateurForm.get('prenom')?.value || '';
    return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
  }

  getPreviewColor(): string {
    // Utiliser une couleur basée sur les initiales pour la cohérence
    const initials = this.getPreviewInitials();
    const colors = [
      '#667eea', '#4facfe', '#43e97b', '#fa709a', '#ff9a9e',
      '#a8edea', '#fed6e3', '#d299c2', '#ffecd2', '#fcb69f'
    ];
    const index = initials.charCodeAt(0) % colors.length;
    return colors[index];
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
    this.previewImage = null;
    this.selectedFile = null;
    this.showPreviewInitials = false;
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
    this.previewImage = null;
    this.selectedFile = null;
    this.showPreviewInitials = false;
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