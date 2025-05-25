import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MembreEquipeService, MembreEquipe, RoleMembreEquipe } from '../../../services/membre-equipe.service';
import { EquipeService } from '../../../services/equipe.service';
import { UtilisateurService, Utilisateur } from '../../../services/utilisateur.service';
import { NbToastrService } from '@nebular/theme';

@Component({
  selector: 'ngx-membres-equipe',
  templateUrl: './membres-equipe.component.html',
  styleUrls: ['./membres-equipe.component.scss']
})
export class MembresEquipeComponent implements OnInit {
  membres: MembreEquipe[] = [];
  equipes: any[] = [];
  utilisateurs: Utilisateur[] = [];
  isLoading = false;
  showAddForm = false;
  membreForm: FormGroup;
  selectedEquipeId: number | null = null;
  roleMembreEquipe = RoleMembreEquipe;

  constructor(
    private membreEquipeService: MembreEquipeService,
    private equipeService: EquipeService,
    private utilisateurService: UtilisateurService,
    private fb: FormBuilder,
    private toastrService: NbToastrService
  ) {
    this.membreForm = this.fb.group({
      utilisateurId: ['', Validators.required],
      role: [RoleMembreEquipe.Membre, Validators.required],
      equipeId: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadEquipes();
    this.loadUtilisateurs();
  }

  loadUtilisateurs(): void {
    this.utilisateurService.getUtilisateurs().subscribe({
      next: (data) => {
        this.utilisateurs = data;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des utilisateurs:', error);
        this.toastrService.danger(
          'Impossible de charger les utilisateurs',
          'Erreur'
        );
      }
    });
  }

  loadAllMembres(): void {
    this.isLoading = true;
    this.membreEquipeService.getMembres().subscribe({
      next: (data) => {
        this.membres = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des membres:', error);
        this.toastrService.danger(
          'Impossible de charger les membres',
          'Erreur'
        );
        this.isLoading = false;
      }
    });
  }

  loadEquipes(): void {
    this.equipeService.getEquipes().subscribe({
      next: (data) => {
        console.log('Équipes chargées:', data);
        this.equipes = data;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des équipes:', error);
        this.toastrService.danger(
          'Impossible de charger les équipes',
          'Erreur'
        );
      }
    });
  }

  loadMembres(equipeId: number): void {
    console.log('loadMembres appelé avec equipeId:', equipeId);
    this.isLoading = true;
    this.selectedEquipeId = equipeId;
    console.log('selectedEquipeId dans loadMembres:', this.selectedEquipeId);
    this.membreEquipeService.getMembresEquipe(equipeId).subscribe({
      next: (data) => {
        this.membres = data;
        this.isLoading = false;
        console.log('Membres chargés, selectedEquipeId:', this.selectedEquipeId);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des membres:', error);
        this.toastrService.danger(
          'Impossible de charger les membres',
          'Erreur'
        );
        this.isLoading = false;
      }
    });
  }

  onEquipeChange(event: any): void {
    console.log('Équipe sélectionnée:', event);
    const equipeId = event;
    if (equipeId) {
      this.selectedEquipeId = equipeId;
      console.log('selectedEquipeId mis à jour:', this.selectedEquipeId);
      this.loadMembres(equipeId);
    } else {
      this.loadAllMembres();
      this.selectedEquipeId = null;
    }
  }

  openAddForm(): void {
    if (!this.selectedEquipeId) {
      this.toastrService.warning(
        'Veuillez sélectionner une équipe d\'abord',
        'Attention'
      );
      return;
    }
    
    console.log('Ouverture du formulaire d\'ajout');
    this.showAddForm = true;
    this.membreForm.patchValue({
      equipeId: this.selectedEquipeId,
      role: RoleMembreEquipe.Membre,
      utilisateurId: null
    });
  }

  cancelForm(): void {
    console.log('Fermeture du formulaire');
    this.showAddForm = false;
    this.membreForm.reset({
      role: RoleMembreEquipe.Membre,
      utilisateurId: null,
      equipeId: this.selectedEquipeId
    });
  }

  onSubmit(): void {
    if (this.membreForm.valid && this.selectedEquipeId) {
      const membreData: MembreEquipe = {
        utilisateurId: this.membreForm.value.utilisateurId,
        role: this.membreForm.value.role,
        equipeId: this.selectedEquipeId,
        dateAjout: new Date()
      };

      console.log('Données envoyées:', membreData);
      this.membreEquipeService.ajouterMembre(this.selectedEquipeId, membreData).subscribe({
        next: () => {
          this.toastrService.success('Membre ajouté avec succès', 'Succès');
          this.loadMembres(this.selectedEquipeId!);
          this.cancelForm();
        },
        error: (error) => {
          console.error('Erreur lors de l\'ajout du membre:', error);
          this.toastrService.danger(
            'Impossible d\'ajouter le membre',
            'Erreur'
          );
        }
      });
    }
  }

  onDelete(membreId: number): void {
    if (confirm('Êtes-vous sûr de vouloir retirer ce membre de l\'équipe ?') && this.selectedEquipeId) {
      this.membreEquipeService.supprimerMembre(this.selectedEquipeId, membreId).subscribe({
        next: () => {
          this.membres = this.membres.filter(m => m.id !== membreId);
          this.toastrService.success('Membre retiré avec succès', 'Succès');
        },
        error: (error) => {
          console.error('Erreur lors de la suppression du membre:', error);
          this.toastrService.danger(
            'Impossible de retirer le membre',
            'Erreur'
          );
        }
      });
    }
  }

  getRoleLabel(role: RoleMembreEquipe): string {
    return this.membreEquipeService.getRoleLabel(role);
  }
} 