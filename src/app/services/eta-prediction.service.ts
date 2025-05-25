import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ETAResult {
  dureeEstimeeHeures: number;
  dureeFormatee: string;
  confiance: string;
  typeTache: string;
  facteursInfluents: string[];
  dateEstimeeCompletion: Date;
}

export interface PredictionRequest {
  tacheId: number;
  projetId: number;
}

export interface NouvelleTacheRequest {
  titre: string;
  priorite: number; // 0=Faible, 1=Moyenne, 2=Elevee
  projetId: number;
}

export interface ETAStats {
  stats: string;
}

export interface TrainingResult {
  success: boolean;
  message: string;
  stats: string;
}

@Injectable({
  providedIn: 'root'
})
export class ETAPredictionService {
  private apiUrl = `${environment.apis.projet}/eta`;

  constructor(private http: HttpClient) { }

  /**
   * 🎯 Prédire la durée d'une tâche existante
   */
  predireDureeTache(tacheId: number, projetId: number): Observable<ETAResult> {
    const request: PredictionRequest = { tacheId, projetId };
    return this.http.post<ETAResult>(`${this.apiUrl}/predict`, request);
  }

  /**
   * 🎯 Prédire la durée d'une nouvelle tâche (avant création)
   */
  predireNouvelleTache(titre: string, priorite: number, projetId: number): Observable<ETAResult> {
    const request: NouvelleTacheRequest = { titre, priorite, projetId };
    return this.http.post<ETAResult>(`${this.apiUrl}/predict-new`, request);
  }

  /**
   * 🎓 Entraîner le modèle IA
   */
  entrainerModele(): Observable<TrainingResult> {
    return this.http.post<TrainingResult>(`${this.apiUrl}/train`, {});
  }

  /**
   * 📊 Obtenir les statistiques du modèle
   */
  getStatistiques(): Observable<ETAStats> {
    return this.http.get<ETAStats>(`${this.apiUrl}/stats`);
  }

  /**
   * 🔄 Prédictions multiples
   */
  predirePlusieurs(requests: PredictionRequest[]): Observable<any[]> {
    return this.http.post<any[]>(`${this.apiUrl}/predict-batch`, requests);
  }

  /**
   * 🎨 Formatter la confiance avec couleur
   */
  getConfidenceColor(confiance: string): string {
    if (confiance.includes('🟢')) return '#00d68f';
    if (confiance.includes('🟡')) return '#ffaa00';
    return '#ff3d71';
  }

  /**
   * 📈 Formatter le type de tâche avec icône
   */
  getTaskTypeIcon(typeTache: string): string {
    if (typeTache.includes('Backend')) return 'code-outline';
    if (typeTache.includes('Frontend')) return 'monitor-outline';
    if (typeTache.includes('Test')) return 'flask-outline';
    if (typeTache.includes('Documentation')) return 'file-text-outline';
    if (typeTache.includes('Base de données')) return 'database-outline';
    return 'settings-outline';
  }

  /**
   * 🕐 Calculer l'urgence basée sur l'ETA
   */
  calculateUrgency(etaResult: ETAResult): 'low' | 'medium' | 'high' {
    const heures = etaResult.dureeEstimeeHeures;
    
    if (heures <= 2) return 'low';
    if (heures <= 8) return 'medium';
    return 'high';
  }

  /**
   * 📅 Estimer la charge de travail pour une période
   */
  estimerChargeHebdomadaire(predictions: ETAResult[]): number {
    return predictions.reduce((total, pred) => total + pred.dureeEstimeeHeures, 0);
  }
} 