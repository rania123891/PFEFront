import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { NbDialogService, NbDialogRef, NbMenuService } from '@nebular/theme';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { ListeDialogComponent } from '../liste-dialog/liste-dialog.component';

// Importer les interfaces depuis le service API
import { Liste, Tache, StatutTache, PrioriteTache } from '../../services/api.service';

type ViewType = 'liste' | 'tableau' | 'calendrier' | 'chronologie' | 'approbations' | 'formulaires' | 'pages' | 'pieces-jointes';

@Component({
  selector: 'ngx-vue-tableau',
  template: `
    <div class="vue-tableau-container">
      <!-- Barre de recherche et actions -->
      <div class="tableau-header d-flex justify-content-between align-items-center mb-4">
        <div class="search-box">
          <nb-form-field>
            <nb-icon nbPrefix icon="search-outline"></nb-icon>
            <input type="text" 
                   nbInput 
                   [(ngModel)]="searchTerm"
                   (ngModelChange)="onSearch()"
                   placeholder="Rechercher...">
          </nb-form-field>
        </div>

        <div class="actions d-flex align-items-center">
          <button nbButton ghost class="mr-2" (click)="partager()">
            <nb-icon icon="share-outline"></nb-icon>
            Partager
          </button>
          <button nbButton ghost class="mr-2" (click)="filtrer()">
            <nb-icon icon="funnel-outline"></nb-icon>
            Filtrer
          </button>
          <button nbButton ghost class="mr-2" (click)="personnaliser()">
            <nb-icon icon="options-2-outline"></nb-icon>
            Personnaliser
          </button>
          <button nbButton ghost [nbContextMenu]="menuItems">
            <nb-icon icon="more-horizontal-outline"></nb-icon>
          </button>
        </div>
      </div>

      <div class="main-content">
        <button nbButton status="primary" class="mb-4" (click)="ajouterListe()">
          <nb-icon icon="plus-outline"></nb-icon>
          Ajouter une liste
        </button>

        <div class="lists-container">
          <div *ngFor="let liste of listesFiltrees" class="liste-box mb-4">
            <div class="list-header d-flex justify-content-between align-items-center mb-3">
              <h6 class="mb-0">{{ liste.nom }}</h6>
              <button nbButton ghost size="small" [nbContextMenu]="listeMenuItems">
                <nb-icon icon="more-horizontal-outline"></nb-icon>
              </button>
            </div>

            <div class="tasks-container">
              <div *ngFor="let tache of liste.taches" class="task-item">
                <div class="task-content">
                  <div class="task-header">
                    <span class="reference">{{ tache.reference }}</span>
                    <span class="date">{{ tache.dateCreation | date:'shortDate' }}</span>
                  </div>
                  <div class="task-title">{{ tache.titre }}</div>
                </div>
              </div>
            </div>

            <button nbButton ghost class="add-task-btn mt-3" (click)="ajouterTache(liste)">
              <nb-icon icon="plus-outline"></nb-icon>
              Ajouter une tâche
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Templates de dialogue -->
    <ng-template #dialogListe>
      <nb-card>
        <nb-card-header class="d-flex justify-content-between align-items-center">
          <h5 class="mb-0">{{ selectedListe ? 'Modifier la liste' : 'Nouvelle Liste' }}</h5>
          <button nbButton ghost size="small" (click)="annulerListe()">
            <nb-icon icon="close-outline"></nb-icon>
          </button>
        </nb-card-header>
        <nb-card-body>
          <form [formGroup]="listeForm" (ngSubmit)="onListeSubmit()">
            <div class="form-group mb-3">
              <label for="nom" class="label required">Nom de la liste</label>
              <input nbInput 
                     fullWidth 
                     id="nom" 
                     formControlName="nom" 
                     placeholder="Entrez le nom de la liste"
                     [status]="listeForm.get('nom').touched && listeForm.get('nom').invalid ? 'danger' : 'basic'">
              <span class="caption status-danger" *ngIf="listeForm.get('nom').touched && listeForm.get('nom').invalid">
                Le nom de la liste est requis
              </span>
            </div>
          </form>
        </nb-card-body>
        <nb-card-footer class="d-flex justify-content-end gap-2">
          <button nbButton status="basic" (click)="annulerListe()">
            Annuler
          </button>
          <button nbButton 
                  status="primary" 
                  (click)="onListeSubmit()" 
                  [disabled]="!listeForm.valid">
            {{ selectedListe ? 'Enregistrer' : 'Créer' }}
          </button>
        </nb-card-footer>
      </nb-card>
    </ng-template>

    <ng-template #dialogTache>
      <nb-card>
        <nb-card-header>{{ selectedTache ? 'Modifier la tâche' : 'Nouvelle Tâche' }}</nb-card-header>
        <nb-card-body>
          <form [formGroup]="tacheForm" (ngSubmit)="onTacheSubmit()">
            <div class="form-group mb-3">
              <label for="titre" class="label">Titre</label>
              <input nbInput fullWidth id="titre" formControlName="titre" placeholder="Titre de la tâche">
            </div>
            <div class="form-group mb-3">
              <label for="description" class="label">Description</label>
              <textarea nbInput fullWidth id="description" formControlName="description" placeholder="Description"></textarea>
            </div>
            <div class="form-group mb-3">
              <label for="priorite" class="label">Priorité</label>
              <nb-select fullWidth formControlName="priorite">
                <nb-option value="Faible">Faible</nb-option>
                <nb-option value="Moyenne">Moyenne</nb-option>
                <nb-option value="Elevee">Élevée</nb-option>
              </nb-select>
            </div>
            <div class="form-group mb-3">
              <label for="dateEcheance" class="label">Date d'échéance</label>
              <input nbInput fullWidth formControlName="dateEcheance" [nbDatepicker]="datepicker">
              <nb-datepicker #datepicker></nb-datepicker>
            </div>
          </form>
        </nb-card-body>
        <nb-card-footer class="d-flex justify-content-end">
          <button nbButton status="basic" (click)="annulerTache()">Annuler</button>
          <button nbButton status="primary" (click)="onTacheSubmit()" [disabled]="!tacheForm.valid" class="ms-2">
            {{ selectedTache ? 'Modifier' : 'Créer' }}
          </button>
        </nb-card-footer>
      </nb-card>
    </ng-template>
  `,
  styles: [`
    .vue-tableau-container {
      height: 100%;
      background-color: #f5f6fa;
      padding: 2rem;
    }

    .main-content {
      width: 100%;
      overflow-x: auto;
      padding: 1rem;
    }

    .lists-container {
      display: flex;
      flex-direction: row;
      gap: 1rem;
      padding-bottom: 1rem;
      min-height: calc(100vh - 200px);
    }

    .liste-box {
      background: white;
      border-radius: 0.5rem;
      padding: 1.5rem;
      min-width: 350px;
      width: 400px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      height: fit-content;
    }

    .task-item {
      background: #f8f9fa;
      border-radius: 0.375rem;
      padding: 1rem;
      margin-bottom: 0.75rem;
      border: 1px solid #edf1f7;
      transition: all 0.2s ease;

      &:hover {
        background: #fff;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
      }
    }

    .task-content {
      width: 100%;
    }

    .task-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.5rem;
      font-size: 0.875rem;
      color: #8f9bb3;
    }

    .task-title {
      font-weight: 500;
      color: #222b45;
    }

    .add-task-btn {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #8f9bb3;
      padding: 0.75rem;
      border-radius: 0.375rem;
      
      &:hover {
        color: #3366ff;
        background: #f7f9fc;
      }
    }

    .add-list-btn {
      margin-bottom: 1rem;
      margin-left: 1rem;
    }

    .mt-3 {
      margin-top: 1rem;
    }

    .mb-4 {
      margin-bottom: 1.5rem;
    }

    .vue-tableau-container {
      height: 100%;
      background-color: #f5f6fa;
      display: flex;
      flex-direction: column;
    }

    .tableau-header {
      background: white;
      padding: 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #edf1f7;
    }

    .search-box {
      width: 300px;

      nb-form-field {
        width: 100%;
      }
    }

    .actions {
      display: flex;
      gap: 1rem;

      button {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.875rem;
      }
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: calc(100% - 4rem);
      text-align: center;

      .empty-icon {
        font-size: 3rem;
        color: #8f9bb3;
        margin-bottom: 1rem;
      }

      h3 {
        margin: 0;
        color: #222b45;
        font-size: 1.25rem;
        margin-bottom: 0.5rem;
      }

      p {
        color: #8f9bb3;
        margin-bottom: 1.5rem;
      }
    }

    .mr-2 {
      margin-right: 0.5rem;
    }
    .mr-3 {
      margin-right: 1rem;
    }
    .mb-2 {
      margin-bottom: 0.5rem;
    }
    .mb-3 {
      margin-bottom: 1rem;
    }
    .carte {
      background: white;
      border-radius: 0.25rem;
      padding: 0.75rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
  `]
})
export class VueTableauComponent implements OnInit {
  @ViewChild('dialogListe') dialogListe: TemplateRef<any>;
  @ViewChild('dialogTache') dialogTache: TemplateRef<any>;
  
