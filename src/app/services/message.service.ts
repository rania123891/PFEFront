import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { map, switchMap, catchError } from 'rxjs/operators';
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
  // Propriétés pour les fichiers
  fileId?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  isFile?: boolean;
}

export interface CreateMessageDto {
  contenu: string;
  expediteurEmail: string;
  emailDestinataire: string;
  expediteurId?: string;
  destinataireId?: string;
  // Propriétés pour les fichiers
  fileId?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  isFile?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private apiUrl = `${environment.apis.message}/Messages`;

  constructor(
    private http: HttpClient,
    private userService: UserService
  ) {
    console.log('MessageService initialized with URL:', this.apiUrl);
  }

  getMessagesByUser(userId: string): Observable<Message[]> {
    console.log('Récupération des messages pour l\'utilisateur:', userId);
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

        // Obtenir tous les utilisateurs
        return this.userService.getUsersForMessaging().pipe(
          catchError(error => {
            console.warn('Erreur avec for-messaging, tentative avec getUsers:', error);
            return this.userService.getUsers();
          }),
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
      }),
      catchError(error => {
        console.error('❌ Service de messagerie non disponible:', error);
        
        // Retourner un tableau vide en cas d'erreur pour que l'interface fonctionne
        return of([]);
      })
    );
  }

  envoyerMessage(message: CreateMessageDto): Observable<Message> {
    if (!message.expediteurEmail || !message.emailDestinataire || !message.contenu) {
      throw new Error('Données de message incomplètes');
    }
    
    console.log('Envoi de message:', message);
    
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    
    // Essayer d'abord l'endpoint /simple-send (plus robuste selon Cursor)
    return this.http.post<Message>(`${this.apiUrl}/simple-send`, message, { headers }).pipe(
      catchError(error => {
        console.error('Erreur avec /simple-send, tentative avec /send:', error);
        // Si échec, essayer /send
        return this.http.post<Message>(`${this.apiUrl}/send`, message, { headers });
      })
    );
  }

  marquerCommeLu(messageId: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${messageId}/lu`, {}).pipe(
      catchError(error => {
        console.warn('Erreur lors du marquage comme lu (service non disponible):', error);
        return of(void 0);
      })
    );
  }

  getConversations(userId: string): Observable<Message[]> {
    return this.getMessagesByUser(userId);
  }

  getConversationDetail(userId: string, otherUserId: string): Observable<Message[]> {
    return this.getMessagesByUser(userId).pipe(
      map(messages => messages.filter(m => 
        (m.expediteurId === userId && m.destinataireId === otherUserId) ||
        (m.expediteurId === otherUserId && m.destinataireId === userId)
      ))
    );
  }
} 