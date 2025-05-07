import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { MembreEquipe } from '../pages/equipes/membre-equipe.model';

export enum RoleMembreEquipe {
  Membre = 0,
  ChefEquipe = 1
}

@Injectable({
  providedIn: 'root'
})
export class TeamMemberService {
  private apiUrl = environment.apis.projet;

  constructor(private http: HttpClient) { }

  addTeamMembers(equipeId: number, membres: MembreEquipe[]): Observable<MembreEquipe[]> {
    return this.http.post<MembreEquipe[]>(`${this.apiUrl}/equipes/${equipeId}/membres`, membres);
  }

  removeTeamMember(equipeId: number, membreId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/equipes/${equipeId}/membres/${membreId}`);
  }
} 