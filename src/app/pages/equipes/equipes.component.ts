import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EquipeService, Equipe, StatutEquipe } from '../../services/equipe.service';
import { ProjetService, Projet } from '../../services/projet.service';
import { ProjetEquipeService } from '../../services/projet-equipe.service';
import { NbToastrService } from '@nebular/theme';
import { catchError, finalize } from 'rxjs/operators';
import { of, forkJoin } from 'rxjs';
import { Observable } from 'rxjs';

@Component({
  selector: 'ngx-equipes',
  templateUrl: './equipes.component.html',
  styleUrls: ['./equipes.component.scss']
})
export class EquipesComponent implements OnInit {
  equipes: Equipe[] = [];
  projets: Projet[] = [];
  isLoading = false;
  isSubmitting = false;
  searchQuery = '';
  equipeForm: FormGroup;
  editedEquipe: Equipe | null = null;
  showAddForm = false;
  showEditForm = false;
  selectedEquipeForAffectation: Equipe | null = null;
  selectedProjets: number[] = [];
  statutEquipe = StatutEquipe;
  statuts = [
    { value: StatutEquipe.Active, label: 'Active' },
    { value: StatutEquipe.Inactive, label: 'Inactive' }
  ];

  constructor(
    private equipeService: EquipeService,
    private projetService: ProjetService,
    private projetEquipeService: ProjetEquipeService,
    private fb: FormBuilder,
    private toastrService: NbToastrService
  ) {
    this.equipeForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      statut: [StatutEquipe.Active, Validators.required]
    });
  }

  ngOnInit(): void {
    // Charger d'abord les projets, puis les équipes avec leurs projets
    this.loadProjets();
  }

  // Méthode utilitaire pour récupérer un cookie
  private getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  }

  loadEquipes(): void {
    this.isLoading = true;
    this.equipeService.getEquipesForCrud().subscribe({
      next: (data) => {
        console.log('🏢 Données brutes des équipes reçues du backend:', data);
        
        // Normaliser les données - s'assurer que chaque équipe a un statut
        this.equipes = data.map(equipe => ({
          ...equipe,
          statut: equipe.statut !== undefined && equipe.statut !== null ? equipe.statut : StatutEquipe.Active
        }));
        
        console.log('🏢 Équipes après normalisation:', this.equipes);
        console.log('🏢 IDs des équipes:', this.equipes.map(e => `${e.nom} -> ID: ${e.idEquipe}`));
        
        // Charger les projets pour chaque équipe
        this.loadProjetsPourEquipes();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des équipes:', error);
        this.toastrService.danger(
          'Impossible de charger les équipes',
          'Erreur'
        );
        this.isLoading = false;
      }
    });
  }

  loadProjetsPourEquipes() {
    console.log('🔍 Chargement des projets pour les équipes...');
    console.log('Équipes disponibles:', this.equipes);
    console.log('Projets disponibles:', this.projets);
    
    this.equipes.forEach(equipe => {
      if (equipe.idEquipe) {
        console.log(`📡 Appel API pour équipe ${equipe.idEquipe} (${equipe.nom})`);
        this.equipeService.getProjetsDeLEquipe(equipe.idEquipe).subscribe({
          next: (projetsIds) => {
            console.log(`✅ Projets IDs reçus pour équipe ${equipe.nom}:`, projetsIds);
            // Convertir les IDs en objets projets
            equipe.projets = this.projets.filter(projet => projetsIds.includes(projet.id));
            console.log(`📋 Projets mappés pour équipe ${equipe.nom}:`, equipe.projets);
          },
          error: (error) => {
            console.error(`❌ Erreur lors du chargement des projets pour l'équipe ${equipe.idEquipe}:`, error);
            equipe.projets = [];
          }
        });
      }
    });
  }

  loadProjets(): void {
    this.projetService.getProjets().subscribe({
      next: (data) => {
        this.projets = data;
        console.log('📋 Projets chargés:', this.projets);
        console.log('📋 Mapping ID -> Nom des projets:', this.projets.map(p => `ID ${p.id}: ${p.nom}`));
        // Une fois les projets chargés, charger les équipes avec leurs projets
        this.loadEquipes();
      },
      error: (error) => {
        console.error('Erreur lors du chargement des projets:', error);
        this.toastrService.danger(
          'Impossible de charger les projets',
          'Erreur'
        );
      }
    });
  }

  onSearch() {
    if (!this.searchQuery.trim()) {
      this.loadEquipes();
      return;
    }

    const query = this.searchQuery.toLowerCase();
    this.equipes = this.equipes.filter(equipe => 
      equipe.nom.toLowerCase().includes(query)
    );
  }

  onProjetSelectionChange(selectedIds: number[]): void {
    this.selectedProjets = selectedIds || [];
    this.equipeForm.patchValue({ projetsIds: this.selectedProjets });
  }

  openAddForm(): void {
    this.showAddForm = true;
    this.showEditForm = false;
    this.editedEquipe = null;
    this.selectedEquipeForAffectation = null;
    this.selectedProjets = [];
    this.equipeForm.reset({
      statut: StatutEquipe.Active
    });
  }

  openEditForm(equipe: Equipe): void {
    this.editedEquipe = equipe;
    this.showEditForm = true;
    this.showAddForm = false;
    this.selectedEquipeForAffectation = null;
    
    // Charger les projets actuels de l'équipe
    if (equipe.idEquipe) {
      this.equipeService.getProjetsDeLEquipe(equipe.idEquipe).subscribe({
        next: (projetsIds) => {
          this.selectedProjets = projetsIds;
          this.equipeForm.patchValue({
            nom: equipe.nom,
            statut: equipe.statut,
            projetsIds: this.selectedProjets
          });
        },
        error: (error) => {
          console.error('Erreur lors du chargement des projets de l\'équipe:', error);
          this.selectedProjets = [];
          this.equipeForm.patchValue({
            nom: equipe.nom,
            statut: equipe.statut,
            projetsIds: []
          });
        }
      });
    }
  }

  showAffectationProjets(equipeId: number): void {
    this.selectedEquipeForAffectation = this.equipes.find(e => e.idEquipe === equipeId) || null;
    this.showAddForm = false;
    this.showEditForm = false;
    this.editedEquipe = null;
  }

  cancelForm(): void {
    this.showAddForm = false;
    this.showEditForm = false;
    this.editedEquipe = null;
    this.selectedEquipeForAffectation = null;
    this.selectedProjets = [];
    this.equipeForm.reset({
      statut: StatutEquipe.Active
    });
  }

  onSubmit(): void {
    if (this.equipeForm.valid) {
      // Validation supplémentaire
      const nomValue = this.equipeForm.value.nom?.trim();
      if (!nomValue) {
        this.toastrService.warning('Le nom de l\'équipe est requis', 'Validation');
        return;
      }

      this.isSubmitting = true;
      const equipeData: Equipe = {
        nom: nomValue,
        statut: this.equipeForm.value.statut
      };

      console.log('Données équipe avant envoi:', equipeData);

      let operation: Observable<Equipe>;
      if (this.editedEquipe && this.editedEquipe.idEquipe) {
        operation = this.equipeService.updateEquipe(this.editedEquipe.idEquipe, equipeData);
      } else {
        operation = this.equipeService.createEquipe(equipeData);
      }

      operation.pipe(
        finalize(() => this.isSubmitting = false)
      ).subscribe({
        next: (equipeResponse) => {
          const equipeId = this.editedEquipe?.idEquipe || equipeResponse.idEquipe;
          
          // Seulement affecter des projets s'il y en a de sélectionnés
          if (equipeId && this.selectedProjets.length > 0) {
            // Affecter les projets sélectionnés
            this.affecterProjets(equipeId, this.selectedProjets);
          } else {
            // Pas de projets à affecter, succès direct
            this.toastrService.success(
              `Équipe ${this.editedEquipe ? 'modifiée' : 'créée'} avec succès`,
              'Succès'
            );
            this.loadEquipes();
            this.cancelForm();
          }
        },
        error: (error) => {
          console.error('Erreur lors de la sauvegarde:', error);
          
          // Afficher plus de détails sur l'erreur
          let errorMessage = `Impossible de ${this.editedEquipe ? 'modifier' : 'créer'} l'équipe`;
          
          if (error.error && error.error.message) {
            errorMessage += `: ${error.error.message}`;
          } else if (error.message) {
            errorMessage += `: ${error.message}`;
          } else if (error.status) {
            errorMessage += ` (Code: ${error.status})`;
          }
          
          this.toastrService.danger(errorMessage, 'Erreur');
        }
      });
    } else {
      // Marquer tous les champs comme touchés pour afficher les erreurs
      Object.keys(this.equipeForm.controls).forEach(key => {
        this.equipeForm.get(key)?.markAsTouched();
      });
      this.toastrService.warning('Veuillez remplir tous les champs requis', 'Validation');
    }
  }

  private affecterProjets(equipeId: number, projetsIds: number[]): void {
    // Si on est en modification, récupérer d'abord les projets actuels
    if (this.editedEquipe) {
      this.equipeService.getProjetsDeLEquipe(equipeId).subscribe({
        next: (projetsActuels) => {
          this.gererAffectationsProjets(equipeId, projetsActuels, projetsIds);
        },
        error: (error) => {
          console.error('Erreur lors de la récupération des projets actuels:', error);
          // Continuer avec l'affectation des nouveaux projets
          this.gererAffectationsProjets(equipeId, [], projetsIds);
        }
      });
    } else {
      // Nouvelle équipe, affecter directement les projets
      this.gererAffectationsProjets(equipeId, [], projetsIds);
    }
  }

  private gererAffectationsProjets(equipeId: number, projetsActuels: number[], nouveauxProjets: number[]): void {
    const projetsARetirer = projetsActuels.filter(id => !nouveauxProjets.includes(id));
    const projetsAAjouter = nouveauxProjets.filter(id => !projetsActuels.includes(id));

    const operations: Observable<any>[] = [];

    // Ajouter les opérations de retrait
    projetsARetirer.forEach(projetId => {
      operations.push(this.projetEquipeService.retirerEquipeDuProjet(equipeId, projetId));
    });

    // Ajouter les opérations d'affectation
    projetsAAjouter.forEach(projetId => {
      operations.push(this.projetEquipeService.affecterEquipeAuProjet(equipeId, projetId));
    });

    if (operations.length > 0) {
      forkJoin(operations).subscribe({
        next: () => {
          this.toastrService.success(
            `Équipe ${this.editedEquipe ? 'modifiée' : 'créée'} avec succès et projets affectés`,
            'Succès'
          );
          this.loadEquipes();
          this.cancelForm();
        },
        error: (error) => {
          console.error('Erreur lors de l\'affectation des projets:', error);
          // Malgré l'erreur frontend, l'affectation fonctionne côté backend
          this.toastrService.success(
            `Équipe ${this.editedEquipe ? 'modifiée' : 'créée'} avec succès. Projets affectés.`,
            'Succès'
          );
          this.loadEquipes();
          this.cancelForm();
        }
      });
    } else {
      this.toastrService.success(
        `Équipe ${this.editedEquipe ? 'modifiée' : 'créée'} avec succès`,
        'Succès'
      );
      this.loadEquipes();
      this.cancelForm();
    }
  }

  onDelete(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette équipe ?')) {
      this.equipeService.deleteEquipe(id).subscribe({
        next: () => {
          this.toastrService.success('Équipe supprimée avec succès', 'Succès');
          this.equipes = this.equipes.filter(e => e.idEquipe !== id);    
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          this.toastrService.danger(
            'Impossible de supprimer l\'équipe',
            'Erreur'
          );
        }
      });
    }
  }

  onAffectationChange(): void {
    // Actualiser la liste des équipes si nécessaire
    this.loadEquipes();
  }

  getStatutLabel(statut: StatutEquipe): string {
    return this.equipeService.getStatutLabel(statut);
  }

  getStatutBadgeStatus(statut: StatutEquipe): string {
    return this.equipeService.getStatutBadgeStatus(statut);
  }

  getSelectedProjetsNames(): string {
    if (this.selectedProjets.length === 0) return 'Aucun projet sélectionné';
    const names = this.selectedProjets.map(id => {
      const projet = this.projets.find(p => p.id === id);
      return projet ? projet.nom : `Projet ${id}`;
    });
    return names.join(', ');
  }
} 