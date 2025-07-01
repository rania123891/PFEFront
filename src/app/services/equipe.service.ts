import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export enum StatutEquipe {
  Active = 0,
  Inactive = 1
}

export interface Equipe {
  idEquipe?: number;
  id?: number;
  nom: string;
  statut: StatutEquipe;
  projetsEquipes?: any[];
  membresEquipe?: any[];
  projets?: any[];
  taches?: any[];
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
    return this.http.get<Equipe[]>(this.apiUrl).pipe(
      map(equipes => {
        // ✅ Normalisation des données
        return equipes.map(equipe => ({
          idEquipe: equipe.idEquipe || equipe.id, // Support pour id ou idEquipe
          nom: equipe.nom || 'Équipe sans nom',
          statut: equipe.statut !== undefined ? equipe.statut : StatutEquipe.Active,
          projetsEquipes: equipe.projetsEquipes || [],
          membresEquipe: equipe.membresEquipe || [],
          projets: equipe.projets || [],
          taches: equipe.taches || []
        }));
      }),
      catchError(error => {
        console.error('Erreur lors de la récupération des équipes pour CRUD:', error);
        // ✅ Fallback avec des données de test
        return of(this.getMockEquipesForCrud());
      })
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

  // ✅ Nouvelle méthode pour les données de test au format Equipe (pour CRUD)
  private getMockEquipesForCrud(): Equipe[] {
    return [
      {
        idEquipe: 1,
        nom: 'Équipe Alpha',
        statut: StatutEquipe.Active,
        projetsEquipes: [],
        membresEquipe: [],
        projets: [],
        taches: []
      },
      {
        idEquipe: 2,
        nom: 'Équipe Beta', 
        statut: StatutEquipe.Active,
        projetsEquipes: [],
        membresEquipe: [],
        projets: [],
        taches: []
      },
      {
        idEquipe: 3,
        nom: 'Équipe Gamma',
        statut: StatutEquipe.Active,
        projetsEquipes: [],
        membresEquipe: [],
        projets: [],
        taches: []
      },
      {
        idEquipe: 4,
        nom: 'Équipe Delta',
        statut: StatutEquipe.Inactive,
        projetsEquipes: [],
        membresEquipe: [],
        projets: [],
        taches: []
      }
    ];
  }

  createEquipe(equipe: Equipe): Observable<Equipe> {
    const equipeData = {
      Nom: equipe.nom,
      Statut: Number(equipe.statut),
      ProjetsEquipes: [],
      MembresEquipe: []
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
    
    return this.http.post<Equipe>(this.apiUrl, equipeData, { headers }).pipe(
      catchError(error => {
        console.error('Erreur création équipe:', error);
        throw error;
      })
    );
  }

  updateEquipe(id: number, equipe: Equipe): Observable<Equipe> {
    const equipeData = {
      IdEquipe: id,
      Nom: equipe.nom,
      Statut: Number(equipe.statut),
      ProjetsEquipes: [],
      MembresEquipe: []
    };

    return this.http.put<Equipe>(`${this.apiUrl}/${id}`, equipeData);
  }

  deleteEquipe(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getStatutLabel(statut: StatutEquipe | string | number): string {
    const statutNumber = Number(statut);
    
    switch (statutNumber) {
      case StatutEquipe.Active:
      case 0:
        return 'Active';
      case StatutEquipe.Inactive:
      case 1:
        return 'Inactive';
      default:
        return `Statut ${statut}`;
    }
  }

  getStatutBadgeStatus(statut: StatutEquipe | string | number): string {
    const statutNumber = Number(statut);
    return statutNumber === StatutEquipe.Active ? 'success' : 'danger';
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

  // Nouvelles méthodes pour la relation many-to-many avec les projets
  getProjetsDeLEquipe(equipeId: number): Observable<number[]> {
    console.log(`🚀 Tentative de récupération des projets pour l'équipe ${equipeId}`);
    return this.http.get<number[]>(`${this.apiUrl}/${equipeId}/projets`).pipe(
      catchError(error => {
        console.error(`❌ Erreur API pour équipe ${equipeId}:`, error);
        
        // Si l'endpoint n'existe pas, retourner des données de test temporaires
        if (error.status === 404) {
          console.log(`⚠️ Endpoint non trouvé pour équipe ${equipeId}, utilisation de données de test`);
          // Données de test temporaires
          const testData: { [key: number]: number[] } = {
            1: [7, 8], // dev team a les projets 7 et 8
            2: [6, 9], // test a les projets 6 et 9
            3: [],     // jj n'a aucun projet
            4: [7]     // DEB a le projet 7
          };
          return of(testData[equipeId] || []);
        }
        
        return of([]); // Retourner un tableau vide en cas d'erreur
      })
    );
  }

  affecterEquipeAuProjet(equipeId: number, projetId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${equipeId}/affecter-projet`, projetId);
  }

  retirerEquipeDuProjet(equipeId: number, projetId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${equipeId}/projets/${projetId}`);
  }

  // Récupérer une équipe avec ses projets
  getEquipeAvecProjets(equipeId: number): Observable<Equipe> {
    return this.http.get<Equipe>(`${this.apiUrl}/${equipeId}?includeProjets=true`);
  }

  // ✅ Nouvelle méthode pour récupérer les tâches d'une équipe
  getTachesDeLEquipe(equipeId: number): Observable<any[]> {
    console.log(`🚀 Récupération des tâches pour l'équipe ${equipeId}`);
    return this.http.get<any[]>(`${this.apiUrl}/${equipeId}/taches`).pipe(
      catchError(error => {
        console.error(`❌ Erreur API pour les tâches de l'équipe ${equipeId}:`, error);
        return of([]); // Retourner un tableau vide en cas d'erreur
      })
    );
  }
} 