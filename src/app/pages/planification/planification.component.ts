import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TacheService, Tache, PrioriteTache, StatutTache } from '../../services/tache.service';
import { ProjetService, Projet } from '../../services/projet.service';
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
  planificationForm: FormGroup;
  filterForm: FormGroup;
  loading = false;
  selectedDate: Date = new Date();
  heureDebut: string = '08:00';
  heureFin: string = '09:00';
  statuts: StatutTache[] = [StatutTache.EnCours, StatutTache.Terminee, StatutTache.Annulee];
  searchQuery: string = '';
  selectedProjet: number | null = null;
  StatutTache = StatutTache; // Pour utiliser l'enum dans le template

  constructor(
    private formBuilder: FormBuilder,
    public tacheService: TacheService,
    private projetService: ProjetService,
    private toastrService: NbToastrService,
  ) {
    this.initForm();
    this.initFilterForm();
  }

  ngOnInit() {
    this.loadProjets();
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
      projetId: [''],
      tacheId: [''],
      description: [''],
      date: [new Date()],
      heureDebut: ['08:00'],
      heureFin: ['09:00']
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
    if (projetId) {
      this.selectedProjet = projetId;
      this.loadTachesProjet(projetId);
    } else {
      this.taches = [];
    }
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
    // TODO: Implémenter l'ouverture du formulaire d'ajout
    console.log("Ouverture du formulaire d'ajout");
  }

  getTachesByStatut(statut: StatutTache): Tache[] {
    return this.taches.filter(tache => tache.statut === statut);
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

  editTask(tache: Tache) {
    console.log('Édition de la tâche:', tache);
  }

  deleteTask(tache: Tache) {
    console.log('Suppression de la tâche:', tache);
  }

  loadProjets() {
    this.loading = true;
    this.projetService.getProjets().subscribe({
      next: (projets) => {
        this.projets = projets;
        this.loading = false;
        
        // Si nous avons des projets, charger les tâches du premier projet
        if (this.projets.length > 0) {
          this.selectedProjet = this.projets[0].id;
          this.loadTachesProjet(this.projets[0].id);
        }
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

  loadTachesProjet(projetId: number) {
    this.loading = true;
    this.tacheService.getTaches().subscribe({
      next: (taches) => {
        this.taches = taches.filter(t => t.projetId === projetId);
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des tâches:', error);
        this.toastrService.danger(
          'Impossible de charger les tâches du projet',
          'Erreur'
        );
        this.loading = false;
      }
    });
  }

  onDateChange(date: Date) {
    this.selectedDate = date;
    this.planificationForm.patchValue({ date });
  }

  onSubmit() {
    if (this.planificationForm.valid) {
      console.log('Planification:', this.planificationForm.value);
      this.toastrService.success('Planification enregistrée', 'Succès');
    }
  }
} 