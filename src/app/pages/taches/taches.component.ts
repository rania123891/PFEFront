import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TacheService, Tache, PrioriteTache } from '../../services/tache.service';
import { NbToastrService, NbDialogService } from '@nebular/theme';

@Component({
  selector: 'ngx-taches',
  templateUrl: './taches.component.html',
  styleUrls: ['./taches.component.scss']
})
export class TachesComponent implements OnInit {
  taches: Tache[] = [];
  loading = false;
  showForm = false;
  tacheForm: FormGroup;
  PrioriteTache = PrioriteTache; // Pour utiliser l'enum dans le template

  constructor(
    private tacheService: TacheService,
    private toastrService: NbToastrService,
    private dialogService: NbDialogService,
    private formBuilder: FormBuilder
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.loadTaches();
  }

  private initForm(): void {
    this.tacheForm = this.formBuilder.group({
      titre: ['', Validators.required],
      priorite: [PrioriteTache.Faible, Validators.required]
    });
  }

  loadTaches(): void {
    this.loading = true;
    this.tacheService.getTaches().subscribe({
      next: (data) => {
        this.taches = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des tâches:', error);
        this.toastrService.danger(
          'Impossible de charger les tâches',
          'Erreur'
        );
        this.loading = false;
      }
    });
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

  openAddForm(): void {
    this.showForm = true;
  }

  fermerFormulaire(): void {
    this.showForm = false;
    this.tacheForm.reset({
      priorite: PrioriteTache.Faible
    });
  }

  onSubmit(): void {
    if (this.tacheForm.valid) {
      this.loading = true;
      const nouvelleTache: Tache = {
        ...this.tacheForm.value,
        id: 0 // La base de données générera l'ID réel
      };

      this.tacheService.createTache(nouvelleTache).subscribe({
        next: () => {
          this.toastrService.success('Tâche ajoutée avec succès', 'Succès');
          this.fermerFormulaire();
          this.loadTaches();
        },
        error: (error) => {
          console.error('Erreur lors de la création de la tâche:', error);
          this.toastrService.danger(
            'Une erreur est survenue lors de l\'ajout de la tâche',
            'Erreur'
          );
          this.loading = false;
        }
      });
    }
  }

  editTache(tache: Tache): void {
    // À implémenter : Ouvrir le formulaire de modification
    this.toastrService.info(
      'La fonctionnalité de modification sera bientôt disponible',
      'Info'
    );
  }

  deleteTache(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
      this.tacheService.deleteTache(id).subscribe({
        next: () => {
          this.toastrService.success('Tâche supprimée avec succès', 'Succès');
          this.loadTaches();
        },
        error: (error) => {
          console.error('Erreur lors de la suppression de la tâche:', error);
          this.toastrService.danger(
            'Une erreur est survenue lors de la suppression',
            'Erreur'
          );
        }
      });
    }
  }
} 