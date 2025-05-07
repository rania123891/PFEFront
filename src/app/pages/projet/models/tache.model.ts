export interface Tache {
  id?: number;
  titre: string;
  description?: string;
  dateLimite?: Date;
  reference?: string;
  listeId: number;
  position?: number;
  statut?: string;
} 