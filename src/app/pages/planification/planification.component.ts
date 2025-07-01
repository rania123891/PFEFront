import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TacheService, Tache, PrioriteTache, StatutTache } from '../../services/tache.service';
import { ProjetService, Projet } from '../../services/projet.service';
import { PlanificationService, Planification, EtatListe, CreatePlanificationDto, UserPermissions, UserForSelection } from '../../services/planification.service';
import { UtilisateurService, Utilisateur } from '../../services/utilisateur.service';
import { EquipeService, Equipe } from '../../services/equipe.service';
import { MembreEquipeService } from '../../services/membre-equipe.service';
import { AuthService } from '../../auth/auth.service';
import { ProfileService } from '../../services/profile.service';

import { NbToastrService } from '@nebular/theme';
import { forkJoin, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

interface UserInfo {
  id: number;
  email: string;
  nom: string;
  prenom: string;
  picture?: string;
}

@Component({
  selector: 'ngx-planification',
  templateUrl: './planification.component.html',
  styleUrls: ['./planification.component.scss']
})
export class PlanificationComponent implements OnInit {
  projets: Projet[] = [];
  taches: Tache[] = [];
  planifications: Planification[] = [];
  utilisateurs: Utilisateur[] = [];
  planificationForm: FormGroup;
  filterForm: FormGroup;
  loading = false;
  selectedDate: Date = new Date();
  heureDebut: string = '08:00';
  heureFin: string = '09:00';
  description: string = '';
  selectedTache: number | null = null;
  statuts: StatutTache[] = [StatutTache.EnCours, StatutTache.Terminee, StatutTache.Annulee];
  searchQuery: string = '';
  selectedProjet: number | null = null;
  StatutTache = StatutTache;
  EtatListe = EtatListe;
  
  // Propriétés pour le mode édition
  isEditMode = false;
  editingPlanification: Planification | null = null;

  // Propriétés pour l'utilisateur connecté
  currentUser: UserInfo | null = null;
  currentUserEquipe: Equipe | null = null;
  
  // 👑 Propriétés pour l'interface admin
  isAdmin: boolean = false;
  selectedUserId: number | null = null;
  availableUsers: Utilisateur[] = [];
  userTeams: Map<number, string> = new Map(); // Cache des équipes par utilisateur
  filteredUsers: Utilisateur[] = [];
  userSearchQuery: string = '';
  adminStats: any = null;



  constructor(
    private formBuilder: FormBuilder,
    public tacheService: TacheService,
    private projetService: ProjetService,
    private planificationService: PlanificationService,
    private utilisateurService: UtilisateurService,
    private equipeService: EquipeService,
    private membreEquipeService: MembreEquipeService,
    private authService: AuthService,
    private toastrService: NbToastrService,
    private profileService: ProfileService
  ) {
    this.initForm();
    this.initFilterForm();
  }

  ngOnInit() {
    console.log('🔍 DEBUT DIAGNOSTIC UTILISATEUR');
    
    // Récupérer l'utilisateur depuis le token JWT du bon AuthService
    const token = this.authService.getToken();
    console.log('📱 Token depuis AuthService:', token ? 'Présent' : 'Absent');
    
    if (token) {
      try {
        // Décoder le token pour récupérer les informations utilisateur
        const tokenData = JSON.parse(atob(token.split('.')[1]));
        console.log('🔍 Données du token:', tokenData);
        
        const userId = tokenData.nameid;
        console.log('🔑 User ID depuis token:', userId);

        // Vérifier si l'utilisateur est admin depuis le token
        this.isAdmin = tokenData.role === 'Admin' || tokenData.role?.includes('Admin');
        console.log('👑 Est administrateur (depuis token):', this.isAdmin);
        
        if (userId) {
          // Récupérer le profil complet depuis l'API
          this.profileService.getUserProfile(parseInt(userId)).subscribe({
            next: (user) => {
              console.log('✅ Utilisateur récupéré via ProfileService:', user);
              if (user) {
                this.currentUser = {
                  id: user.id,
                  email: user.email,
                  nom: user.nom,
                  prenom: user.prenom,
                  picture: user.profilePhotoUrl
                };
                console.log('👤 Utilisateur connecté confirmé:', this.currentUser);
                // Charger les données nécessaires
                this.loadProjets();
                this.loadUtilisateurs();
                
                // 👑 Si admin, charger tous les utilisateurs pour la sélection
                if (this.isAdmin) {
                  this.loadAllUsersForAdmin();
                }
                
                this.loadPlanificationsByDate();
                this.loadUserEquipe();
              } else {
                console.log('⚠️ Profil utilisateur null, utilisation des données du token');
                this.fallbackToTokenData(tokenData, userId);
              }
            },
            error: (error) => {
              console.error('❌ Erreur lors de la récupération via ProfileService:', error);
                              // Fallback avec les données du token
                this.fallbackToTokenData(tokenData, userId);
                
                // 👑 Si admin, charger tous les utilisateurs pour la sélection
                if (this.isAdmin) {
                  this.loadAllUsersForAdmin();
                }
            }
          });
          return;
        }
      } catch (error) {
        console.error('❌ Erreur lors du décodage du token:', error);
      }
    }
    
    // Aucun token ou token invalide
    console.log('❌ Aucun utilisateur trouvé. Redirection nécessaire vers la page de connexion.');
    this.toastrService.danger('Session expirée. Veuillez vous reconnecter.', 'Erreur');
    return;
  }

  private initFilterForm() {
    this.filterForm = this.formBuilder.group({
      dateDebut: [new Date()],
      dateEcheance: [new Date()],
      projet: [''],
      description: ['']
    });
  }

  private initForm() {
    this.planificationForm = this.formBuilder.group({
      projetId: ['', Validators.required],
      tacheId: ['', Validators.required],
      description: [''],
      date: [new Date(), Validators.required],
      heureDebut: ['08:00', Validators.required],
      heureFin: ['09:00', Validators.required]
    });

    // Suppression du listener pour garder le filtrage par équipe
    /*
    this.planificationForm.get('projetId')?.valueChanges.subscribe(projetId => {
      if (projetId) {
        this.loadTachesProjet(projetId);
      } else {
        this.taches = [];
      }
    });
    */
  }

  onProjetChange(projetId: number) {
    console.log('🎯 onProjetChange appelé avec projetId:', projetId);
    if (projetId) {
      this.selectedProjet = projetId;
      this.planificationForm.patchValue({ projetId: projetId });
      console.log('📝 selectedProjet mis à jour:', this.selectedProjet);
      // Ne plus recharger les tâches ici car on veut garder le filtrage par équipe
      console.log('ℹ️ Les tâches restent filtrées par équipe');
    } else {
      console.log('⚠️ Aucun projet sélectionné');
      this.selectedProjet = null;
      this.planificationForm.patchValue({ projetId: null });
      // On garde les tâches de l'équipe même sans projet sélectionné
    }
  }

  onTacheChange(tacheId: number) {
    console.log('🎯 onTacheChange appelé avec tacheId:', tacheId);
    this.selectedTache = tacheId;
    this.planificationForm.patchValue({ tacheId: tacheId });
    console.log('📝 selectedTache mis à jour:', this.selectedTache);
  }

  onSearch() {
    if (this.searchQuery) {
      const searchLower = this.searchQuery.toLowerCase();
      this.taches = this.taches.filter(tache => 
        tache.titre.toLowerCase().includes(searchLower) ||
        tache.description?.toLowerCase().includes(searchLower)
      );
    } else if (this.selectedProjet) {
      this.loadTachesProjet(this.selectedProjet);
    }
  }

  openAddForm() {
    console.log("Ouverture du formulaire d'ajout");
  }

  getPlanificationsByEtat(etat: EtatListe): Planification[] {
    return this.planifications.filter(planification => planification.listeId === etat);
  }

  getStatusClass(statut: StatutTache): string {
    switch (statut) {
      case StatutTache.EnCours:
        return 'status-en-cours';
      case StatutTache.Terminee:
        return 'status-terminee';
      case StatutTache.Annulee:
        return 'status-annulee';
      default:
        return '';
    }
  }

  getPriorityClass(priorite: PrioriteTache): string {
    switch (priorite) {
      case PrioriteTache.Faible:
        return 'priority-faible';
      case PrioriteTache.Moyenne:
        return 'priority-moyenne';
      case PrioriteTache.Elevee:
        return 'priority-elevee';
      default:
        return '';
    }
  }

  editPlanification(planification: Planification) {
    console.log('📝 Édition de la planification:', planification);
    
    this.isEditMode = true;
    this.editingPlanification = planification;
    
    // Pré-remplir le formulaire avec les données existantes
    this.selectedDate = new Date(planification.date);
    this.heureDebut = planification.heureDebut;
    this.heureFin = planification.heureFin;
    this.description = planification.description || '';
    this.selectedProjet = planification.projetId;
    this.selectedTache = planification.tacheId;
    
    // Mettre à jour le formulaire
    this.planificationForm.patchValue({
      projetId: planification.projetId,
      tacheId: planification.tacheId,
      date: new Date(planification.date),
      heureDebut: planification.heureDebut,
      heureFin: planification.heureFin,
      description: planification.description || ''
    });
    
    // Charger les tâches du projet si nécessaire
    if (planification.projetId) {
      this.loadAllTaches();
    }
    
    this.toastrService.info('Mode édition activé', 'Information');
  }

  cancelEdit() {
    this.isEditMode = false;
    this.editingPlanification = null;
    this.resetForm();
    this.toastrService.info('Édition annulée', 'Information');
  }

  deletePlanification(planification: Planification) {
    if (confirm(`Êtes-vous sûr de vouloir supprimer cette planification ?`)) {
      this.planificationService.deletePlanification(planification.id!).subscribe({
        next: () => {
          console.log('✅ Planification supprimée:', planification.id);
          this.toastrService.success('Planification supprimée avec succès', 'Succès');
          
          // Retirer de la liste locale
          this.planifications = this.planifications.filter(p => p.id !== planification.id);
        },
        error: (error) => {
          console.error('❌ Erreur lors de la suppression:', error);
          
          // Fallback: suppression locale
          console.log('🛠️ API non disponible, suppression locale...');
          this.planifications = this.planifications.filter(p => p.id !== planification.id);
          this.toastrService.success('Planification supprimée localement', 'Succès');
        }
      });
    }
  }

  updateStatut(planification: Planification, nouvelEtat: EtatListe) {
    const ancienEtat = planification.listeId;
    console.log(`🔄 Mise à jour du statut de la planification ${planification.id} : ${ancienEtat} → ${nouvelEtat}`);
    
    // Mise à jour optimiste (locale)
    planification.listeId = nouvelEtat;
    
    // 🔍 Vérifier si c'est une tâche reportée (sans ID)
    if (!planification.id) {
      console.log('📝 Tâche reportée détectée - création d\'une nouvelle planification');
      this.creerPlanificationPourTacheReportee(planification, nouvelEtat);
      return;
    }
    
    this.planificationService.updatePlanificationStatus(planification.id, nouvelEtat).subscribe({
      next: (updatedPlanification) => {
        console.log('✅ Statut mis à jour avec succès:', updatedPlanification);
        
        // Mettre à jour l'objet local avec la réponse du serveur
        const index = this.planifications.findIndex(p => p.id === planification.id);
        if (index !== -1) {
          this.planifications[index] = { ...this.planifications[index], ...updatedPlanification };
        }
        
        this.toastrService.success(
          `Statut changé vers "${this.getEtatLabel(nouvelEtat)}"`, 
          'Succès'
        );
      },
      error: (error) => {
        console.error('❌ Erreur lors de la mise à jour du statut:', error);
        
        // Revenir en arrière en cas d'erreur
        planification.listeId = ancienEtat;
        
        this.toastrService.danger(
          'Erreur lors de la mise à jour du statut', 
          'Erreur'
        );
      }
    });
  }

  private getEtatLabel(etat: EtatListe): string {
    switch (etat) {
      case EtatListe.Todo:
        return 'To Do';
      case EtatListe.EnCours:
        return 'En Cours';
      case EtatListe.Test:
        return 'Test';
      case EtatListe.Termine:
        return 'Terminé';
      default:
        return 'Inconnu';
    }
  }

  loadProjets() {
    this.projetService.getProjets().subscribe({
      next: (projets) => {
        this.projets = projets;
        console.log('✅ Projets chargés:', projets.length);
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement des projets:', error);
      }
    });
  }

  loadAllTaches() {
    console.log('🔍 DEBUT loadAllTaches()');
    console.log('🔍 currentUserEquipe:', this.currentUserEquipe);
    
    // Charger les tâches de l'équipe de l'utilisateur connecté
    if (this.currentUserEquipe && this.currentUserEquipe.idEquipe && this.currentUserEquipe.idEquipe !== undefined) {
      console.log('📋 Chargement des tâches pour l\'équipe:', this.currentUserEquipe.nom);
      console.log('🔍 ID de l\'équipe:', this.currentUserEquipe.idEquipe);
      this.tacheService.getTachesByEquipe(this.currentUserEquipe.idEquipe).subscribe({
        next: (taches) => {
          console.log('✅ Tâches de l\'équipe chargées:', taches.length);
          console.log('📋 Détail des tâches reçues:', taches);
          this.taches = taches;
          console.log('📋 Tâches disponibles pour l\'équipe:', this.taches.length);
          
          // Si aucune tâche n'est trouvée pour l'équipe, afficher un message informatif
          if (taches.length === 0) {
            this.toastrService.info(
              `Aucune tâche trouvée pour l'équipe "${this.currentUserEquipe?.nom}". Vous pouvez en créer dans la section Tâches.`,
              'Aucune tâche'
            );
          }
        },
        error: (error) => {
          console.error('❌ Erreur lors du chargement des tâches de l\'équipe:', error);
          console.error('🔍 Statut de l\'erreur:', error.status);
          console.error('🔍 Message d\'erreur:', error.message);
          
          // Fallback temporaire pour le débogage : charger toutes les tâches
          console.log('🔄 FALLBACK TEMPORAIRE: chargement de toutes les tâches pour débogage');
          this.loadAllTachesForDebugging();
        }
      });
    } else {
      console.log('⚠️ Aucune équipe définie pour l\'utilisateur ou ID équipe undefined');
      console.log('🔍 currentUserEquipe:', this.currentUserEquipe);
      console.log('🔍 idEquipe:', this.currentUserEquipe?.idEquipe);
      
      // Fallback temporaire pour le débogage : charger toutes les tâches
      console.log('🔄 FALLBACK TEMPORAIRE: chargement de toutes les tâches car pas d\'équipe valide');
      this.loadAllTachesForDebugging();
    }
  }

  private loadAllTachesForDebugging() {
    console.log('🔧 DÉBOGAGE: Chargement de toutes les tâches');
    this.tacheService.getTaches().subscribe({
      next: (taches) => {
        console.log('📋 DÉBOGAGE: Toutes les tâches chargées:', taches.length);
        console.log('📋 DÉBOGAGE: Détail des tâches:', taches);
        this.taches = taches;
        
        this.toastrService.warning(
          `Mode débogage: ${taches.length} tâches chargées (toutes équipes confondues). Vérifiez l'assignation à l'équipe.`,
          'Mode débogage'
        );
      },
      error: (error) => {
        console.error('❌ DÉBOGAGE: Erreur lors du chargement de toutes les tâches:', error);
        this.taches = [];
        this.toastrService.danger(
          'Impossible de charger les tâches. Vérifiez la connexion au serveur.',
          'Erreur de connexion'
        );
      }
    });
  }

  private loadAllTachesAsFallback() {
    // Rediriger vers la méthode de débogage
    console.warn('⚠️ loadAllTachesAsFallback appelée - redirection vers débogage');
    this.loadAllTachesForDebugging();
  }

  loadTachesProjet(projetId: number) {
    // Respecter le filtrage par équipe même lors de la sélection d'un projet
    // Les tâches affichées doivent toujours être celles de l'équipe de l'utilisateur
    console.log('🎯 Projet sélectionné:', projetId, '- Maintien du filtrage par équipe');
    // Ne pas recharger les tâches, garder celles de l'équipe
    // this.loadAllTaches(); // Commenté pour éviter le rechargement
  }

  private loadAllTachesAndFilter(projetId: number) {
    // Respecter le filtrage par équipe même lors du filtrage par projet
    // Les tâches affichées doivent toujours être celles de l'équipe de l'utilisateur
    console.log('🎯 Filtrage par projet:', projetId, '- Maintien du filtrage par équipe');
    // Ne pas recharger les tâches, garder celles de l'équipe
    // this.loadAllTaches(); // Commenté pour éviter le rechargement
  }

  // ===== MÉTHODE AVEC PERSISTANCE DES TÂCHES =====
  loadPlanificationsByDate() {
    if (!this.currentUser) {
      return;
    }

    this.loading = true;
    
    // Correction du problème de fuseau horaire
    const year = this.selectedDate.getFullYear();
    const month = String(this.selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(this.selectedDate.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    // 👑 Déterminer quel utilisateur utiliser (admin ou utilisateur connecté)
    const targetUserId = this.getCurrentViewUserId();
    
    console.log('🔍 Chargement des planifications pour la date:', dateStr);
    console.log('👤 Utilisateur cible:', targetUserId);
    console.log('👑 Mode admin:', this.isAdmin);
    
    // 1️⃣ Charger les planifications du jour sélectionné
    const planificationsJour = this.planificationService.getPlanificationsByUserAndDate(targetUserId, dateStr);
    
    // 2️⃣ Charger les tâches non terminées des jours précédents
    const tachesEnCours = this.loadTachesEnCoursFromPreviousDays(dateStr);
    
    // 3️⃣ Combiner les deux
    forkJoin({
      planificationsJour: planificationsJour,
      tachesEnCours: tachesEnCours
    }).subscribe({
      next: (result) => {
        console.log('✅ Planifications du jour:', result.planificationsJour.length);
        console.log('✅ Tâches en cours des jours précédents:', result.tachesEnCours.length);
        
        // Combiner les planifications en évitant les doublons
        const planificationsCompletes = this.combinerPlanifications(
          result.planificationsJour, 
          result.tachesEnCours, 
          dateStr
        );
        
        this.planifications = planificationsCompletes;
        console.log('🎯 Total planifications affichées:', this.planifications.length);
        
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement des planifications:', error);
        // Fallback : charger seulement les planifications du jour
        this.planificationService.getPlanificationsByUserAndDate(targetUserId, dateStr).subscribe({
          next: (planifications) => {
            this.planifications = planifications;
            this.loading = false;
          },
          error: (fallbackError) => {
            console.error('❌ Erreur fallback:', fallbackError);
            this.planifications = [];
            this.loading = false;
          }
        });
      }
    });
  }

  onDateChange(date: Date) {
    this.selectedDate = date;
    this.loadPlanificationsByDate();
  }

  onSubmit() {
    if (!this.planificationForm.valid) {
      console.log('❌ Formulaire invalide:', this.getFormErrors());
      this.toastrService.danger('Veuillez remplir tous les champs requis', 'Formulaire invalide');
      return;
    }

    if (!this.selectedTache || !this.selectedProjet) {
      this.toastrService.danger('Veuillez sélectionner un projet et une tâche', 'Sélection manquante');
      return;
    }

    // Validation des heures
    const debut = this.parseTime(this.heureDebut);
    const fin = this.parseTime(this.heureFin);
    
    if (debut >= fin) {
      this.toastrService.danger('L\'heure de fin doit être postérieure à l\'heure de début', 'Horaire invalide');
      return;
    }

    // Correction du problème de fuseau horaire
    const year = this.selectedDate.getFullYear();
    const month = String(this.selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(this.selectedDate.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    if (this.isEditMode && this.editingPlanification) {
      this.updatePlanification(this.editingPlanification.id!, dateStr);
    } else {
      this.createPlanification(dateStr);
    }
  }

  private parseTime(timeStr: string): number {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }

  // ===== MÉTHODE SIMPLIFIÉE POUR LA CRÉATION =====
  private createPlanification(dateStr: string) {
    if (!this.currentUser) {
      this.toastrService.danger('Utilisateur non connecté', 'Erreur');
      return;
    }

    const planificationData: CreatePlanificationDto = {
      date: dateStr,
      heureDebut: this.heureDebut,
      heureFin: this.heureFin,
      description: this.description || '',
      tacheId: this.selectedTache!,
      projetId: this.selectedProjet!,
      listeId: EtatListe.Todo,
      userId: this.currentUser.id // Envoyer l'UserId
    };

    console.log('📤 Création d\'une nouvelle planification:', planificationData);

    this.planificationService.createPlanification(planificationData).subscribe({
      next: (planification) => {
        console.log('✅ Planification créée:', planification);
        this.toastrService.success('Planification créée avec succès', 'Succès');
        this.resetForm();
        this.loadPlanificationsByDate();
      },
      error: (error) => {
        console.error('❌ Erreur lors de la création:', error);
        this.toastrService.danger('Erreur lors de la création de la planification', 'Erreur');
      }
    });
  }

  private updatePlanification(id: number, dateStr: string) {
    const updateData = {
      date: dateStr,
      heureDebut: this.heureDebut,
      heureFin: this.heureFin,
      description: this.description || '',
      tacheId: this.selectedTache!,
      projetId: this.selectedProjet!
    };

    console.log('📤 Mise à jour de la planification:', id, updateData);

    this.planificationService.updatePlanification(id, updateData).subscribe({
      next: (planificationMiseAJour) => {
        console.log('✅ Planification mise à jour:', planificationMiseAJour);
        this.toastrService.success('Planification modifiée avec succès', 'Succès');
        
        // Mettre à jour la planification dans la liste locale
        const index = this.planifications.findIndex(p => p.id === id);
        if (index !== -1) {
          // Garder les informations liées (tache, projet) existantes
          this.planifications[index] = {
            ...this.planifications[index],
            ...updateData,
            id: id
          };
        }
        
        this.loadPlanificationsByDate();
        this.resetForm();
        this.isEditMode = false;
        this.editingPlanification = null;
      },
      error: (error) => {
        console.error('❌ Erreur lors de la mise à jour:', error);
        console.log('🛠️ API non disponible, mise à jour locale...');
        
        // Fallback: mise à jour locale
        const index = this.planifications.findIndex(p => p.id === id);
        if (index !== -1) {
          this.planifications[index] = {
            ...this.planifications[index],
            ...updateData,
            id: id
          };
          
          this.toastrService.success('Planification modifiée localement', 'Succès');
          this.resetForm();
          this.isEditMode = false;
          this.editingPlanification = null;
        } else {
          this.toastrService.danger('Erreur lors de la modification', 'Erreur');
        }
      }
    });
  }

  private resetForm() {
    this.selectedProjet = null;
    this.selectedTache = null;
    this.heureDebut = '08:00';
    this.heureFin = '09:00';
    this.description = '';
    
    this.planificationForm.reset({
      projetId: '',
      tacheId: '',
      description: '',
      date: new Date(),
      heureDebut: '08:00',
      heureFin: '09:00'
    });
  }

  getFormErrors() {
    const errors: any = {};
    Object.keys(this.planificationForm.controls).forEach(key => {
      const control = this.planificationForm.get(key);
      if (control && !control.valid) {
        errors[key] = control.errors;
      }
    });
    return errors;
  }

  loadUtilisateurs() {
    this.utilisateurService.getUtilisateurs().subscribe({
      next: (utilisateurs) => {
        this.utilisateurs = utilisateurs;
        console.log('✅ Utilisateurs chargés:', utilisateurs.length);
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement des utilisateurs:', error);
      }
    });
  }

  getAssignedUser(assigneId: number): Utilisateur | null {
    return this.utilisateurs.find(user => user.id === assigneId) || null;
  }

  getUserInitials(user: Utilisateur): string {
    const prenom = user.prenom || '';
    const nom = user.nom || '';
    return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
  }

  getUserColor(userId: number): string {
    const colors = ['#3366cc', '#dc3912', '#ff9900', '#109618', '#990099', '#0099c6', '#dd4477', '#66aa00', '#b82e2e', '#316395'];
    return colors[userId % colors.length];
  }

  private fallbackToTokenData(tokenData: any, userId: string) {
    this.currentUser = {
      id: parseInt(userId),
      email: tokenData.email || '',
      nom: tokenData.nom || '',
      prenom: tokenData.prenom || '',
      picture: null
    };
    console.log('👤 Utilisateur depuis token (fallback):', this.currentUser);
    // Charger les données nécessaires
    this.loadProjets();
    this.loadUtilisateurs();
    this.loadPlanificationsByDate();
    this.loadUserEquipe();
  }

  loadUserEquipe() {
    if (this.currentUser) {
      console.log('🔍 Recherche de l\'équipe pour l\'utilisateur:', this.currentUser.id);
      
      this.membreEquipeService.getMembres().subscribe({
        next: (membres) => {
          console.log('📋 Tous les membres récupérés:', membres);
          console.log('🔍 Premier membre (exemple):', JSON.stringify(membres[0], null, 2));
          
          // Essayer différentes façons de trouver l'utilisateur
          let membreUtilisateur = membres.find(m => m.utilisateurId === this.currentUser!.id);
          
          if (!membreUtilisateur) {
            // Essayer avec UtilisateurId (majuscule)
            membreUtilisateur = membres.find(m => (m as any).UtilisateurId === this.currentUser!.id);
          }
          
          if (!membreUtilisateur && (membres as any).some((m: any) => m.utilisateur)) {
            // Essayer via l'objet utilisateur imbriqué
            membreUtilisateur = membres.find(m => (m as any).utilisateur?.id === this.currentUser!.id);
          }
          
          console.log('👤 Membre utilisateur trouvé:', membreUtilisateur);
          console.log('🔍 Structure complète du membre:', JSON.stringify(membreUtilisateur, null, 2));
          
          if (membreUtilisateur && membreUtilisateur.equipe) {
            this.currentUserEquipe = {
              idEquipe: membreUtilisateur.equipe.idEquipe || (membreUtilisateur.equipe as any).id,
              nom: membreUtilisateur.equipe.nom,
              statut: 0 // Valeur par défaut
            };
            console.log('✅ Équipe de l\'utilisateur chargée:', this.currentUserEquipe);
            // Charger les tâches de l'équipe maintenant qu'on a les infos
            this.loadAllTaches();
          } else if (membreUtilisateur && (membreUtilisateur as any).Equipe) {
            // Essayer avec Equipe (majuscule)
            const equipe = (membreUtilisateur as any).Equipe;
            this.currentUserEquipe = {
              idEquipe: equipe.IdEquipe || equipe.id || equipe.idEquipe,
              nom: equipe.Nom || equipe.nom,
              statut: 0
            };
            console.log('✅ Équipe de l\'utilisateur chargée (Majuscule):', this.currentUserEquipe);
            // Charger les tâches de l'équipe maintenant qu'on a les infos
            this.loadAllTaches();
          } else if (membreUtilisateur && membreUtilisateur.equipeId) {
            // Récupérer l'équipe par son ID
            console.log('🔍 Récupération equipe avec ID:', membreUtilisateur.equipeId);
            this.equipeService.getEquipeForCrud(membreUtilisateur.equipeId).subscribe({
              next: (equipe) => {
                console.log('🔍 Équipe brute reçue de l\'API:', equipe);
                console.log('🔍 Structure complète de l\'équipe:', JSON.stringify(equipe, null, 2));
                
                // Essayer différentes propriétés pour l'ID
                let equipeId = (equipe as any).idEquipe || 
                              (equipe as any).id || 
                              (equipe as any).IdEquipe ||
                              membreUtilisateur.equipeId; // Fallback vers l'ID du membre
                
                console.log('🔍 ID équipe extrait:', equipeId);
                
                this.currentUserEquipe = {
                  idEquipe: equipeId,
                  nom: (equipe as any).nom || (equipe as any).Nom || 'Équipe inconnue',
                  statut: 0
                };
                console.log('✅ Équipe récupérée par ID:', this.currentUserEquipe);
                
                // Vérifier que l'ID est bien défini avant de charger les tâches
                if (this.currentUserEquipe.idEquipe) {
                  console.log('✅ ID équipe valide, chargement des tâches');
                  this.loadAllTaches();
                } else {
                  console.error('❌ ID équipe toujours undefined après traitement');
                  console.log('🔄 Utilisation de l\'ID du membre comme fallback');
                  this.currentUserEquipe.idEquipe = membreUtilisateur.equipeId;
                this.loadAllTaches();
                }
              },
              error: (error) => {
                console.error('❌ Erreur lors de la récupération équipe:', error);
                // Ne pas créer d'équipe par défaut, laisser null
                this.currentUserEquipe = null;
                console.log('⚠️ Impossible de récupérer l\'équipe, utilisateur sans équipe');
                // Charger les tâches (qui sera une liste vide)
                this.loadAllTaches();
              }
            });
          } else {
            console.log('⚠️ Utilisateur non assigné à une équipe');
            console.log('🔍 Structure du membre:', membreUtilisateur);
            
            // Ne pas créer d'équipe par défaut
            this.currentUserEquipe = null;
            console.log('⚠️ Aucune équipe trouvée pour cet utilisateur');
            // Charger les tâches (qui sera une liste vide)
            this.loadAllTaches();
          }
        },
        error: (error) => {
          console.error('❌ Erreur lors du chargement de l\'équipe:', error);
          
          // Ne pas créer d'équipe par défaut en cas d'erreur
          this.currentUserEquipe = null;
          console.log('❌ Erreur API, utilisateur sans équipe');
          // Charger les tâches (qui sera une liste vide)
          this.loadAllTaches();
        }
      });
    }
  }

  // 🔄 Charger les tâches non terminées des jours précédents
  private loadTachesEnCoursFromPreviousDays(dateActuelle: string): Observable<Planification[]> {
    if (!this.currentUser) {
      return new Observable(observer => {
        observer.next([]);
        observer.complete();
      });
    }

    // 👑 Utiliser l'utilisateur cible (admin ou utilisateur connecté)
    const targetUserId = this.getCurrentViewUserId();
    
    console.log('🔍 Recherche des tâches en cours des jours précédents...');
    console.log('👤 Pour l\'utilisateur:', targetUserId);
    
    // Calculer la date d'il y a 7 jours pour limiter la recherche
    const dateActuelleObj = new Date(dateActuelle);
    const dateLimite = new Date(dateActuelleObj);
    dateLimite.setDate(dateLimite.getDate() - 7);
    
    const dateLimiteStr = dateLimite.toISOString().split('T')[0];
    
    console.log('📅 Recherche entre', dateLimiteStr, 'et', dateActuelle);
    
    // Créer un Observable qui recherche les planifications des 7 derniers jours
    return new Observable<Planification[]>(observer => {
      // Pour l'instant, on va chercher jour par jour (on pourrait optimiser avec une API dédiée)
      const observables: Observable<Planification[]>[] = [];
      
      for (let i = 1; i <= 7; i++) {
        const dateRecherche = new Date(dateActuelleObj);
        dateRecherche.setDate(dateRecherche.getDate() - i);
        const dateRechercheStr = dateRecherche.toISOString().split('T')[0];
        
        observables.push(
          this.planificationService.getPlanificationsByUserAndDate(targetUserId, dateRechercheStr)
        );
      }
      
      // Exécuter toutes les recherches en parallèle
      forkJoin(observables).subscribe({
        next: (resultats) => {
          // Aplatir tous les résultats
          const toutesLesPlanifications = resultats.reduce((acc, val) => acc.concat(val), []);
          
          // Filtrer seulement les tâches non terminées (En cours, Todo, Test)
          const tachesNonTerminees = toutesLesPlanifications.filter(planif => 
            planif.listeId === EtatListe.EnCours || 
            planif.listeId === EtatListe.Todo || 
            planif.listeId === EtatListe.Test
          );
          
          console.log('🎯 Tâches non terminées trouvées:', tachesNonTerminees.length);
          observer.next(tachesNonTerminees);
          observer.complete();
        },
        error: (error) => {
          console.error('❌ Erreur lors de la recherche des tâches précédentes:', error);
          observer.next([]);
          observer.complete();
        }
      });
    });
  }

  // 🔀 Combiner les planifications du jour avec les tâches en cours précédentes
  private combinerPlanifications(
    planificationsJour: Planification[], 
    tachesEnCours: Planification[], 
    dateActuelle: string
  ): Planification[] {
    console.log('🔀 Combinaison des planifications...');
    
    // 1️⃣ Commencer avec les planifications du jour
    const resultat = [...planificationsJour];
    
    // 2️⃣ Ajouter les tâches en cours des jours précédents qui ne sont pas déjà présentes
    tachesEnCours.forEach(tacheEnCours => {
      // Vérifier si cette tâche n'est pas déjà planifiée aujourd'hui
      const dejaPresente = resultat.some(planifJour => 
        planifJour.tacheId === tacheEnCours.tacheId
      );
      
      if (!dejaPresente) {
        // Créer une nouvelle planification pour aujourd'hui avec la tâche en cours
        const nouvellePlanification: Planification = {
          ...tacheEnCours,
          id: undefined, // Nouvelle planification, pas d'ID
          date: dateActuelle, // Date d'aujourd'hui
          // Garder le statut actuel de la tâche
          listeId: tacheEnCours.listeId,
          // Optionnel : ajuster les horaires pour aujourd'hui
          heureDebut: tacheEnCours.heureDebut || '08:00',
          heureFin: tacheEnCours.heureFin || '09:00',
          description: `${tacheEnCours.description || ''} (Reportée du ${tacheEnCours.date})`.trim()
        };
        
        resultat.push(nouvellePlanification);
        console.log(`➕ Tâche reportée: "${tacheEnCours.tache?.titre}" du ${tacheEnCours.date}`);
      } else {
        console.log(`⏭️ Tâche déjà planifiée aujourd'hui: "${tacheEnCours.tache?.titre}"`);
      }
    });
    
    console.log('✅ Total après combinaison:', resultat.length);
    return resultat;
  }

  // 🧹 Nettoyer la description pour supprimer les textes de prédiction IA indésirables
  getCleanDescription(description: string | undefined): string | null {
    if (!description) return null;
    
    // Supprimer les textes de prédiction IA
    let cleanDescription = description
      .replace(/\(Durée estimée IA:.*?\)/g, '') // Supprimer "(Durée estimée IA: X minutes)"
      .replace(/Durée estimée IA:.*$/gm, '') // Supprimer "Durée estimée IA: X" en fin de ligne
      .trim();
    
    // Si la description devient vide après nettoyage, retourner null
    return cleanDescription.length > 0 ? cleanDescription : null;
  }

  // 📝 Créer une nouvelle planification pour une tâche reportée
  private creerPlanificationPourTacheReportee(planification: Planification, nouvelEtat: EtatListe) {
    if (!this.currentUser) {
      this.toastrService.danger('Utilisateur non connecté', 'Erreur');
      return;
    }

    // Correction du problème de fuseau horaire pour la date actuelle
    const year = this.selectedDate.getFullYear();
    const month = String(this.selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(this.selectedDate.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    const planificationData: CreatePlanificationDto = {
      date: dateStr,
      heureDebut: planification.heureDebut || '08:00',
      heureFin: planification.heureFin || '09:00',
      description: this.getCleanDescription(planification.description) || '',
      tacheId: planification.tacheId!,
      projetId: planification.projetId!,
      listeId: nouvelEtat, // Utiliser le nouveau statut
      userId: this.currentUser.id
    };

    console.log('📤 Création d\'une planification pour tâche reportée:', planificationData);

    this.planificationService.createPlanification(planificationData).subscribe({
      next: (nouvellePlanification) => {
        console.log('✅ Planification créée pour tâche reportée:', nouvellePlanification);
        
        // Remplacer la planification temporaire par la vraie
        const index = this.planifications.findIndex(p => 
          p.tacheId === planification.tacheId && !p.id
        );
        
        if (index !== -1) {
          // Remplacer par la nouvelle planification avec ID
          this.planifications[index] = {
            ...nouvellePlanification,
            tache: planification.tache, // Garder les infos de la tâche
            projet: planification.projet // Garder les infos du projet
          };
        }
        
        this.toastrService.success(
          `Tâche reportée et statut changé vers "${this.getEtatLabel(nouvelEtat)}"`, 
          'Succès'
        );
      },
      error: (error) => {
        console.error('❌ Erreur lors de la création de la planification:', error);
        
        // Revenir en arrière en cas d'erreur
        planification.listeId = planification.listeId === nouvelEtat ? EtatListe.Todo : planification.listeId;
        
        this.toastrService.danger(
          'Erreur lors de la création de la planification', 
          'Erreur'
        );
      }
         });
   }

  // 👑 Méthodes pour l'interface administrateur
  
  loadAllUsersForAdmin() {
    console.log('👑 Chargement de tous les utilisateurs pour l\'admin');
    
    // Charger les utilisateurs et leurs équipes
    forkJoin({
      users: this.utilisateurService.getUtilisateurs(),
      membres: this.membreEquipeService.getMembres()
    }).subscribe({
      next: (result) => {
        this.availableUsers = result.users;
        console.log('✅ Utilisateurs chargés pour admin:', result.users.length);
        
        // Créer le cache des équipes
        this.buildUserTeamsCache(result.membres);
        console.log('✅ Cache des équipes créé:', this.userTeams.size, 'mappings');
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement des utilisateurs pour admin:', error);
        this.toastrService.danger('Erreur lors du chargement des utilisateurs', 'Erreur');
        
        // Fallback : charger seulement les utilisateurs
        this.utilisateurService.getUtilisateurs().subscribe({
          next: (users) => {
            this.availableUsers = users;
            console.log('✅ Utilisateurs chargés (fallback):', users.length);
          },
          error: (fallbackError) => {
            console.error('❌ Erreur fallback:', fallbackError);
          }
        });
      }
    });
  }

  // 🏗️ Construire le cache des équipes par utilisateur
  private buildUserTeamsCache(membres: any[]) {
    this.userTeams.clear();
    console.log('🏗️ Construction du cache des équipes avec', membres.length, 'membres');
    
    membres.forEach((membre, index) => {
      console.log(`🔍 Membre ${index + 1}:`, JSON.stringify(membre, null, 2));
      
      // Essayer différentes propriétés pour l'ID utilisateur
      const userId = membre.utilisateurId || 
                    membre.UtilisateurId || 
                    (membre.utilisateur && membre.utilisateur.id);
      
      // Essayer différentes propriétés pour l'équipe
      const equipe = membre.equipe || 
                     membre.Equipe;
      
      console.log(`🔍 UserId trouvé:`, userId);
      console.log(`🔍 Équipe trouvée:`, equipe);
      
      if (userId && equipe) {
        const equipeNom = equipe.nom || equipe.Nom || equipe.name || 'Équipe inconnue';
        this.userTeams.set(userId, equipeNom);
        console.log(`✅ Cache: Utilisateur ${userId} → Équipe "${equipeNom}"`);
      } else {
        console.log(`❌ Membre ignoré - UserId: ${userId}, Équipe: ${equipe ? 'présente' : 'manquante'}`);
        
        // Si on a un equipeId mais pas de nom, essayer de récupérer le nom
        const equipeId = membre.equipeId || membre.EquipeId;
        if (userId && equipeId) {
          this.loadEquipeNameById(userId, equipeId);
        }
      }
    });
    
    console.log('📊 Cache final des équipes:', Array.from(this.userTeams.entries()));
    
    // Si aucune équipe n'a été trouvée, essayer une approche alternative
    if (this.userTeams.size === 0) {
      console.log('⚠️ Aucune équipe trouvée, tentative de récupération alternative...');
      this.loadUserTeamsAlternative();
    }
  }

  // 🔄 Méthode alternative pour charger les équipes
  private loadUserTeamsAlternative() {
    console.log('🔄 Chargement alternatif des équipes...');
    
    // Récupérer les équipes et les membres en parallèle
    forkJoin({
      equipes: this.equipeService.getEquipes(),
      membres: this.membreEquipeService.getMembres()
    }).subscribe({
      next: (result) => {
        console.log('✅ Équipes récupérées:', result.equipes);
        console.log('✅ Membres récupérés (alternative):', result.membres);
        
                 // Créer un map des équipes par ID pour un accès rapide
         const equipesMap = new Map();
         result.equipes.forEach(equipe => {
           equipesMap.set((equipe as any).idEquipe || equipe.id, equipe.nom);
         });
         
         console.log('📋 Map des équipes:', Array.from(equipesMap.entries()));
         
         // Mapper les utilisateurs avec leurs équipes
         result.membres.forEach(membre => {
           const userId = membre.utilisateurId;
           const equipeId = membre.equipeId || 
                           (membre.equipe && (membre.equipe as any).idEquipe);
          
          if (userId && equipeId) {
            const equipeNom = equipesMap.get(equipeId);
            if (equipeNom) {
              this.userTeams.set(userId, equipeNom);
              console.log(`✅ Alternative: Utilisateur ${userId} → Équipe "${equipeNom}"`);
            }
          }
        });
        
        console.log('📊 Cache final après méthode alternative:', Array.from(this.userTeams.entries()));
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement alternatif:', error);
      }
    });
  }

  onUserSelectionChange(userId: number) {
    console.log('👑 Changement de sélection utilisateur:', userId);
    this.selectedUserId = userId;
    
    // Recharger les planifications pour l'utilisateur sélectionné
    this.loadPlanificationsByDate();
  }

  getCurrentViewUserId(): number {
    // Si admin et utilisateur sélectionné, retourner l'utilisateur sélectionné
    if (this.isAdmin && this.selectedUserId) {
      return this.selectedUserId;
    }
    // Sinon, retourner l'utilisateur connecté
    return this.currentUser?.id || 0;
  }

  getSelectedUserName(): string {
    if (this.isAdmin && this.selectedUserId) {
      const selectedUser = this.availableUsers.find(u => u.id === this.selectedUserId);
      if (selectedUser) {
        return `${selectedUser.prenom} ${selectedUser.nom}`;
      }
    }
    return `${this.currentUser?.prenom || ''} ${this.currentUser?.nom || ''}`.trim();
  }

  // 👥 Méthodes pour la gestion des équipes et avatars

  getUserTeam(userId: number): string | null {
    const team = this.userTeams.get(userId);
    console.log(`🔍 Recherche équipe pour utilisateur ${userId}:`, team);
    
    // Si l'équipe affiche "Équipe X", essayer de récupérer le vrai nom
    if (team && team.startsWith('Équipe ') && /Équipe \d+/.test(team)) {
      console.log(`🔧 Équipe avec ID détectée: ${team}, recherche du vrai nom...`);
      const equipeId = parseInt(team.replace('Équipe ', ''));
      
      // Chercher dans toutes les équipes disponibles
      this.equipeService.getEquipes().subscribe({
        next: (equipes) => {
          const equipe = equipes.find(e => (e as any).idEquipe === equipeId || (e as any).id === equipeId);
          if (equipe && equipe.nom) {
            this.userTeams.set(userId, equipe.nom);
            console.log(`✅ Vrai nom d'équipe trouvé: ${equipe.nom}`);
          }
        },
        error: (error) => {
          console.error(`❌ Erreur lors de la recherche d'équipe:`, error);
        }
      });
    }
    
    // Si pas d'équipe trouvée, essayer de la chercher directement
    if (!team && this.availableUsers.length > 0) {
      const user = this.availableUsers.find(u => u.id === userId);
      if (user) {
        console.log(`🔍 Utilisateur trouvé:`, user);
        // Essayer de récupérer l'équipe depuis l'utilisateur si elle y est
        if ((user as any).equipe) {
          const equipeNom = (user as any).equipe.nom || (user as any).equipe.Nom;
          if (equipeNom) {
            this.userTeams.set(userId, equipeNom);
            console.log(`✅ Équipe trouvée via utilisateur: ${equipeNom}`);
            return equipeNom;
          }
        }
      }
    }
    
    return team || null;
  }

  getSelectedUserInitials(): string {
    if (this.isAdmin && this.selectedUserId) {
      const selectedUser = this.availableUsers.find(u => u.id === this.selectedUserId);
      if (selectedUser) {
        return this.getUserInitials(selectedUser);
      }
    }
    return this.getUserInitials(this.currentUser as any);
  }

  getSelectedUserTeam(): string | null {
    if (this.isAdmin && this.selectedUserId) {
      return this.getUserTeam(this.selectedUserId);
    }
    return this.currentUserEquipe?.nom || null;
  }

  // 🔍 Récupérer le nom d'une équipe par son ID
  private loadEquipeNameById(userId: number, equipeId: number) {
    console.log(`🔍 Recherche du nom de l'équipe ${equipeId} pour l'utilisateur ${userId}`);
    
    this.equipeService.getEquipeForCrud(equipeId).subscribe({
      next: (equipe) => {
        if (equipe && equipe.nom) {
          this.userTeams.set(userId, equipe.nom);
          console.log(`✅ Nom d'équipe récupéré: Utilisateur ${userId} → Équipe "${equipe.nom}"`);
        }
      },
      error: (error) => {
        console.error(`❌ Erreur lors de la récupération de l'équipe ${equipeId}:`, error);
      }
         });
   }

  // 🎨 Méthode pour afficher le nom d'équipe de façon propre
  getDisplayTeamName(teamName: string | null): string {
    if (!teamName) return '';
    
    // Si c'est "Équipe X", essayer de récupérer le vrai nom
    if (teamName.startsWith('Équipe ') && /Équipe \d+/.test(teamName)) {
      // Pour l'instant, retourner un nom générique plus joli
      const equipeId = teamName.replace('Équipe ', '');
      return `Équipe #${equipeId}`; // Plus joli que "Équipe 13"
    }
    
    return teamName;
  }

  
}    