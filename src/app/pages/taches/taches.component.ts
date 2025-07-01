import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TacheService, Tache, PrioriteTache } from '../../services/tache.service';
import { EquipeService, Equipe } from '../../services/equipe.service';
import { ETAPredictionService, ETAResult } from '../../services/eta-prediction.service';
import { NbToastrService } from '@nebular/theme';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'ngx-taches',
  templateUrl: './taches.component.html',
  styleUrls: ['./taches.component.scss']
})
export class TachesComponent implements OnInit {
  taches: Tache[] = [];
  equipes: Equipe[] = [];
  selectedEquipeId: number | null = null;
  loading = false;
  showForm = false;
  tacheForm: FormGroup;
  PrioriteTache = PrioriteTache;
  
  // 🤖 Prédiction IA
  predictionIA: ETAResult | null = null;
  loadingPrediction = false;

  constructor(
    private tacheService: TacheService,
    private toastrService: NbToastrService,
    private formBuilder: FormBuilder,
    private equipeService: EquipeService,
    private etaService: ETAPredictionService
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.loadData();
    this.loadEquipes();
    this.setupPredictionWatch();
  }

  private initForm(): void {
    this.tacheForm = this.formBuilder.group({
      titre: ['', [Validators.required, Validators.minLength(3)]],
      priorite: [PrioriteTache.Faible, Validators.required],
      equipeId: [null, Validators.required]
    });
  }

  private loadData(): void {
    this.loading = true;
    
    this.tacheService.getTaches().subscribe({
      next: (taches) => {
        this.taches = taches;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement:', error);
        this.toastrService.danger('Impossible de charger les tâches', 'Erreur');
        this.loading = false;
      }
    });
  }

  private loadEquipes(): void {
    console.log('🔄 Chargement des équipes...');
    this.equipeService.getEquipesForCrud().subscribe({
      next: (equipes) => {
        console.log('✅ Équipes reçues:', equipes);
        this.equipes = equipes;
        console.log('📋 Nombre d\'équipes chargées:', this.equipes.length);
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement des équipes:', error);
        this.toastrService.danger('Impossible de charger les équipes', 'Erreur');
        
        // ✅ Fallback local en cas d'erreur
        this.equipes = [
          { idEquipe: 1, nom: 'Équipe Alpha', statut: 0 },
          { idEquipe: 2, nom: 'Équipe Beta', statut: 0 },
          { idEquipe: 3, nom: 'Équipe Gamma', statut: 0 }
        ];
        console.log('🔄 Utilisation des données de fallback local:', this.equipes);
      }
    });
  }

  loadTaches(): void {
    this.loadData();
  }

