export interface Liste {
  id?: number;
  nom: string;
  position: number;
  tableauId: number;
  projetId: number;
  taches?: any[];
  dateCreation?: string;
  dateModification?: string;
} 