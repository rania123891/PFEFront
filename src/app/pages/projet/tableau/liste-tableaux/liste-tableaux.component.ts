import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Tableau } from '../../models/tableau.model';
import { NbToastrService } from '@nebular/theme';

@Component({
  selector: 'ngx-liste-tableaux',
  template: `
    <nb-card>
      <nb-card-header class="d-flex justify-content-between align-items-center">
        <h5>Tableaux du projet</h5>
        <button nbButton status="primary" (click)="ajouterTableau()">
          <nb-icon icon="plus-outline"></nb-icon>
          Ajouter un tableau
        </button>
      </nb-card-header>
      <nb-card-body>
        <div class="row">
          <div class="col-md-4 mb-4" *ngFor="let tableau of tableaux">
            <nb-card (click)="ouvrirTableau(tableau)" class="tableau-card">
              <nb-card-body>
                <h6>{{ tableau.nom }}</h6>
                <p class="text-muted">{{ tableau.description || 'Aucune description' }}</p>
              </nb-card-body>
            </nb-card>
          </div>
        </div>
      </nb-card-body>
    </nb-card>
  `,
  styles: [`
    .tableau-card {
      cursor: pointer;
      transition: transform 0.2s;
    }
    .tableau-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    }
    .d-flex {
      display: flex;
    }
    .justify-content-between {
      justify-content: space-between;
    }
    .align-items-center {
      align-items: center;
    }
    .mb-4 {
      margin-bottom: 1.5rem;
    }
  `]
})
export class ListeTableauxComponent implements OnInit {
  tableaux: Tableau[] = [];
  projetId: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private toastr: NbToastrService
  ) {}

  ngOnInit() {
    this.projetId = Number(this.route.snapshot.paramMap.get('id'));
    this.chargerTableaux();
  }

  chargerTableaux() {
    this.apiService.getTableauxByProjet(this.projetId).subscribe(
      (tableaux) => {
        this.tableaux = tableaux;
      },
      (error) => {
        this.toastr.danger('Erreur lors du chargement des tableaux', 'Erreur');
        console.error('Erreur:', error);
      }
    );
  }

  ajouterTableau() {
    this.router.navigate(['nouveau'], { relativeTo: this.route });
  }

  ouvrirTableau(tableau: Tableau) {
    this.router.navigate([tableau.id], { relativeTo: this.route });
  }
} 