  listes: Liste[] = [];
  searchTerm: string = '';
  searchTerm$ = new Subject<string>();
  projetNom: string = '';
  tableauId: number;
  projetId: number;

  listeForm: FormGroup;
  tacheForm: FormGroup;
  selectedListe: Liste;
  selectedTache: Tache;

  listeActions = [
    { title: 'Renommer', icon: 'edit-outline' },
    { title: 'Supprimer', icon: 'trash-2-outline' }
  ];

  tacheActions = [
    { title: 'Modifier', icon: 'edit-outline' },
    { title: 'Supprimer', icon: 'trash-2-outline' }
  ];

  currentView: string = 'liste';

  dialogRef: NbDialogRef<any>;

  listesFiltrees: Liste[] = [];

  navigation = [
    { id: 'liste', label: 'Liste', icon: 'list-outline', route: './liste' },
    { id: 'tableau', label: 'Tableau', icon: 'grid-outline', route: './board' },
    { id: 'calendrier', label: 'Calendrier', icon: 'calendar-outline', route: './calendar' },
    { id: 'chronologie', label: 'Chronologie', icon: 'clock-outline', route: './timeline' },
    { id: 'approbations', label: 'Approbations', icon: 'checkmark-square-outline', route: './approvals' },
    { id: 'formulaires', label: 'Formulaires', icon: 'file-text-outline', route: './forms' },
    { id: 'pages', label: 'Pages', icon: 'file-outline', route: './pages' },
    { id: 'pieces-jointes', label: 'Pièces jointes', icon: 'attach-outline', route: './attachments' }
  ];

