import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';

interface ChartData {
  name: string;
  value: number;
}

@Component({
  selector: 'ngx-resume',
  templateUrl: './resume.component.html',
  styleUrls: ['./resume.component.scss']
})
export class ResumeComponent implements OnInit {
  // Données pour les statistiques
  stats = {
    termines: 0,
    misAJour: 0,
    crees: 0,
    echeanceProche: 2
  };

  // Données pour le graphique circulaire
  private _etatData = {
    labels: ['À faire', 'Test', 'Prêt pour le lancement', 'En cours', 'Lancé'],
    data: [10, 0, 4, 5, 3],
  };

  // Données pour le graphique de priorités
  private _priorityData = {
    labels: ['Highest', 'High', 'Medium', 'Low', 'Lowest'],
    data: [1, 2, 9, 6, 1],
  };

  // Données pour les types de tickets
  typeData = {
    tache: 63,
    sousTache: 37
  };

  // Propriétés calculées pour les graphiques
  get etatChartData(): ChartData[] {
    return this._etatData.labels.map((label, i) => ({
      name: label,
      value: this._etatData.data[i]
    }));
  }

  get priorityChartData(): ChartData[] {
    return this._priorityData.labels.map((label, i) => ({
      name: label,
      value: this._priorityData.data[i]
    }));
  }

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    // TODO: Appeler l'API pour récupérer les vraies données
    this.loadData();
  }

  private loadData() {
    // TODO: Implémenter les appels API pour charger les données réelles
  }
} 