export enum StatutEquipe {
  Active = 'Active',
  Inactive = 'Inactive'
}

export enum Domaine {
  FrontEnd = 'FrontEnd',
  BackEnd = 'BackEnd',
  BaseDonnee = 'BaseDonnee'
}

export interface MembreEquipe {
  id: number;
  nom: string;
  role: string;
  equipeId: number;
}

export interface Equipe {
  idEquipe?: number;
  nom: string;
  statut: StatutEquipe;
  domaineActivite: Domaine;
  projetId: number;
  membresEquipe?: MembreEquipe[];
} 