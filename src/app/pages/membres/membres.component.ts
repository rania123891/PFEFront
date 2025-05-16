import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NbToastrService } from '@nebular/theme';

interface Membre {
  id: number;
  nom: string;
  prenom: string;
  photo?: string;
  equipe: string;
  role: string;
  dateAjout: Date;
}

interface Equipe {
  id: number;
  nom: string;
}

@Component({
  selector: 'ngx-membres',
  templateUrl: './membres.component.html',
  styleUrls: ['./membres.component.scss']
})
export class MembresComponent implements OnInit {
  membres: Membre[] = [];
  teams: Equipe[] = [];
  selectedTeam: number | null = null;
  loading = false;
  showForm = false;
  membreForm: FormGroup;

  constructor(
    private toastrService: NbToastrService,
    private formBuilder: FormBuilder
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.loadTeams();
    this.loadMembres();
  }

  private initForm(): void {
    this.membreForm = this.formBuilder.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      equipe: ['', Validators.required],
      role: ['', Validators.required],
    });
  }

  loadTeams(): void {
    // Simuler le chargement des équipes
    this.teams = [
      { id: 1, nom: 'Équipe de développement' },
      { id: 2, nom: 'Équipe de design' },
      { id: 3, nom: 'Équipe de test' }
    ];
  }

  loadMembres(): void {
    this.loading = true;
    // Simuler le chargement des membres
    setTimeout(() => {
      this.membres = [
        {
          id: 1,
          nom: 'Dupont',
          prenom: 'Jean',
          equipe: 'Équipe de développement',
          role: 'Admin',
          dateAjout: new Date('2024-01-15')
        },
        {
          id: 2,
          nom: 'Martin',
          prenom: 'Sophie',
          equipe: 'Équipe de design',
          role: 'Manager',
          dateAjout: new Date('2024-02-01')
        },
        // Ajoutez d'autres membres de test ici
      ];
      this.loading = false;
    }, 1000);
  }

  getRoleClass(role: string): string {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'role-admin';
      case 'manager':
        return 'role-manager';
      case 'member':
        return 'role-member';
      default:
        return 'role-member';
    }
  }

  onTeamChange(): void {
    // Implémenter le filtrage par équipe
    console.log('Équipe sélectionnée:', this.selectedTeam);
    this.loadMembres(); // Recharger les membres avec le filtre
  }

  openAddForm(): void {
    this.showForm = true;
    this.initForm();
  }

  editMembre(membre: Membre): void {
    // Implémenter l'édition d'un membre
    this.toastrService.info(
      'La fonctionnalité de modification sera bientôt disponible',
      'Info'
    );
  }

  deleteMembre(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce membre ?')) {
      // Implémenter la suppression d'un membre
      this.toastrService.success('Membre supprimé avec succès', 'Succès');
      this.loadMembres();
    }
  }
} 