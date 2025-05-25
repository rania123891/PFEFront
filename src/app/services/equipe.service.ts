import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

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
  projet?: any;
}

export interface TeamMember {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: string;
  avatar?: string;
  isActive: boolean;
  equipeId?: number;
}

export interface Team {
  id: number;
  nom: string;
  description: string;
  couleur: string;
  chef?: TeamMember;
  membres: TeamMember[];
  nombreProjets: number;
  nombreTaches: number;
  dateCreation?: Date;
  statut?: string;
}

export interface TeamsStats {
  totalEquipes: number;
  totalMembres: number;
  equipesActives: number;
  moyenneMembresParEquipe: number;
}

@Injectable({
  providedIn: 'root'
})
export class EquipeService {
  private apiUrl = `${environment.apis.projet}/equipes`;

  constructor(private http: HttpClient) { }

  // Méthodes pour les opérations CRUD (équipes standards)
  getEquipesForCrud(): Observable<Equipe[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map(equipes => equipes.map(equipe => {
        if (equipe.projetId && !equipe.projet) {
          // Si nous avons un projetId mais pas de projet, on fait une requête pour obtenir le projet
          this.http.get(`${environment.apis.projet}/projets/${equipe.projetId}`).subscribe(
            (projet: any) => {
              equipe.projet = projet;
            }
          );
        }
        return equipe;
      }))
    );
  }

  getEquipeForCrud(id: number): Observable<Equipe> {
    return this.http.get<Equipe>(`${this.apiUrl}/${id}`);
  }

  // Méthodes pour le dashboard (équipes avec membres détaillés)
  getEquipes(): Observable<Team[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map(equipes => this.mapToTeams(equipes)),
      catchError(error => {
        console.error('Erreur lors de la récupération des équipes:', error);
        return of(this.getMockTeams());
      })
    );
  }

  getEquipe(id: number): Observable<Team> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(equipe => this.mapToTeam(equipe)),
      catchError(error => {
        console.error(`Erreur lors de la récupération de l'équipe ${id}:`, error);
        return of(this.getMockTeams().find(t => t.id === id)!);
      })
    );
  }

  getMembresEquipe(equipeId: number): Observable<TeamMember[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${equipeId}/membres`).pipe(
      map(membres => this.mapToMembers(membres)),
      catchError(error => {
        console.error(`Erreur lors de la récupération des membres de l'équipe ${equipeId}:`, error);
        return of([]);
      })
    );
  }

  getTeamsStats(): Observable<TeamsStats> {
    return this.http.get<TeamsStats>(`${this.apiUrl}/stats`).pipe(
      catchError(error => {
        console.error('Erreur lors de la récupération des stats équipes:', error);
        return of({
          totalEquipes: 4,
          totalMembres: 12,
          equipesActives: 3,
          moyenneMembresParEquipe: 3
        });
      })
    );
  }

  private mapToTeams(apiData: any[]): Team[] {
    return apiData.map(item => this.mapToTeam(item));
  }

  private mapToTeam(apiItem: any): Team {
    return {
      id: apiItem.id,
      nom: apiItem.nom || 'Équipe sans nom',
      description: apiItem.description || 'Aucune description',
      couleur: apiItem.couleur || this.getRandomColor(),
      chef: apiItem.chef ? this.mapToMember(apiItem.chef) : undefined,
      membres: apiItem.membres ? apiItem.membres.map((m: any) => this.mapToMember(m)) : [],
      nombreProjets: apiItem.nombreProjets || 0,
      nombreTaches: apiItem.nombreTaches || 0,
      dateCreation: apiItem.dateCreation ? new Date(apiItem.dateCreation) : new Date(),
      statut: apiItem.statut || 'active'
    };
  }

  private mapToMembers(apiData: any[]): TeamMember[] {
    return apiData.map(item => this.mapToMember(item));
  }

  private mapToMember(apiItem: any): TeamMember {
    return {
      id: apiItem.id,
      nom: apiItem.nom || 'Nom',
      prenom: apiItem.prenom || 'Prénom',
      email: apiItem.email || 'email@example.com',
      role: apiItem.role || 'Membre',
      avatar: apiItem.avatar,
      isActive: apiItem.isActive !== undefined ? apiItem.isActive : true,
      equipeId: apiItem.equipeId
    };
  }

  private getRandomColor(): string {
    const colors = ['#667eea', '#4facfe', '#43e97b', '#fa709a', '#ff9a9e'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  private getMockTeams(): Team[] {
    const teamColors = ['#667eea', '#4facfe', '#43e97b', '#fa709a', '#ff9a9e'];
    
    return [
      {
        id: 1,
        nom: 'Équipe Alpha',
        description: 'Équipe de développement frontend spécialisée en Angular et React',
        couleur: teamColors[0],
        nombreProjets: 3,
        nombreTaches: 15,
        chef: {
          id: 1,
          nom: 'Dupont',
          prenom: 'Marie',
          email: 'marie.dupont@company.com',
          role: 'Lead Developer',
          isActive: true
        },
        membres: [
          {
            id: 1,
            nom: 'Dupont',
            prenom: 'Marie',
            email: 'marie.dupont@company.com',
            role: 'Lead Developer',
            isActive: true
          },
          {
            id: 2,
            nom: 'Martin',
            prenom: 'Pierre',
            email: 'pierre.martin@company.com',
            role: 'Frontend Developer',
            isActive: true
          },
          {
            id: 3,
            nom: 'Bernard',
            prenom: 'Sophie',
            email: 'sophie.bernard@company.com',
            role: 'UI/UX Designer',
            isActive: false
          }
        ]
      },
      {
        id: 2,
        nom: 'Équipe Beta',
        description: 'Équipe backend responsable des APIs et de l\'architecture serveur',
        couleur: teamColors[1],
        nombreProjets: 2,
        nombreTaches: 12,
        chef: {
          id: 4,
          nom: 'Leroy',
          prenom: 'Jean',
          email: 'jean.leroy@company.com',
          role: 'Backend Lead',
          isActive: true
        },
        membres: [
          {
            id: 4,
            nom: 'Leroy',
            prenom: 'Jean',
            email: 'jean.leroy@company.com',
            role: 'Backend Lead',
            isActive: true
          },
          {
            id: 5,
            nom: 'Moreau',
            prenom: 'Amélie',
            email: 'amelie.moreau@company.com',
            role: 'DevOps Engineer',
            isActive: true
          },
          {
            id: 6,
            nom: 'Simon',
            prenom: 'Lucas',
            email: 'lucas.simon@company.com',
            role: 'Database Admin',
            isActive: true
          },
          {
            id: 7,
            nom: 'Petit',
            prenom: 'Emma',
            email: 'emma.petit@company.com',
            role: 'API Developer',
            isActive: false
          }
        ]
      },
      {
        id: 3,
        nom: 'Équipe Gamma',
        description: 'Équipe QA et testing pour assurer la qualité des livraisons',
        couleur: teamColors[2],
        nombreProjets: 5,
        nombreTaches: 8,
        chef: {
          id: 8,
          nom: 'Roux',
          prenom: 'Thomas',
          email: 'thomas.roux@company.com',
          role: 'QA Lead',
          isActive: true
        },
        membres: [
          {
            id: 8,
            nom: 'Roux',
            prenom: 'Thomas',
            email: 'thomas.roux@company.com',
            role: 'QA Lead',
            isActive: true
          },
          {
            id: 9,
            nom: 'Blanc',
            prenom: 'Céline',
            email: 'celine.blanc@company.com',
            role: 'Test Automation',
            isActive: true
          }
        ]
      },
      {
        id: 4,
        nom: 'Équipe Delta',
        description: 'Équipe mobile pour le développement d\'applications iOS et Android',
        couleur: teamColors[3],
        nombreProjets: 1,
        nombreTaches: 6,
        chef: {
          id: 10,
          nom: 'Garnier',
          prenom: 'Maxime',
          email: 'maxime.garnier@company.com',
          role: 'Mobile Lead',
          isActive: false
        },
        membres: [
          {
            id: 10,
            nom: 'Garnier',
            prenom: 'Maxime',
            email: 'maxime.garnier@company.com',
            role: 'Mobile Lead',
            isActive: false
          },
          {
            id: 11,
            nom: 'Faure',
            prenom: 'Julie',
            email: 'julie.faure@company.com',
            role: 'iOS Developer',
            isActive: true
          },
          {
            id: 12,
            nom: 'Andre',
            prenom: 'Nicolas',
            email: 'nicolas.andre@company.com',
            role: 'Android Developer',
            isActive: true
          }
        ]
      }
    ];
  }

  createEquipe(equipe: Equipe): Observable<Equipe> {
    const equipeData = {
      nom: equipe.nom,
      statut: Number(equipe.statut),
      domaineActivite: Number(equipe.domaineActivite),
      projetId: equipe.projetId,
      entity: "Equipe"
    };

    console.log('Données de l\'équipe à envoyer:', equipeData);
    return this.http.post<Equipe>(this.apiUrl, equipeData);
  }

  updateEquipe(id: number, equipe: Equipe): Observable<Equipe> {
    const equipeData = {
      id: id,
      nom: equipe.nom,
      statut: Number(equipe.statut),
      domaineActivite: Number(equipe.domaineActivite),
      projetId: equipe.projetId,
      entity: "Equipe"
    };

    return this.http.put<Equipe>(`${this.apiUrl}/${id}`, equipeData);
  }

  deleteEquipe(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getStatutLabel(statut: StatutEquipe): string {
    switch (statut) {
      case StatutEquipe.Active:
        return 'Active';
      case StatutEquipe.Inactive:
        return 'Inactive';
      default:
        return 'Inconnu';
    }
  }

  getStatutBadgeStatus(statut: StatutEquipe): string {
    return statut === StatutEquipe.Active ? 'success' : 'danger';
  }

  getDomaineLabel(domaine: Domaine): string {
    switch (domaine) {
      case Domaine.FrontEnd:
        return 'Front-End';
      case Domaine.BackEnd:
        return 'Back-End';
      case Domaine.BaseDonnee:
        return 'Base de Données';
      default:
        return 'Inconnu';
    }
  }

  getStatutClass(statut: StatutEquipe): string {
    switch (statut) {
      case StatutEquipe.Active:
        return 'status-success';
      case StatutEquipe.Inactive:
        return 'status-danger';
      default:
        return 'status-basic';
    }
  }
} 