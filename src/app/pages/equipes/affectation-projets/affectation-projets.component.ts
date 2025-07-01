import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProjetEquipeService } from '../../../services/projet-equipe.service';
import { ProjetService, Projet } from '../../../services/projet.service';
import { EquipeService, Equipe } from '../../../services/equipe.service';
import { NbToastrService } from '@nebular/theme';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'ngx-affectation-projets',
  templateUrl: './affectation-projets.component.html',
  styleUrls: ['./affectation-projets.component.scss']
})
export class AffectationProjetsComponent implements OnInit {
  @Input() equipeId: number | null = null;
  @Output() affectationChange = new EventEmitter<void>();

  affectationForm: FormGroup;
  projets: Projet[] = [];
  projetsAffeetes: number[] = [];
  projetsDisponibles: Projet[] = [];
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
      projetId: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadProjets();
    if (this.equipeId) {
      this.loadProjetsAffeetes();
    }
  }

  ngOnChanges(): void {
    if (this.equipeId) {
      this.loadProjetsAffeetes();
    }
  }

  loadProjets(): void {
    this.isLoading = true;
    this.projetService.getProjets().pipe(
      finalize(() => this.isLoading = false),
      catchError(error => {
        console.error('Erreur lors du chargement des projets:', error);
        this.toastrService.danger('Erreur lors du chargement des projets', 'Erreur');
        return of([]);
      })
    ).subscribe(projets => {
      this.projets = projets;
      this.updateProjetsDisponibles();
    });
  }

  loadProjetsAffeetes(): void {
    if (!this.equipeId) return;

    this.projetEquipeService.getProjetsDeLEquipe(this.equipeId).pipe(
      catchError(error => {
        console.error('Erreur lors du chargement des projets affectés:', error);
        return of([]);
      })
    ).subscribe(projetsIds => {
      this.projetsAffeetes = projetsIds;
      this.updateProjetsDisponibles();
    });
  }

  updateProjetsDisponibles(): void {
    this.projetsDisponibles = this.projets.filter(
      projet => !this.projetsAffeetes.includes(projet.id!)
    );
  }

  getProjetNom(projetId: number): string {
    const projet = this.projets.find(p => p.id === projetId);
    return projet ? projet.nom : `Projet ${projetId}`;
  }

  getProjetStatut(projetId: number): string {
    const projet = this.projets.find(p => p.id === projetId);
    return projet ? this.projetService.getStatutLabel(projet.statut) : 'Inconnu';
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
    if (!this.affectationForm.valid || !this.equipeId) return;

    this.isSubmitting = true;
    const projetId = this.affectationForm.value.projetId;

    this.projetEquipeService.affecterEquipeAuProjet(this.equipeId, projetId).pipe(
      finalize(() => this.isSubmitting = false)
    ).subscribe({
      next: () => {
        this.toastrService.success('Équipe affectée au projet avec succès', 'Succès');
        this.loadProjetsAffeetes();
        this.cancelForm();
        this.affectationChange.emit();
      },
      error: (error) => {
        console.error('Erreur lors de l\'affectation:', error);
        this.toastrService.danger('Erreur lors de l\'affectation de l\'équipe', 'Erreur');
      }
    });
  }

  retirerProjet(projetId: number): void {
    if (!this.equipeId) return;

    this.projetEquipeService.retirerEquipeDuProjet(this.equipeId, projetId).subscribe({
      next: () => {
        this.toastrService.success('Équipe retirée du projet avec succès', 'Succès');
        this.loadProjetsAffeetes();
        this.affectationChange.emit();
      },
      error: (error) => {
        console.error('Erreur lors du retrait:', error);
        this.toastrService.danger('Erreur lors du retrait de l\'équipe', 'Erreur');
      }
    });
  }
} 