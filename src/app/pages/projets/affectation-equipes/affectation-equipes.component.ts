import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProjetEquipeService } from '../../../services/projet-equipe.service';
import { ProjetService, Projet } from '../../../services/projet.service';
import { EquipeService, Equipe } from '../../../services/equipe.service';
import { NbToastrService } from '@nebular/theme';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'ngx-affectation-equipes',
  templateUrl: './affectation-equipes.component.html',
  styleUrls: ['./affectation-equipes.component.scss']
})
export class AffectationEquipesComponent implements OnInit {
  @Input() projetId: number | null = null;
  @Output() affectationChange = new EventEmitter<void>();

  affectationForm: FormGroup;
  equipes: Equipe[] = [];
  equipesAffectees: Equipe[] = [];
  equipesDisponibles: Equipe[] = [];
  isLoading = false;
  isSubmitting = false;
  showForm = false;

  constructor(
    private fb: FormBuilder,
    private projetEquipeService: ProjetEquipeService,
    private projetService: ProjetService,
    private equipeService: EquipeService,
    private toastrService: NbToastrService
  ) {
    this.affectationForm = this.fb.group({
      equipeId: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadEquipes();
    if (this.projetId) {
      this.loadEquipesAffectees();
    }
  }

  ngOnChanges(): void {
    if (this.projetId) {
      this.loadEquipesAffectees();
    }
  }

  loadEquipes(): void {
    this.isLoading = true;
    this.equipeService.getEquipesForCrud().pipe(
      finalize(() => this.isLoading = false),
      catchError(error => {
        console.error('Erreur lors du chargement des équipes:', error);
        this.toastrService.danger('Erreur lors du chargement des équipes', 'Erreur');
        return of([]);
      })
    ).subscribe(equipes => {
      this.equipes = equipes;
      this.updateEquipesDisponibles();
    });
  }

  loadEquipesAffectees(): void {
    if (!this.projetId) return;

    this.projetService.getEquipesDuProjet(this.projetId).pipe(
      catchError(error => {
        console.error('Erreur lors du chargement des équipes affectées:', error);
        return of([]);
      })
    ).subscribe(equipes => {
      this.equipesAffectees = equipes;
      this.updateEquipesDisponibles();
    });
  }

  updateEquipesDisponibles(): void {
    const equipesAffecteesIds = this.equipesAffectees.map(e => e.idEquipe);
    this.equipesDisponibles = this.equipes.filter(
      equipe => !equipesAffecteesIds.includes(equipe.idEquipe)
    );
  }

  getEquipeStatut(statut: number): string {
    return this.equipeService.getStatutLabel(statut);
  }

  openAffectationForm(): void {
    this.showForm = true;
    this.affectationForm.reset();
  }

  cancelForm(): void {
    this.showForm = false;
    this.affectationForm.reset();
  }

  onSubmit(): void {
    if (!this.affectationForm.valid || !this.projetId) return;

    this.isSubmitting = true;
    const equipeId = this.affectationForm.value.equipeId;

    this.projetService.affecterEquipeAuProjet(this.projetId, equipeId).pipe(
      finalize(() => this.isSubmitting = false)
    ).subscribe({
      next: () => {
        this.toastrService.success('Équipe affectée au projet avec succès', 'Succès');
        this.loadEquipesAffectees();
        this.cancelForm();
        this.affectationChange.emit();
      },
      error: (error) => {
        console.error('Erreur lors de l\'affectation:', error);
        this.toastrService.danger('Erreur lors de l\'affectation de l\'équipe', 'Erreur');
      }
    });
  }

  retirerEquipe(equipeId: number): void {
    if (!this.projetId) return;

    this.projetService.retirerEquipeDuProjet(this.projetId, equipeId).subscribe({
      next: () => {
        this.toastrService.success('Équipe retirée du projet avec succès', 'Succès');
        this.loadEquipesAffectees();
        this.affectationChange.emit();
      },
      error: (error) => {
        console.error('Erreur lors du retrait:', error);
        this.toastrService.danger('Erreur lors du retrait de l\'équipe', 'Erreur');
      }
    });
  }
} 