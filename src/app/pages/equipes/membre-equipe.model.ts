import { RoleMembreEquipe } from '../../services/team-member.service';

interface Utilisateur {
  id: number;
  email: string;
  nom?: string;
  prenom?: string;
}

export interface MembreEquipe {
  id?: number;
  utilisateurId: number;
  role: RoleMembreEquipe;
  equipeId?: number;
  utilisateur?: Utilisateur;
} 