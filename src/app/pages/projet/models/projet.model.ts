import { StatutProjet } from './statut-projet.enum';
import { Tableau } from './tableau.model';

export interface Projet {
  id?: number;
  nom: string;
  description: string;
  statut: StatutProjet;
  dateDebut: string;
  dateEcheance: string;
  duree: number;
  responsableId?: number;
  createurId: number;
  dateCreation?: string;
  dateModification?: string;
  tableaux?: Tableau[];
  equipes?: any[];
  taches?: any[];
} 