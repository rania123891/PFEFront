import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface User {
  id: number;
  email: string;
  nom: string;
  prenom: string;
  role: string;
  dateCreation: string;
  password?: string;
  profilePicture?: string; // URL vers la photo de profil
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apis.user}/Utilisateur`;

  constructor(private http: HttpClient) { }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl).pipe(
      map(users => users.map(user => ({
        ...user,
        nom: user.nom || '---',
        prenom: user.prenom || '---',
        dateCreation: user.dateCreation || '---',
        role: this.formatRole(user.role)
      })))
    );
  }

  createUser(user: User): Observable<User> {
    const userData = {
      email: user.email,
      password: user.password || 'defaultPassword123!',
      nom: user.nom,
      prenom: user.prenom,
      role: user.role
    };
    return this.http.post<User>(this.apiUrl, userData);
  }

  updateUser(id: number, user: User): Observable<User> {
    const userData = {
      email: user.email,
      nom: user.nom,
      prenom: user.prenom,
      role: user.role
    };
    return this.http.put<User>(`${this.apiUrl}/${id}`, userData);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  private formatRole(role: string): string {
    if (!role) return '---';
    switch (role.toLowerCase()) {
      case 'admin':
      case 'administrator':
        return 'ADMINISTRATEUR';
      case 'user':
      case 'utilisateur':
        return 'UTILISATEUR';
      default:
        return role.toUpperCase();
    }
  }
}