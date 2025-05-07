import { Liste } from './liste.model';

export interface Tableau {
  id: number;
  nom: string;
  description?: string;
  projetId: number;
  position?: number;
  dateCreation?: string;
  dateModification?: string;
  listes: Liste[];
}

export interface Tache {
  id: number;
  titre: string;
  description?: string;
  type?: 'task' | 'bug' | 'feature';
  priorite?: 'low' | 'medium' | 'high';
  etiquettes?: string[];
  assignedTo?: string;
  estimation?: number;
  dateEcheance?: Date;
  dateCreation: Date;
  tempsPasseEnHeures: number;
  fichiers?: File[];
  commentaires?: Commentaire[];
}

export interface Commentaire {
  id: number;
  tacheId: number;
  texte: string;
  auteur: string;
  avatar?: string;
  date: Date;
} 