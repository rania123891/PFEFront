import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { map, switchMap } from 'rxjs/operators';
import { UserService, User } from './user.service';

export interface Message {
  id: string;
  contenu: string;
  expediteurId: string;
  destinataireId: string;
  envoyeLe: Date;
  lu: boolean;
  expediteur?: User;
  destinataire?: User;
}

export interface CreateMessageDto {
  contenu: string;
  expediteurEmail: string;
  emailDestinataire: string;
}

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private apiUrl = `${environment.apiUrl}/message/api/Messages`;

  constructor(
    private http: HttpClient,
    private userService: UserService
  ) { }

  getMessagesByUser(userId: string): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.apiUrl}/${userId}`).pipe(
      switchMap(messages => {
        // Récupérer tous les IDs uniques des utilisateurs
        const userIds = new Set<string>();
        messages.forEach(message => {
          userIds.add(message.expediteurId);
          if (message.destinataireId) {
            userIds.add(message.destinataireId);
          }
        });

        // Si aucun utilisateur n'est trouvé, retourner les messages tels quels
        if (userIds.size === 0) {
          return of(messages);
        }

        // Obtenir tous les utilisateurs en une seule requête
        return this.userService.getUsers().pipe(
          map(users => {
            const userMap = new Map<string, User>();
            users.forEach(user => {
              userMap.set(user.id.toString(), user);
            });

            // Ajouter les informations utilisateurs aux messages
            return messages.map(message => ({
              ...message,
              expediteur: userMap.get(message.expediteurId),
              destinataire: userMap.get(message.destinataireId)
            }));
          })
        );
      })
    );
  }

  envoyerMessage(message: CreateMessageDto): Observable<Message> {
    // Vérification des données avant envoi
    if (!message.expediteurEmail || !message.emailDestinataire || !message.contenu) {
      throw new Error('Données de message incomplètes');
    }
    
    // Log pour déboguer
    console.log('Envoi vers:', this.apiUrl + '/send');
    console.log('Données:', message);

    return this.http.post<Message>(`${this.apiUrl}/send`, message);
  }

  marquerCommeLu(messageId: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${messageId}/lu`, {});
  }
} 