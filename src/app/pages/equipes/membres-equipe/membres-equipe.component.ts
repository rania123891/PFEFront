import { Component, OnInit } from '@angular/core';
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
  selectedEquipeId: number | null = null;
  selectedUtilisateurIds: number[] = [];
  selectedRole: RoleMembreEquipe = RoleMembreEquipe.Membre;
  roleMembreEquipe = RoleMembreEquipe;

  constructor(
    private membreEquipeService: MembreEquipeService,
    private equipeService: EquipeService,
    private utilisateurService: UtilisateurService,
    private toastrService: NbToastrService
  ) {
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
    this.equipeService.getEquipesForCrud().subscribe({
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
        console.log('Membres reçus du serveur:', data);
        console.log('Premier membre (s\'il existe):', data[0]);
        
        // Si les données liées ne sont pas disponibles, les enrichir
        if (data.length > 0 && !data[0].utilisateur) {
          console.log('Données liées manquantes, enrichissement en cours...');
          this.enrichirDonneesMembres(data);
        } else {
          this.membres = data;
          this.isLoading = false;
        }
        
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

  private enrichirDonneesMembres(membres: MembreEquipe[]): void {
    // Pour chaque membre, on enrichit avec les données utilisateur et équipe
    membres.forEach(membre => {
      // Trouver l'utilisateur correspondant
      const utilisateur = this.utilisateurs.find(u => u.id === membre.utilisateurId);
      if (utilisateur) {
        membre.utilisateur = {
          id: utilisateur.id,
          email: utilisateur.email,
          nom: utilisateur.nom,
          prenom: utilisateur.prenom
        };
      }

      // Trouver l'équipe correspondante
      const equipe = this.equipes.find(e => e.idEquipe === membre.equipeId);
      if (equipe) {
        membre.equipe = {
          idEquipe: equipe.idEquipe,
          nom: equipe.nom
        };
      }
    });

    this.membres = membres;
    this.isLoading = false;
    console.log('Données enrichies:', membres);
  }

  onEquipeChange(event: any): void {
    console.log('onEquipeChange appelé avec:', event);
    console.log('Type de event:', typeof event);
    
    if (event && event !== null) {
      this.selectedEquipeId = Number(event);
      console.log('selectedEquipeId mis à jour:', this.selectedEquipeId);
      this.loadMembres(this.selectedEquipeId);
    } else {
      this.selectedEquipeId = null;
      this.membres = [];
      console.log('selectedEquipeId remis à null');
    }
  }

  onUtilisateurChange(event: any): void {
    console.log('onUtilisateurChange appelé avec:', event);
    if (event && event !== null) {
      this.selectedUtilisateurIds = Array.isArray(event) ? event.map(Number) : [Number(event)];
      console.log('selectedUtilisateurIds mis à jour:', this.selectedUtilisateurIds);
    } else {
      this.selectedUtilisateurIds = [];
      console.log('selectedUtilisateurIds remis à null');
    }
  }

  onRoleChange(event: any): void {
    console.log('onRoleChange appelé avec:', event);
    this.selectedRole = event;
    console.log('selectedRole mis à jour:', this.selectedRole);
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

  getMembreNomComplet(membre: MembreEquipe): string {
    if (membre.utilisateur) {
      const nom = membre.utilisateur.nom || '';
      const prenom = membre.utilisateur.prenom || '';
      
      if (nom && prenom) {
        return `${prenom} ${nom}`;
      } else if (nom) {
        return nom;
      } else if (prenom) {
        return prenom;
      } else if (membre.utilisateur.email) {
        return membre.utilisateur.email;
      }
    }
    
    return `Utilisateur ID: ${membre.utilisateurId}`;
  }

  getUtilisateurNomComplet(utilisateur: any): string {
    const nom = utilisateur.nom || '';
    const prenom = utilisateur.prenom || '';
    
    if (nom && prenom) {
      return `${prenom} ${nom}`;
    } else if (nom) {
      return nom;
    } else if (prenom) {
      return prenom;
    } else if (utilisateur.email) {
      return utilisateur.email;
    }
    
    return `Utilisateur ID: ${utilisateur.id}`;
  }

  getUtilisateursDisponibles(): Utilisateur[] {
    if (!this.selectedEquipeId) {
      return this.utilisateurs;
    }

    // Obtenir les IDs des utilisateurs déjà dans l'équipe
    const utilisateursDejaAffectes = this.membres.map(membre => membre.utilisateurId);
    
    // Filtrer pour retourner seulement les utilisateurs non affectés
    return this.utilisateurs.filter(utilisateur => 
      !utilisateursDejaAffectes.includes(utilisateur.id)
    );
  }

  ajouterMembres(): void {
    if (!this.selectedEquipeId || this.selectedUtilisateurIds.length === 0) {
      this.toastrService.warning(
        'Veuillez sélectionner une équipe et au moins un utilisateur',
        'Attention'
      );
      return;
    }

    // Créer un membre pour chaque utilisateur sélectionné
    const requests = this.selectedUtilisateurIds.map(utilisateurId => {
      const membreData: MembreEquipe = {
        utilisateurId,
        role: this.selectedRole,
        equipeId: this.selectedEquipeId!,
        dateAjout: new Date()
      };
      return this.membreEquipeService.ajouterMembre(this.selectedEquipeId!, membreData);
    });

    // Exécuter toutes les requêtes en parallèle
    console.log('Ajout membres - Nombre de requêtes:', requests.length);
    
    // Pour simplifier, on ajoute un par un mais on pourrait utiliser forkJoin
    let completed = 0;
    let errors = 0;

    requests.forEach((request, index) => {
      request.subscribe({
        next: () => {
          completed++;
          if (completed + errors === requests.length) {
            this.handleAddMembresComplete(completed, errors);
          }
        },
        error: (error) => {
          console.error(`Erreur lors de l'ajout du membre ${index + 1}:`, error);
          errors++;
          if (completed + errors === requests.length) {
            this.handleAddMembresComplete(completed, errors);
          }
        }
      });
    });
  }

  private handleAddMembresComplete(completed: number, errors: number): void {
    if (errors === 0) {
      this.toastrService.success(`${completed} membre(s) ajouté(s) avec succès`, 'Succès');
    } else if (completed > 0) {
      this.toastrService.warning(`${completed} membre(s) ajouté(s), ${errors} erreur(s)`, 'Partiellement réussi');
    } else {
      this.toastrService.danger('Impossible d\'ajouter les membres', 'Erreur');
    }
    
    this.loadMembres(this.selectedEquipeId!);
    this.resetSelections();
  }

  resetSelections(): void {
    this.selectedUtilisateurIds = [];
    this.selectedRole = RoleMembreEquipe.Membre;
    console.log('Sélections réinitialisées');
  }
} 