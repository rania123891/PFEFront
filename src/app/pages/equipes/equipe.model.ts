import { RoleMembreEquipe } from '../../services/team-member.service';

export interface Utilisateur {
    id: number;
    email: string;
    nom?: string;
    prenom?: string;
}

export interface MembreEquipe {
    id: number;
    utilisateurId: number;
    utilisateur: Utilisateur;
    role: RoleMembreEquipe;
    equipeId: number;
}

export enum StatutEquipe {
    Active = 0,
    Inactive = 1
}

export enum Domaine {
    FrontEnd = 0,
    BackEnd = 1,
    BaseDonnee = 2
}

export interface Equipe {
    idEquipe?: number;
    nom: string;
    statut: StatutEquipe;
    domaineActivite: Domaine;
    projetId?: number;
    membresEquipe?: MembreEquipe[];
} 