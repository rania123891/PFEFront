import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { ProjetService, Projet, StatutProjet } from '../../services/projet.service';
import { NbDialogService, NbDialogRef, NbToastrService } from '@nebular/theme';
import { DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'ngx-projets',
  templateUrl: './projets.component.html',
  styleUrls: ['./projets.component.scss'],
  providers: [DatePipe]
})
export class ProjetsComponent implements OnInit {
  projets: Projet[] = [];
  isLoading = false;
  isSubmitting = false;
  searchQuery = '';
  sortField = 'dateDebut';
  sortDirection = 'desc';
  projetForm: FormGroup;
  editedProjet: Projet | null = null;
  dialogRef: NbDialogRef<any> | null = null;
  statutProjet = StatutProjet;
  showAddForm = false;
  showEditForm = false;

  @ViewChild('projetFormModal') projetFormModal: TemplateRef<any>;

  constructor(
    private projetService: ProjetService,
    private dialogService: NbDialogService,
    private datePipe: DatePipe,
    private fb: FormBuilder,
    private toastrService: NbToastrService
  ) {
    this.initForm();
  }

  ngOnInit() {
    this.loadProjets();
  }

  initForm() {
    this.projetForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required]],
      statut: [StatutProjet.EnCours, Validators.required],
      dateDebut: [new Date(), Validators.required],
      dateEcheance: [new Date(), Validators.required],
      duree: [{ value: 0, disabled: true }],
      createurId: [1]
    });

    this.projetForm.get('dateDebut').valueChanges.subscribe(() => {
      this.calculateDuree();
    });

    this.projetForm.get('dateEcheance').valueChanges.subscribe(() => {
      this.calculateDuree();
    });
  }

  calculateDuree() {
    const dateDebut = this.projetForm.get('dateDebut').value;
    const dateEcheance = this.projetForm.get('dateEcheance').value;
    
    if (dateDebut && dateEcheance) {
      const debut = new Date(dateDebut);
      const fin = new Date(dateEcheance);
      const diffTime = Math.abs(fin.getTime() - debut.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      this.projetForm.patchValue({ duree: diffDays }, { emitEvent: false });
    }
  }

  openAddForm() {
    this.showAddForm = true;
    this.showEditForm = false;
    this.initForm();
  }

  openEditForm(projet: Projet) {
    this.editedProjet = projet;
    this.showEditForm = true;
    this.showAddForm = false;
    this.projetForm.patchValue({
      nom: projet.nom,
      description: projet.description,
      statut: projet.statut,
      dateDebut: new Date(projet.dateDebut),
      dateEcheance: new Date(projet.dateEcheance),
      createurId: projet.createurId
    });
  }

  cancelForm() {
    this.showAddForm = false;
    this.showEditForm = false;
    this.editedProjet = null;
    this.initForm();
  }

  onSubmit() {
    if (this.projetForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      const formValue = this.projetForm.getRawValue();
      
      // Formatage des dates au format UTC sans millisecondes
      const dateDebut = new Date(formValue.dateDebut);
      const dateEcheance = new Date(formValue.dateEcheance);
      
      const projetData = {
        id: this.editedProjet?.id,
        nom: formValue.nom,
        description: formValue.description || '',
        statut: formValue.statut,
        dateDebut: dateDebut.toISOString(),
        dateEcheance: dateEcheance.toISOString(),
        duree: formValue.duree,
        createurId: formValue.createurId || 1
      };

      const operation = this.editedProjet
        ? this.projetService.updateProjet(this.editedProjet.id, projetData)
        : this.projetService.createProjet(projetData);

      operation.pipe(
        catchError(error => {
          console.error('Erreur détaillée:', error);
          console.error('Corps de la réponse:', error.error);
          let errorMessage = 'Une erreur est survenue lors de la création du projet';
          
          if (error.status === 0) {
            errorMessage = 'Impossible de contacter le serveur. Vérifiez que le backend est en cours d\'exécution.';
          } else if (error.status === 400) {
            errorMessage = 'Les données du projet sont invalides. Vérifiez les champs requis.';
            if (error.error && error.error.errors) {
              console.error('Erreurs de validation:', error.error.errors);
              const errors = error.error.errors;
              Object.keys(errors).forEach(key => {
                this.toastrService.danger(errors[key].join(', '), `Erreur: ${key}`);
              });
            }
          } else if (error.status === 500) {
            errorMessage = 'Une erreur serveur est survenue. Veuillez réessayer plus tard.';
          }
          
          this.toastrService.danger(errorMessage, 'Erreur');
          return of(null);
        }),
        finalize(() => {
          this.isSubmitting = false;
        })
      ).subscribe(response => {
        if (response) {
          this.toastrService.success(
            this.editedProjet ? 'Projet mis à jour avec succès' : 'Projet créé avec succès',
            'Succès'
          );
          this.loadProjets();
          this.cancelForm();
        }
      });
    } else {
      Object.keys(this.projetForm.controls).forEach(key => {
        const control = this.projetForm.get(key);
        if (control.invalid) {
          control.markAsTouched();
          console.error(`Champ invalide: ${key}`, control.errors);
        }
      });
    }
  }

  loadProjets() {
    this.isLoading = true;
    this.projetService.getProjets().subscribe({
      next: (data) => {
        this.projets = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des projets:', error);
        this.toastrService.danger(
          'Impossible de charger les projets',
          'Erreur'
        );
        this.isLoading = false;
      }
    });
  }

  onDelete(id: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) {
      this.projetService.deleteProjet(id).subscribe({
        next: () => {
          this.projets = this.projets.filter(p => p.id !== id);
          this.toastrService.success('Projet supprimé avec succès', 'Succès');
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          this.toastrService.danger(
            'Erreur lors de la suppression du projet',
            'Erreur'
          );
        }
      });
    }
  }

  getStatutLabel(statut: StatutProjet): string {
    return this.projetService.getStatutLabel(statut);
  }

  getStatutClass(statut: StatutProjet): string {
    switch (statut) {
      case StatutProjet.EnCours:
        return 'status-info';
      case StatutProjet.Termine:
        return 'status-success';
      case StatutProjet.Annule:
        return 'status-danger';
      default:
        return '';
    }
  }

  formatDate(date: Date): string {
    return this.datePipe.transform(date, 'dd/MM/yyyy') || '';
  }
} 