  loadTachesByEquipe(equipeId: number): void {
    this.loading = true;
    this.selectedEquipeId = equipeId;
    
    this.tacheService.getTachesByEquipe(equipeId).subscribe({
      next: (taches) => {
        this.taches = taches;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des tâches de l\'équipe:', error);
        this.toastrService.danger('Impossible de charger les tâches de l\'équipe', 'Erreur');
        this.loading = false;
      }
    });
  }

  showAllTaches(): void {
    this.selectedEquipeId = null;
    this.loadData();
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
    this.predictionIA = null;  // 🤖 Reset prédiction
    this.tacheForm.reset({
      priorite: PrioriteTache.Faible,
      equipeId: null
    });
  }

  // 🤖 Configuration de la surveillance en temps réel des prédictions
  private setupPredictionWatch(): void {
    // Surveiller les changements du titre ET de la priorité
    this.tacheForm.get('titre')?.valueChanges.pipe(
      debounceTime(500),  // Attendre 500ms après la dernière frappe
      distinctUntilChanged()  // Uniquement si la valeur a changé
    ).subscribe(() => {
      this.calculerPrediction();
    });

    this.tacheForm.get('priorite')?.valueChanges.subscribe(() => {
      this.calculerPrediction();
    });
  }

  // 🎯 Calculer la prédiction IA en temps réel
  private calculerPrediction(): void {
    const titre = this.tacheForm.get('titre')?.value;
    const priorite = this.tacheForm.get('priorite')?.value;

    if (!titre || titre.length < 3) {
      this.predictionIA = null;
      return;
    }

    this.loadingPrediction = true;
    
    // Utiliser un projet par défaut (le premier disponible) ou permettre la sélection
    const projetParDefaut = 10; // Site Web E-commerce de nos données de test
    
    this.etaService.predireNouvelleTache(titre, priorite, projetParDefaut).subscribe({
      next: (prediction) => {
        // 🔧 Corriger le formatage de la durée côté frontend
        const predictionCorrigee = {
          ...prediction,
          dureeFormatee: this.formaterDuree(prediction.dureeEstimeeHeures)
        };
        this.predictionIA = predictionCorrigee;
        this.loadingPrediction = false;
        console.log('🤖 Prédiction IA calculée:', predictionCorrigee);
      },
      error: (error) => {
        console.error('❌ Erreur prédiction IA:', error);
        this.loadingPrediction = false;
        // En cas d'erreur, utiliser une prédiction simple basée sur des mots-clés
        this.predictionIA = this.predictionSimple(titre, priorite);
      }
    });
  }

  // 🔧 Prédiction simple de fallback basée sur des mots-clés
  private predictionSimple(titre: string, priorite: number): ETAResult {
    let heures = 4; // Base par défaut
    
    // Détection de mots-clés pour ajuster la durée
    const titreWords = titre.toLowerCase();
    
    if (titreWords.includes('bug') || titreWords.includes('corriger')) {
      heures = 2;
    } else if (titreWords.includes('interface') || titreWords.includes('admin')) {
      heures = 8;
    } else if (titreWords.includes('api') || titreWords.includes('backend')) {
      heures = 5;
    } else if (titreWords.includes('optimiser') || titreWords.includes('performance')) {
      heures = 6;
    } else if (titreWords.includes('test') || titreWords.includes('documentation')) {
      heures = 3;
    }
    
    // Ajustement selon la priorité
    if (priorite === 2) heures *= 1.3; // Priorité élevée +30%
    
    return {
      dureeEstimeeHeures: Math.round(heures * 10) / 10,
      dureeFormatee: this.formaterDuree(heures),
      confiance: "🟡 Moyenne (70%)",
      typeTache: this.detecterTypeTache(titreWords),
      facteursInfluents: this.detecterFacteurs(titreWords, priorite),
      dateEstimeeCompletion: new Date(Date.now() + heures * 60 * 60 * 1000)
    };
  }

  private detecterTypeTache(titre: string): string {
    if (titre.includes('interface') || titre.includes('page') || titre.includes('design')) {
      return '🎨 Frontend';
    }
    if (titre.includes('api') || titre.includes('backend') || titre.includes('serveur')) {
      return '🔧 Backend';
    }
    if (titre.includes('test') || titre.includes('debug') || titre.includes('corriger')) {
      return '🧪 Test/Debug';
    }
    if (titre.includes('base') || titre.includes('données') || titre.includes('crud')) {
      return '💾 Base de données';
    }
    if (titre.includes('documentation') || titre.includes('doc')) {
      return '📝 Documentation';
    }
    return '⚙️ Général';
  }

  private detecterFacteurs(titre: string, priorite: number): string[] {
    const facteurs: string[] = [];
    
    if (priorite === 2) facteurs.push('⚡ Priorité élevée (+30%)');
    if (titre.includes('interface')) facteurs.push('🎨 Interface utilisateur (+35%)');
    if (titre.includes('api')) facteurs.push('🔧 Développement API (+40%)');
    if (titre.includes('optimiser')) facteurs.push('⚡ Optimisation (+50%)');
    if (titre.includes('admin')) facteurs.push('⚖️ Complexité élevée (+50%)');
    if (titre.includes('bug')) facteurs.push('🔧 Correction rapide (+10%)');
    
    return facteurs;
  }

  // 🎨 Méthode pour obtenir la couleur de confiance
  getConfidenceColor(confiance: string): string {
    return this.etaService.getConfidenceColor(confiance);
  }

  // 🔧 Formater correctement la durée en heures et minutes
  private formaterDuree(heures: number): string {
    if (heures >= 1) {
      // 1 heure ou plus : afficher en heures
      const h = Math.floor(heures);
      const minutes = Math.round((heures - h) * 60);
      
      if (minutes === 0) {
        return `${h}h`;
      } else {
        return `${h}h${minutes}min`;
      }
    } else {
      // Moins d'1 heure : afficher en minutes
      const minutes = Math.round(heures * 60);
      return minutes > 0 ? `${minutes}min` : '1min'; // Minimum 1 minute
    }
  }

  onSubmit(): void {
    if (this.tacheForm.valid) {
      this.loading = true;
      const formValue = this.tacheForm.value;
      
      // ✅ Récupérer l'équipe sélectionnée
      const equipeSelectionne = this.equipes.find(e => e.idEquipe === formValue.equipeId);
      
      const nouvelleTache: Tache = {
        ...formValue,
        id: 0,
        equipe: equipeSelectionne ? {
          idEquipe: equipeSelectionne.idEquipe,
          nom: equipeSelectionne.nom
        } : null
      };

      console.log('Tâche à créer avec équipe:', nouvelleTache);

      this.tacheService.createTache(nouvelleTache).subscribe({
        next: () => {
          this.toastrService.success('Tâche créée avec succès!', 'Succès');
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