  menuItems = [
    { title: 'Paramètres du tableau' },
    { title: 'Exporter' },
    { title: 'Archiver' }
  ];

  listeMenuItems = [
    { title: 'Modifier' },
    { title: 'Archiver' },
    { title: 'Supprimer' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private dialogService: NbDialogService,
    private menuService: NbMenuService,
    private fb: FormBuilder
  ) {
    this.listeForm = this.fb.group({
      nom: ['', Validators.required]
    });

    this.tacheForm = this.fb.group({
      titre: ['', Validators.required],
      description: [''],
      priorite: ['Moyenne'],
      dateEcheance: [null]
    });

    // Surveiller les changements de route pour mettre à jour la vue active
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        const segments = event.url.split('/');
        const lastSegment = segments[segments.length - 1];
        const view = this.navigation.find(nav => nav.route.includes(lastSegment));
        if (view) {
          this.currentView = view.id;
        }
      }
    });

    // Gérer les actions du menu contextuel
    this.menuService.onItemClick()
      .subscribe((event) => {
        if (!event.tag) return;

        const tag = event.tag as any;
        const action = event.item.title;

        if (action === 'Modifier' || action === 'Renommer') {
          if ('taches' in tag) {
            this.modifierListe(tag as Liste);
          } else {
            this.modifierTache(tag as Tache);
          }
        } else if (action === 'Supprimer') {
          if ('taches' in tag) {
            this.supprimerListe(tag as Liste);
          } else {
            this.supprimerTache(tag as Tache);
          }
        }
      });
  }

  ngOnInit() {
    // Récupérer les paramètres de l'URL en remontant l'arbre des routes
    this.route.parent.parent.params.subscribe(params => {
      if (params['id']) {
        this.projetId = +params['id'];
        console.log('projetId récupéré:', this.projetId);
      }
    });

    this.route.parent.params.subscribe(params => {
      if (params['tableauId']) {
        this.tableauId = +params['tableauId'];
        console.log('tableauId récupéré:', this.tableauId);
        // Charger les listes immédiatement après avoir récupéré le tableauId
        this.chargerListes();
      }
    });

    // Ajouter un observateur pour le terme de recherche
    this.searchTerm$.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.filtrerListes();
    });
  }

  chargerListes() {
    console.log('Chargement des listes pour le tableau:', this.tableauId);
    this.apiService.getListesByTableauId(this.tableauId).subscribe({
      next: (listes: Liste[]) => {
        console.log('Listes reçues:', listes);
        this.listes = listes;
        this.listesFiltrees = [...listes];

        // Pour chaque liste, charger ses tâches
        if (this.listes && this.listes.length > 0) {
          this.listes.forEach(liste => {
            if (liste && liste.id) {
              console.log(`Chargement des tâches pour la liste ${liste.id}`);
              this.apiService.getTachesByListeId(liste.id).subscribe({
                next: (taches) => {
                  console.log(`Tâches reçues pour la liste ${liste.id}:`, taches);
                  liste.taches = taches || [];
                },
                error: (error) => {
                  console.error(`Erreur lors du chargement des tâches pour la liste ${liste.id}:`, error);
                  liste.taches = [];
                }
              });
            }
          });
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement des listes:', error);
        this.listes = [];
        this.listesFiltrees = [];
      }
    });
  }

  filtrerListes() {
    if (!this.searchTerm.trim()) {
      this.listesFiltrees = [...this.listes];
    } else {
      const searchTermLower = this.searchTerm.toLowerCase().trim();
      this.listesFiltrees = this.listes.filter(liste => 
        liste.nom.toLowerCase().includes(searchTermLower) ||
        liste.reference?.toLowerCase().includes(searchTermLower)
      );
    }
  }

  ajouterListe() {
    this.dialogRef = this.dialogService.open(this.dialogListe, {
      context: {},
      closeOnBackdropClick: true,
      closeOnEsc: true,
      hasBackdrop: true,
      hasScroll: false,
      autoFocus: true
    });
  }

  onListeSubmit(): void {
    if (!this.listeForm.valid) {
      return;
    }

    const nouvelleListe: Partial<Liste> = {
      nom: this.listeForm.get('nom')?.value,
      projetId: this.projetId,
      tableauId: this.tableauId,
      position: this.listes.length,
      taches: []
    };

    console.log('Création de la liste:', nouvelleListe);

    this.apiService.createListe(nouvelleListe as Liste).subscribe({
      next: (liste) => {
        console.log('Liste créée avec succès:', liste);
        this.listes.push(liste);
        this.listeForm.reset();
        this.dialogRef?.close();
      },
      error: (error) => {
        console.error('Erreur lors de la création de la liste:', error);
      }
    });
  }

  ajouterTache(liste: Liste) {
    this.selectedListe = liste;
    this.dialogRef = this.dialogService.open(this.dialogTache, {
      context: {},
      closeOnBackdropClick: false,
      closeOnEsc: false
    });

    this.dialogRef.onClose.subscribe(() => {
      this.tacheForm.reset({
        priorite: 'Moyenne'
      });
    });
  }

  onTacheSubmit() {
    if (this.tacheForm.valid && this.selectedListe && this.projetId) {
      const dateEcheance = this.tacheForm.value.dateEcheance ? 
        new Date(this.tacheForm.value.dateEcheance) : 
        new Date();
      dateEcheance.setHours(23, 59, 59);

      if (this.selectedTache) {
        // Mode modification
        const tacheModifiee: Partial<Tache> = {
          id: this.selectedTache.id,
          titre: this.tacheForm.value.titre,
          description: this.tacheForm.value.description || '',
          statut: this.selectedTache.statut,
          priorite: this.tacheForm.value.priorite === 'Faible' ? PrioriteTache.Faible :
                   this.tacheForm.value.priorite === 'Moyenne' ? PrioriteTache.Moyenne :
                   PrioriteTache.Elevee,
          dateEcheance: dateEcheance,
          projetId: this.projetId,
          listeId: this.selectedListe.id,
          assigneId: this.selectedTache.assigneId,
          dateCreation: this.selectedTache.dateCreation,
        };

        console.log('Données de la tâche à mettre à jour:', tacheModifiee);

        this.apiService.updateTache(this.selectedTache.id, tacheModifiee).subscribe({
          next: (data: any) => {
            // Mettre à jour la tâche dans la liste
            const liste = this.listes.find(l => l.id === this.selectedListe.id);
            if (liste) {
              const index = liste.taches.findIndex(t => t.id === this.selectedTache.id);
              if (index !== -1) {
                // Si pas de données retournées (204), utiliser tacheModifiee
                liste.taches[index] = data || {
                  ...this.selectedTache,
                  ...tacheModifiee
                };
              }
            }
            this.dialogRef?.close();
            this.selectedTache = null;
            this.selectedListe = null;
            this.tacheForm.reset({ priorite: 'Moyenne' });
          },
          error: (error) => {
            console.error('Erreur lors de la modification de la tâche:', error);
          },
          complete: () => {
            // S'assurer que le dialogue se ferme même si pas de données retournées
            this.dialogRef?.close();
            this.selectedTache = null;
            this.selectedListe = null;
            this.tacheForm.reset({ priorite: 'Moyenne' });
          }
        });
      } else {
        // Mode création
        const tacheData: Partial<Tache> = {
          titre: this.tacheForm.value.titre,
          description: this.tacheForm.value.description || '',
          statut: StatutTache.EnCours,
          priorite: this.tacheForm.value.priorite === 'Faible' ? PrioriteTache.Faible :
                   this.tacheForm.value.priorite === 'Moyenne' ? PrioriteTache.Moyenne :
                   PrioriteTache.Elevee,
          dateEcheance: dateEcheance,
          projetId: this.projetId,
          listeId: this.selectedListe.id,
          assigneId: 0
        };

        tacheData.dateCreation = new Date();
        
        this.apiService.createTache(tacheData).subscribe({
          next: (data: Tache) => {
            if (!this.selectedListe.taches) {
              this.selectedListe.taches = [];
            }
            this.selectedListe.taches.push(data);
            this.dialogRef?.close();
            this.tacheForm.reset({ priorite: 'Moyenne' });
          },
          error: (error) => {
            console.error('Erreur lors de la création de la tâche:', error);
          }
        });
      }
    } else {
      console.error('Formulaire invalide ou données manquantes:', {
        formValid: this.tacheForm.valid,
        selectedListe: !!this.selectedListe,
        projetId: this.projetId
      });
    }
  }

  annulerListe() {
    this.dialogRef?.close();
    this.listeForm.reset();
  }

  annulerTache() {
    this.dialogRef?.close();
    this.tacheForm.reset({
      priorite: 'Moyenne'
    });
  }

  getPrioriteStatus(priorite: string): string {
    switch (priorite) {
      case 'Faible': return 'info';
      case 'Moyenne': return 'warning';
      case 'Elevee': return 'danger';
      default: return 'basic';
    }
  }

  drop(event: any) {
    // TODO: Implement drag and drop
  }

  setView(view: ViewType) {
    this.currentView = view;
  }

  getCurrentViewLabel(): string {
    const view = this.navigation.find(nav => nav.id === this.currentView);
    return view ? view.label.toLowerCase() : '';
  }

  getTags(liste: Liste): string[] {
    // Exemple de tags - à adapter selon votre logique métier
    return ['réussite-client', 'support-client'];
  }

  modifierListe(liste: Liste) {
    this.selectedListe = liste;
    this.listeForm.patchValue({
      nom: liste.nom
    });

    this.dialogRef = this.dialogService.open(this.dialogListe, {
      context: { mode: 'edit' },
      closeOnBackdropClick: false,
      closeOnEsc: false
    });

    this.dialogRef.onClose.subscribe(() => {
      this.selectedListe = null;
      this.listeForm.reset();
    });
  }

  supprimerListe(liste: Liste) {
    if (confirm(`Êtes-vous sûr de vouloir supprimer la liste "${liste.nom}" ?`)) {
      this.apiService.supprimerListe(liste.id).subscribe({
        next: () => {
          this.listes = this.listes.filter(l => l.id !== liste.id);
          this.listesFiltrees = this.listesFiltrees.filter(l => l.id !== liste.id);
        },
        error: (error) => {
          console.error('Erreur lors de la suppression de la liste:', error);
        }
      });
    }
  }

  modifierTache(tache: Tache) {
    this.selectedTache = tache;
    // Trouver la liste qui contient cette tâche
    this.selectedListe = this.listes.find(liste => liste.id === tache.listeId);
    
    this.tacheForm.patchValue({
      titre: tache.titre,
      description: tache.description,
      priorite: tache.priorite === PrioriteTache.Faible ? 'Faible' :
                tache.priorite === PrioriteTache.Moyenne ? 'Moyenne' : 'Elevee',
      dateEcheance: new Date(tache.dateEcheance)
    });
    
    this.dialogRef = this.dialogService.open(this.dialogTache, {
      context: {
        title: 'Modifier la tâche'
      }
    });

    this.dialogRef.onClose.subscribe(() => {
      this.selectedTache = null;
      this.selectedListe = null;
      this.tacheForm.reset({
        priorite: 'Moyenne'
      });
    });
  }

  supprimerTache(tache: Tache) {
    if (confirm(`Êtes-vous sûr de vouloir supprimer la tâche "${tache.titre}" ?`)) {
      this.apiService.deleteTache(tache.id).subscribe(
        () => {
          const liste = this.listes.find(l => l.id === tache.listeId);
          if (liste) {
            liste.taches = liste.taches.filter(t => t.id !== tache.id);
          }
          this.filtrerListes();
        },
        error => {
          console.error('Erreur lors de la suppression de la tâche:', error);
        }
      );
    }
  }

  onSearch() {
    // Implémenter la recherche
  }

  partager() {
    // Implémenter le partage
  }

  filtrer() {
    // Implémenter le filtrage
  }

  personnaliser() {
    // Implémenter la personnalisation
  }
} 