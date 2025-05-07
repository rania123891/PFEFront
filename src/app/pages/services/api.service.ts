import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export enum RoleUtilisateur {
  Admin = 'Admin',
  User = 'User'
}

export interface Utilisateur {
  id: number;
  email: string;
  role: RoleUtilisateur;
  dateCreation: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly userApiUrl = environment.apis.user;

  constructor(private http: HttpClient) {}

  // Méthodes pour les utilisateurs
  getUtilisateurs(): Observable<Utilisateur[]> {
    return this.http.get<Utilisateur[]>(`${this.userApiUrl}/Utilisateur`);
  }

  getUtilisateur(id: number): Observable<Utilisateur> {
    return this.http.get<Utilisateur>(`${this.userApiUrl}/Utilisateur/${id}`);
  }

  createUtilisateur(utilisateur: Partial<Utilisateur>): Observable<Utilisateur> {
    return this.http.post<Utilisateur>(`${this.userApiUrl}/Utilisateur/register`, utilisateur);
  }

  updateUtilisateur(id: number, utilisateur: Partial<Utilisateur>): Observable<Utilisateur> {
    return this.http.put<Utilisateur>(`${this.userApiUrl}/Utilisateur/${id}`, utilisateur);
  }

  deleteUtilisateur(id: number): Observable<void> {
    return this.http.delete<void>(`${this.userApiUrl}/Utilisateur/${id}`);
  }
} 