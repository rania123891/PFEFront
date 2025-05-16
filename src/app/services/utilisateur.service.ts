import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export enum RoleUtilisateur {
  Admin = 'Admin',
  User = 'User'
}

export interface Utilisateur {
  id: number;
  email: string;
  nom?: string;
  prenom?: string;
  role: RoleUtilisateur | string;
  dateCreation: string | Date;
}

export interface CreateUtilisateurRequest {
  email: string;
  password: string;
  nom?: string;
  prenom?: string;
  role: RoleUtilisateur | string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  nom: string;
  prenom: string;
}

@Injectable({
  providedIn: 'root'
})
export class UtilisateurService {
  private baseUrl = `${environment.apis.user}`;

  constructor(private http: HttpClient) { }

  register(registerData: RegisterRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/Utilisateur/register`, registerData);
  }

  getUtilisateurs(): Observable<Utilisateur[]> {
    return this.http.get<Utilisateur[]>(`${this.baseUrl}/Utilisateur`).pipe(
      map(users => users.map(user => ({
        ...user,
        nom: user.nom || '---',
        prenom: user.prenom || '---',
        dateCreation: user.dateCreation || new Date().toISOString(),
        role: this.formatRole(user.role)
      })))
    );
  }

  private formatRole(role: string): string {
    switch(role?.toLowerCase()) {
      case 'admin':
        return 'ADMINISTRATEUR';
      case 'user':
        return 'UTILISATEUR';
      default:
        return role || 'INCONNU';
    }
  }

  getUtilisateur(id: number): Observable<Utilisateur> {
    return this.http.get<Utilisateur>(`${this.baseUrl}/Utilisateur/${id}`).pipe(
      map(user => ({
        ...user,
        nom: user.nom || '---',
        prenom: user.prenom || '---',
        dateCreation: user.dateCreation || new Date().toISOString(),
        role: this.formatRole(user.role)
      }))
    );
  }

  createUtilisateur(request: CreateUtilisateurRequest): Observable<Utilisateur> {
    return this.http.post<Utilisateur>(`${this.baseUrl}/Utilisateur`, request);
  }

  updateUtilisateur(id: number, utilisateur: Partial<Utilisateur>): Observable<Utilisateur> {
    const userData = {
      email: utilisateur.email,
      nom: utilisateur.nom,
      prenom: utilisateur.prenom,
      role: utilisateur.role
    };
    return this.http.put<Utilisateur>(`${this.baseUrl}/Utilisateur/${id}`, userData);
  }

  deleteUtilisateur(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/Utilisateur/${id}`);
  }

  getRoleLabel(role: RoleUtilisateur | string): string {
    return this.formatRole(role as string);
  }

  getRoleClass(role: RoleUtilisateur | string): string {
    switch(role?.toLowerCase()) {
      case 'admin':
      case 'administrateur':
        return 'status-success';
      case 'user':
      case 'utilisateur':
        return 'status-info';
      default:
        return 'status-warning';
    }
  }
} 