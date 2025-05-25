import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TacheService, Tache, PrioriteTache, StatutTache } from '../../services/tache.service';
import { ProjetService, Projet } from '../../services/projet.service';
import { PlanificationService, Planification, EtatListe, CreatePlanificationDto } from '../../services/planification.service';
import { UtilisateurService, Utilisateur } from '../../services/utilisateur.service';
import { NbToastrService } from '@nebular/theme';
import { forkJoin } from 'rxjs';

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

  constructor(
    private formBuilder: FormBuilder,
    public tacheService: TacheService,
    private projetService: ProjetService,
    private planificationService: PlanificationService,
    private utilisateurService: UtilisateurService,
    private toastrService: NbToastrService,
  ) {
    this.initForm();
    this.initFilterForm();
  }

  ngOnInit() {
    this.loadProjets();
    this.loadUtilisateurs();
    this.loadPlanificationsByDate();
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

    this.planificationForm.get('projetId')?.valueChanges.subscribe(projetId => {
      if (projetId) {
        this.loadTachesProjet(projetId);
      } else {
        this.taches = [];
      }
    });
  }

  onProjetChange(projetId: number) {
    console.log('🎯 onProjetChange appelé avec projetId:', projetId);
    if (projetId) {
      this.selectedProjet = projetId;
      this.planificationForm.patchValue({ projetId: projetId });
      console.log('📝 selectedProjet mis à jour:', this.selectedProjet);
      this.loadAllTaches();
    } else {
      console.log('⚠️ Aucun projet sélectionné, vidage des tâches');
      this.selectedProjet = null;
      this.planificationForm.patchValue({ projetId: null });
      this.taches = [];
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
        return 'badge-progress';
      case StatutTache.Terminee:
        return 'badge-done';
      case StatutTache.Annulee:
        return 'badge-todo';
      default:
        return 'badge-todo';
    }
  }

  getPriorityClass(priorite: PrioriteTache): string {
    switch (priorite) {
      case PrioriteTache.Faible:
        return 'priority-low';
      case PrioriteTache.Moyenne:
        return 'priority-medium';
      case PrioriteTache.Elevee:
        return 'priority-high';
      default:
        return 'priority-basic';
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
    console.log('❌ Annulation de l\'édition');
    this.isEditMode = false;
    this.editingPlanification = null;
    this.resetForm();
    this.toastrService.info('Édition annulée', 'Information');
  }

  deletePlanification(planification: Planification) {
    if (planification.id && confirm('Êtes-vous sûr de vouloir supprimer cette planification ?')) {
      console.log('🗑️ Suppression de la planification:', planification.id);
      
      this.planificationService.deletePlanification(planification.id).subscribe({
        next: () => {
          console.log('✅ Planification supprimée');
          this.toastrService.success('Planification supprimée', 'Succès');
          this.loadPlanificationsByDate();
        },
        error: (error) => {
          console.error('❌ Erreur lors de la suppression:', error);
          console.log('🛠️ API non disponible, suppression locale...');
          
          // Suppression locale
          const index = this.planifications.findIndex(p => p.id === planification.id);
          if (index !== -1) {
            this.planifications.splice(index, 1);
            this.toastrService.success('Planification supprimée localement', 'Succès');
          }
        }
      });
    }
  }

  updateStatut(planification: Planification, nouvelEtat: EtatListe) {
    if (planification.id) {
      console.log('🔄 Mise à jour du statut via API:', planification.id, 'vers', nouvelEtat);
      
      this.planificationService.updateStatut(planification.id, nouvelEtat).subscribe({
        next: (planificationMiseAJour) => {
          console.log('✅ Statut mis à jour dans la BD:', planificationMiseAJour);
          
          // Mise à jour locale après confirmation de l'API
          const index = this.planifications.findIndex(p => p.id === planification.id);
          if (index !== -1) {
            this.planifications[index].listeId = nouvelEtat;
          }
          
          this.toastrService.success(
            `Tâche déplacée vers ${this.getEtatLabel(nouvelEtat)} et sauvegardée`,
            'Succès'
          );
        },
        error: (error) => {
          console.error('❌ Erreur lors de la mise à jour du statut:', error);
          console.log('🛠️ API non disponible, mise à jour locale seulement...');
          
          // Fallback: mise à jour locale si l'API n'est pas disponible
          const index = this.planifications.findIndex(p => p.id === planification.id);
          if (index !== -1) {
            this.planifications[index].listeId = nouvelEtat;
            this.toastrService.warning(
              `Tâche déplacée localement vers ${this.getEtatLabel(nouvelEtat)} (API non disponible)`,
              'Attention'
            );
          } else {
            this.toastrService.danger('Erreur lors de la mise à jour du statut', 'Erreur');
          }
        }
      });
    } else {
      this.toastrService.warning('Impossible de mettre à jour : ID manquant', 'Attention');
    }
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
    this.loading = true;
    this.projetService.getProjets().subscribe({
      next: (projets) => {
        this.projets = projets;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des projets:', error);
        this.toastrService.danger(
          'Impossible de charger les projets',
          'Erreur'
        );
        this.loading = false;
      }
    });
  }

  loadAllTaches() {
    this.loading = true;
    console.log('🔍 Chargement de toutes les tâches disponibles...');
    
    this.tacheService.getTaches().subscribe({
      next: (taches) => {
        console.log('✅ Toutes les tâches reçues:', taches);
        this.taches = taches;
        console.log('📋 Tâches assignées au composant:', this.taches);
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement des tâches:', error);
        console.log('🛠️ API des tâches non disponible');
        
        // Pas de données mock, liste vide
        this.taches = [];
        this.loading = false;
        
        this.toastrService.warning(
          'API des tâches non disponible',
          'Attention'
        );
      }
    });
  }

  loadTachesProjet(projetId: number) {
    this.loadAllTaches();
  }

  private loadAllTachesAndFilter(projetId: number) {
    this.loadAllTaches();
  }

  
  loadPlanificationsByDate() {
    if (this.selectedDate) {
      this.loading = true;
      
      // Correction du problème de fuseau horaire
      const year = this.selectedDate.getFullYear();
      const month = String(this.selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(this.selectedDate.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      
      console.log('🔍 Chargement des planifications pour la date:', dateStr);
      console.log('📅 Date sélectionnée complète:', this.selectedDate);
      console.log('🌐 URL d\'appel:', `${this.planificationService['apiUrl']}/date/${dateStr}`);
      
      this.planificationService.getPlanificationsByDate(dateStr).subscribe({
        next: (planifications) => {
          console.log('✅ Planifications reçues:', planifications);
          console.log('📊 Nombre de planifications:', planifications.length);
          
          // Logs détaillés de chaque planification
          planifications.forEach((p, index) => {
            console.log(`📝 Planification ${index + 1}:`, {
              id: p.id,
              date: p.date,
              listeId: p.listeId,
              tache: p.tache,
              projet: p.projet,
              heureDebut: p.heureDebut,
              heureFin: p.heureFin
            });
          });
          
          this.planifications = planifications;
          this.loading = false;
          
          if (planifications.length > 0) {
            this.toastrService.success(
              `${planifications.length} planification(s) trouvée(s)`,
              'Succès'
            );
          }
        },
        error: (error) => {
          console.error('❌ Erreur lors du chargement des planifications:', error);
          console.log('🔍 Détails de l\'erreur:', {
            status: error.status,
            statusText: error.statusText,
            message: error.message,
            url: error.url
          });
          
          this.planifications = [];
          this.loading = false;
          
          this.toastrService.danger(
            'Erreur lors du chargement des planifications',
            'Erreur'
          );
        }
      });
    } else {
      console.log('⚠️ Aucune date sélectionnée');
    }
  }

  onDateChange(date: Date) {
    this.selectedDate = date;
    this.planificationForm.patchValue({ date });
    this.loadPlanificationsByDate();
  }

  onSubmit() {
    this.planificationForm.patchValue({
      projetId: this.selectedProjet,
      tacheId: this.selectedTache,
      date: this.selectedDate,
      heureDebut: this.heureDebut,
      heureFin: this.heureFin,
      description: this.description
    });

    console.log('📋 État du formulaire avant soumission:', {
      formValid: this.planificationForm.valid,
      formValue: this.planificationForm.value,
      selectedTache: this.selectedTache,
      selectedProjet: this.selectedProjet,
      isEditMode: this.isEditMode,
      editingPlanification: this.editingPlanification,
      formErrors: this.getFormErrors()
    });

    if (this.planificationForm.valid && this.selectedTache && this.selectedProjet) {
      if (this.heureDebut >= this.heureFin) {
        this.toastrService.warning('L\'heure de fin doit être postérieure à l\'heure de début', 'Attention');
        return;
      }

      // Correction du problème de fuseau horaire
      const year = this.selectedDate.getFullYear();
      const month = String(this.selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(this.selectedDate.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      if (this.isEditMode && this.editingPlanification?.id) {
        // Mode édition - mise à jour
        this.updatePlanification(this.editingPlanification.id, dateStr);
      } else {
        // Mode création - nouvelle planification
        this.createPlanification(dateStr);
      }
    } else {
      this.toastrService.warning('Veuillez remplir tous les champs requis', 'Attention');
      console.log('⚠️ Formulaire invalide:', {
        formValid: this.planificationForm.valid,
        selectedTache: this.selectedTache,
        selectedProjet: this.selectedProjet
      });
    }
  }

  private createPlanification(dateStr: string) {
    const planificationData: CreatePlanificationDto = {
      date: dateStr,
      heureDebut: this.heureDebut,
      heureFin: this.heureFin,
      description: this.description || '',
      tacheId: this.selectedTache!,
      projetId: this.selectedProjet!,
      listeId: EtatListe.Todo
    };

    console.log('📤 Création d\'une nouvelle planification:', planificationData);

    this.planificationService.createPlanification(planificationData).subscribe({
      next: (planification) => {
        console.log('✅ Planification créée:', planification);
        this.toastrService.success('Planification créée avec succès', 'Succès');
        this.loadPlanificationsByDate();
        this.resetForm();
      },
      error: (error) => {
        console.error('❌ Erreur lors de la création:', error);
        
        const tacheSelected = this.taches.find(t => t.id === this.selectedTache);
        const projetSelected = this.projets.find(p => p.id === this.selectedProjet);
        
        const newPlanification: Planification = {
          id: Date.now(),
          date: planificationData.date,
          heureDebut: planificationData.heureDebut,
          heureFin: planificationData.heureFin,
          description: planificationData.description,
          tacheId: planificationData.tacheId,
          projetId: planificationData.projetId,
          listeId: planificationData.listeId,
          tache: tacheSelected,
          projet: projetSelected
        };
        
        this.planifications.push(newPlanification);
        
        this.toastrService.success('Planification ajoutée localement', 'Succès');
        this.resetForm();
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
    this.heureDebut = '08:00';
    this.heureFin = '09:00';
    this.description = '';
    this.selectedTache = null;
    this.selectedProjet = null;
    this.taches = [];
    this.isEditMode = false;
    this.editingPlanification = null;
  }

  getFormErrors() {
    let formErrors: any = {};
    Object.keys(this.planificationForm.controls).forEach(key => {
      const controlErrors = this.planificationForm.get(key)?.errors;
      if (controlErrors) {
        formErrors[key] = controlErrors;
      }
    });
    return formErrors;
  }

  // Méthode pour charger les utilisateurs
  loadUtilisateurs() {
    this.utilisateurService.getUtilisateurs().subscribe({
      next: (utilisateurs) => {
        this.utilisateurs = utilisateurs;
        console.log('👥 Utilisateurs chargés:', this.utilisateurs);
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement des utilisateurs:', error);
      }
    });
  }

  // Méthode pour récupérer l'utilisateur assigné à une tâche
  getAssignedUser(assigneId: number): Utilisateur | null {
    if (!assigneId || !this.utilisateurs.length) {
      return null;
    }
    return this.utilisateurs.find(user => user.id === assigneId) || null;
  }

  // Méthode pour générer les initiales de l'utilisateur
  getUserInitials(user: Utilisateur): string {
    if (!user) return '?';
    const prenom = user.prenom || '';
    const nom = user.nom || '';
    return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
  }

  // Méthode pour obtenir une couleur basée sur l'utilisateur
  getUserColor(userId: number): string {
    const colors = [
      '#3366ff', '#00d68f', '#ffaa00', '#ff3d71', 
      '#00f5ff', '#a100ff', '#ff9800', '#4caf50',
      '#9c27b0', '#2196f3', '#ff5722', '#607d8b'
    ];
    return colors[userId % colors.length];
  }
} 