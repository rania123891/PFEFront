import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EquipeService, Equipe, StatutEquipe, Domaine } from '../../services/equipe.service';
import { ProjetService } from '../../services/projet.service';
import { NbToastrService } from '@nebular/theme';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { Observable } from 'rxjs';

@Component({
  selector: 'ngx-equipes',
  templateUrl: './equipes.component.html',
  styleUrls: ['./equipes.component.scss']
})
export class EquipesComponent implements OnInit {
  equipes: Equipe[] = [];
  projets: any[] = [];
  isLoading = false;
  isSubmitting = false;
  searchQuery = '';
  equipeForm: FormGroup;
  editedEquipe: Equipe | null = null;
  showAddForm = false;
  showEditForm = false;
  statutEquipe = StatutEquipe;
  domaine = Domaine;
  domaines = [
    { value: Domaine.FrontEnd, label: 'Front-End' },
    { value: Domaine.BackEnd, label: 'Back-End' },
    { value: Domaine.BaseDonnee, label: 'Base de Données' }
  ];

  constructor(
    private equipeService: EquipeService,
    private projetService: ProjetService,
    private fb: FormBuilder,
    private toastrService: NbToastrService
  ) {
    this.equipeForm = this.fb.group({
      nom: ['', Validators.required],
      statut: [StatutEquipe.Active, Validators.required],
      domaineActivite: [Domaine.FrontEnd, Validators.required],
      projetId: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadEquipes();
    this.loadProjets();
  }

  loadEquipes(): void {
    this.isLoading = true;
    this.equipeService.getEquipesForCrud().subscribe({
      next: (data) => {
        this.equipes = data;
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

  loadProjets(): void {
    this.projetService.getProjets().subscribe({
      next: (data) => {
        this.projets = data;
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

  openAddForm(): void {
    this.showAddForm = true;
    this.showEditForm = false;
    this.editedEquipe = null;
    this.equipeForm.reset({
      statut: StatutEquipe.Active,
      domaineActivite: Domaine.FrontEnd,
      projetId: null
    });
  }

  openEditForm(equipe: Equipe): void {
    this.editedEquipe = equipe;
    this.showEditForm = true;
    this.showAddForm = false;
    this.equipeForm.patchValue({
      nom: equipe.nom,
      statut: equipe.statut,
      domaineActivite: equipe.domaineActivite,
      projetId: equipe.projetId
    });
  }

  cancelForm(): void {
    this.showAddForm = false;
    this.showEditForm = false;
    this.editedEquipe = null;
    this.equipeForm.reset({
      statut: StatutEquipe.Active,
      domaineActivite: Domaine.FrontEnd,
      projetId: null
    });
  }

  onSubmit(): void {
    if (this.equipeForm.valid) {
      this.isSubmitting = true;
      const equipeData: Equipe = {
        nom: this.equipeForm.value.nom,
        statut: this.equipeForm.value.statut,
        domaineActivite: this.equipeForm.value.domaineActivite,
        projetId: this.equipeForm.value.projetId
      };

      let operation: Observable<Equipe>;
      if (this.editedEquipe && this.editedEquipe.idEquipe) {
        operation = this.equipeService.updateEquipe(this.editedEquipe.idEquipe, equipeData);
      } else {
        operation = this.equipeService.createEquipe(equipeData);
      }

      operation.pipe(
        finalize(() => this.isSubmitting = false)
      ).subscribe({
        next: (response) => {
          this.toastrService.success(
            `Équipe ${this.editedEquipe ? 'modifiée' : 'créée'} avec succès`,
            'Succès'
          );
          this.loadEquipes();
          this.cancelForm();
        },
        error: (error) => {
          console.error('Erreur lors de la sauvegarde:', error);
          this.toastrService.danger(
            `Impossible de ${this.editedEquipe ? 'modifier' : 'créer'} l'équipe`,
            'Erreur'
          );
        }
      });
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

  getStatutLabel(statut: StatutEquipe): string {
    return this.equipeService.getStatutLabel(statut);
  }

  getStatutBadgeStatus(statut: StatutEquipe): string {
    return this.equipeService.getStatutBadgeStatus(statut);
  }

  getDomaineLabel(domaine: Domaine): string {
    return this.equipeService.getDomaineLabel(domaine);
  }

  getStatutClass(statut: StatutEquipe): string {
    return this.equipeService.getStatutClass(statut);
  }
} 