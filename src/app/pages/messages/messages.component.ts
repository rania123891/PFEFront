import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { MessageService, Message, CreateMessageDto } from '../../services/message.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NbToastrService, NbDialogService } from '@nebular/theme';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { UserService, User } from '../../services/user.service';
import { catchError, map, finalize } from 'rxjs/operators';
import { of, interval, Subscription, forkJoin } from 'rxjs';

interface Conversation {
  id: string;
  otherUserId: string;
  otherUserName: string;
  messages: Message[];
  lastMessage?: Message;
  unreadCount?: number;
}

interface MessageGroup {
  date: Date;
  messages: Message[];
}

@Component({
  selector: 'ngx-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.scss']
})
export class MessagesComponent implements OnInit, OnDestroy {
  messages: Message[] = [];
  conversations: Conversation[] = [];
  messageForm: FormGroup;
  isLoading = false;
  selectedConversation: Conversation | null = null;
  utilisateurConnecte: any = null;
  utilisateurs: Map<string, User> = new Map();
  showNewMessageForm = false;
  filteredUsers: User[] = [];
  searchTerm = '';
  private refreshInterval: Subscription;

  @ViewChild('messagesList') private messagesList: ElementRef;

  constructor(
    private messageService: MessageService,
    private fb: FormBuilder,
    private toastrService: NbToastrService,
    private router: Router,
    private authService: AuthService,
    private userService: UserService,
    private dialogService: NbDialogService
  ) {
    this.messageForm = this.fb.group({
      emailDestinataire: ['', [Validators.required, Validators.email]],
      contenu: ['', Validators.required]
    });
  }

  ngOnInit() {
    console.log('Initialisation du composant Messages');
    
    if (!this.authService.isAuthenticated()) {
      console.warn('Utilisateur non authentifié');
      this.router.navigate(['/auth/login']);
      return;
    }
    
    this.loadUserInfo();
    if (!this.utilisateurConnecte?.id) {
      console.warn('Impossible de charger les informations utilisateur');
      return;
    }
    
    console.log('Chargement des utilisateurs...');
    this.loadAllUsers();
    console.log('Chargement des messages...');
    this.chargerMessages();

    // Rafraîchir les messages toutes les 5 secondes
    this.refreshInterval = interval(5000).subscribe(() => {
      if (this.selectedConversation) {
        this.chargerMessages(false);
      }
    });
  }

  ngOnDestroy() {
    if (this.refreshInterval) {
      this.refreshInterval.unsubscribe();
    }
  }

  private groupMessagesByConversation(messages: Message[]): void {
    const conversationsMap = new Map<string, Conversation>();
    
    messages.forEach(message => {
      const otherUserId = message.expediteurId === this.utilisateurConnecte?.id 
        ? message.destinataireId 
        : message.expediteurId;
      
      if (!conversationsMap.has(otherUserId)) {
        conversationsMap.set(otherUserId, {
          id: otherUserId,
          otherUserId: otherUserId,
          otherUserName: this.getUserFullName(otherUserId),
          messages: [],
          lastMessage: message,
          unreadCount: 0
        });
      }
      
      const conversation = conversationsMap.get(otherUserId);
      conversation.messages.push(message);
      
      // Mettre à jour le dernier message si celui-ci est plus récent
      if (!conversation.lastMessage || new Date(message.envoyeLe) > new Date(conversation.lastMessage.envoyeLe)) {
        conversation.lastMessage = message;
      }

      // Compter les messages non lus
      if (message.expediteurId !== this.utilisateurConnecte?.id && !message.lu) {
        conversation.unreadCount++;
      }
    });
    
    // Trier les messages dans chaque conversation par date
    conversationsMap.forEach(conversation => {
      conversation.messages.sort((a, b) => 
        new Date(a.envoyeLe).getTime() - new Date(b.envoyeLe).getTime()
      );
    });
    
    // Convertir la Map en tableau et trier par date du dernier message
    this.conversations = Array.from(conversationsMap.values())
      .sort((a, b) => 
        new Date(b.lastMessage?.envoyeLe).getTime() - new Date(a.lastMessage?.envoyeLe).getTime()
      );

    // Maintenir la conversation sélectionnée
    if (this.selectedConversation) {
      const updatedConversation = this.conversations.find(c => c.id === this.selectedConversation.id);
      if (updatedConversation) {
        this.selectedConversation = updatedConversation;
        this.scrollToBottom();
      }
    }
  }

  selectConversation(conversation: Conversation) {
    this.selectedConversation = conversation;
    this.showNewMessageForm = false;
    
    const otherUser = this.utilisateurs.get(conversation.otherUserId);
    if (otherUser) {
      this.messageForm.patchValue({
        emailDestinataire: otherUser.email
      });
    }
    
    // Marquer les messages comme lus
    this.markMessagesAsRead(conversation);
    
    setTimeout(() => {
      this.scrollToBottom();
    });
  }

  private markMessagesAsRead(conversation: Conversation) {
    const unreadMessages = conversation.messages.filter(
      m => m.expediteurId !== this.utilisateurConnecte?.id && !m.lu
    );

    if (unreadMessages.length > 0) {
      const markAsReadRequests = unreadMessages.map(message => 
        this.messageService.marquerCommeLu(message.id)
      );

      forkJoin(markAsReadRequests)
        .pipe(
          catchError(err => {
            console.error('Erreur lors du marquage des messages comme lus:', err);
            return of(null);
          }),
          finalize(() => {
            // Mettre à jour localement l'état des messages
            unreadMessages.forEach(message => {
              message.lu = true;
            });
            conversation.unreadCount = 0;
          })
        )
        .subscribe();
    }
  }

  private loadUserInfo() {
    try {
      const token = this.authService.getToken();
      console.log('Token récupéré:', token ? 'Présent' : 'Absent');
      
      if (token) {
        const decodedToken = this.authService['decodeToken'](token);
        console.log('Token décodé:', decodedToken);
        
        this.utilisateurConnecte = {
          id: decodedToken.nameid,
          email: decodedToken.email,
          role: decodedToken.role
        };
        console.log('Utilisateur connecté:', this.utilisateurConnecte);
      } else {
        console.warn('Aucun token trouvé');
        this.router.navigate(['/auth/login']);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des informations utilisateur:', error);
      this.toastrService.danger('Erreur lors du chargement des informations utilisateur', 'Erreur');
      this.router.navigate(['/auth/login']);
    }
  }

  private loadAllUsers() {
    this.userService.getUsers().subscribe({
      next: (users) => {
        users.forEach(user => {
          this.utilisateurs.set(user.id.toString(), user);
        });
      },
      error: (error) => {
        console.error('Erreur lors du chargement des utilisateurs:', error);
        this.toastrService.danger('Erreur lors du chargement des utilisateurs', 'Erreur');
      }
    });
  }

  getUserFullName(userId: string): string {
    const user = this.utilisateurs.get(userId);
    return user ? `${user.prenom} ${user.nom}` : 'Utilisateur inconnu';
  }

  // Méthode pour générer une couleur unique pour un utilisateur
  private getUserColor(userId: string): string {
    const colors = [
      '667eea', '764ba2', '00d68f', 'ff6b6b', '4ecdc4', 
      '45b7d1', '96ceb4', 'feca57', 'ff9ff3', '54a0ff',
      '5f27cd', '00d2d3', 'ff9f43', '10ac84', 'ee5a6f',
      '0abde3', 'feca57', 'ff6348', '48dbfb', '0be881'
    ];
    
    // Utiliser l'ID utilisateur pour choisir une couleur de manière déterministe
    const colorIndex = parseInt(userId) % colors.length;
    return colors[colorIndex];
  }

  // Méthode pour récupérer l'URL de la photo de profil
  getUserProfilePicture(userId: string): string | null {
    console.log('getUserProfilePicture appelée pour userId:', userId);
    const user = this.utilisateurs.get(userId);
    console.log('Utilisateur trouvé:', user);
    
    if (user) {
      // Si l'utilisateur a une photo de profil personnalisée, l'utiliser
      if (user.profilePicture) {
        console.log('Photo de profil personnalisée trouvée:', user.profilePicture);
        return user.profilePicture;
      }
      
      // Générer un avatar SVG local avec les initiales et une couleur unique
      const initials = this.getUserInitials(user);
      const backgroundColor = this.getUserColor(userId);
      const avatarSvg = this.generateAvatarSvg(initials, backgroundColor);
      console.log('Avatar SVG généré pour:', user.prenom, user.nom);
      return avatarSvg;
    }
    
    console.log('Aucun utilisateur trouvé pour userId:', userId);
    // Retourner null pour utiliser les initiales par défaut de Nebular
    return null;
  }

  // Méthode pour obtenir les initiales d'un utilisateur
  private getUserInitials(user: User): string {
    const firstInitial = user.prenom ? user.prenom.charAt(0).toUpperCase() : '';
    const lastInitial = user.nom ? user.nom.charAt(0).toUpperCase() : '';
    return firstInitial + lastInitial;
  }

  // Méthode pour générer un avatar SVG avec les initiales
  private generateAvatarSvg(initials: string, backgroundColor: string): string {
    const svg = `
      <svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <circle cx="32" cy="32" r="32" fill="#${backgroundColor}"/>
        <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="24" font-weight="bold" 
              fill="white" text-anchor="middle" dy=".3em">${initials}</text>
      </svg>
    `;
    return 'data:image/svg+xml;base64,' + btoa(svg);
  }

  // Méthode pour obtenir les informations utilisateur complètes
  getUserInfo(userId: string): User | null {
    return this.utilisateurs.get(userId) || null;
  }

  // Méthode pour gérer les erreurs de chargement d'images
  onImageError(event: Event) {
    const imgElement = event.target as HTMLImageElement;
    // Remplacer par un avatar de fallback plus simple
    imgElement.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMzIiIGN5PSIzMiIgcj0iMzIiIGZpbGw9IiM2NjdlZWEiLz4KPHR3eHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+dTwvdGV4dD4KPC9zdmc+';
  }

  getMessageUserName(message: Message): string {
    if (message.expediteurId === this.utilisateurConnecte?.id) {
      return this.getUserFullName(message.destinataireId);
    }
    return this.getUserFullName(message.expediteurId);
  }

  isMessageSent(message: Message): boolean {
    return message.expediteurId === this.utilisateurConnecte?.id;
  }

  selectMessage(message: Message) {
    this.selectedConversation = null;
    const otherUserId = this.isMessageSent(message) ? message.destinataireId : message.expediteurId;
    const otherUser = this.utilisateurs.get(otherUserId);
    if (otherUser) {
      this.messageForm.patchValue({
        emailDestinataire: otherUser.email
      });
    }
    setTimeout(() => {
      this.scrollToBottom();
    });
  }

  private scrollToBottom() {
    try {
      this.messagesList.nativeElement.scrollTop = this.messagesList.nativeElement.scrollHeight;
    } catch (err) { }
  }

  chargerMessages(showLoading = true) {
    if (this.utilisateurConnecte?.id) {
      if (showLoading) {
        this.isLoading = true;
      }
      
      console.log('Chargement des messages pour utilisateur:', this.utilisateurConnecte.id);
      
      this.messageService.getMessagesByUser(this.utilisateurConnecte.id)
        .pipe(
          catchError(err => {
            console.error('Erreur lors du chargement des messages:', err);
            if (showLoading) {
              this.toastrService.danger('Erreur lors du chargement des messages', 'Erreur');
            }
            return of([]);
          })
        )
        .subscribe({
          next: (messages) => {
            console.log('Messages reçus:', messages);
            this.messages = messages;
            this.groupMessagesByConversation(messages);
            console.log('Conversations groupées:', this.conversations);
            
            if (showLoading) {
              this.isLoading = false;
              if (this.conversations.length > 0 && !this.selectedConversation) {
                console.log('Sélection de la première conversation');
                this.selectConversation(this.conversations[0]);
              }
            }
          },
          error: () => {
            if (showLoading) {
              this.isLoading = false;
            }
          }
        });
    } else {
      console.warn('Aucun utilisateur connecté');
    }
  }

  envoyerMessage() {
    if (!this.utilisateurConnecte?.email) {
      this.toastrService.warning('Vous devez être connecté pour envoyer un message', 'Attention');
      return;
    }

    if (this.messageForm.valid && !this.isLoading) {
      this.isLoading = true;
      const messageDto: CreateMessageDto = {
        contenu: this.messageForm.get('contenu')?.value,
        expediteurEmail: this.utilisateurConnecte.email,
        emailDestinataire: this.messageForm.get('emailDestinataire')?.value
      };

      this.messageService.envoyerMessage(messageDto)
        .pipe(
          catchError(err => {
            console.error('Erreur lors de l\'envoi du message:', err);
            this.toastrService.danger('Erreur lors de l\'envoi du message', 'Erreur');
            return of(null);
          })
        )
        .subscribe({
          next: (response) => {
            if (response !== null) {
              this.messageForm.get('contenu')?.reset();
              this.chargerMessages(false);
            }
            this.isLoading = false;
          },
          error: () => {
            this.isLoading = false;
          }
        });
    }
  }

  toggleNewMessageForm() {
    this.showNewMessageForm = !this.showNewMessageForm;
    if (this.showNewMessageForm) {
      this.messageForm.reset();
      this.selectedConversation = null;
    }
  }

  filterUsers(searchTerm: string) {
    this.searchTerm = searchTerm;
    if (!searchTerm) {
      this.filteredUsers = [];
      return;
    }
    
    const search = searchTerm.toLowerCase();
    this.filteredUsers = Array.from(this.utilisateurs.values())
      .filter(user => 
        user.id !== this.utilisateurConnecte?.id &&
        (user.email.toLowerCase().includes(search) ||
        user.nom.toLowerCase().includes(search) ||
        user.prenom.toLowerCase().includes(search))
      );
  }

  selectUser(user: User) {
    this.messageForm.patchValue({
      emailDestinataire: user.email
    });
    this.filteredUsers = [];
    this.searchTerm = '';
  }

  getMessageGroups(): MessageGroup[] {
    if (!this.selectedConversation) {
      console.warn('Aucune conversation sélectionnée');
      return [];
    }

    const groups = new Map<string, MessageGroup>();
    
    this.selectedConversation.messages.forEach(message => {
      const date = new Date(message.envoyeLe);
      const dateKey = date.toDateString();
      
      if (!groups.has(dateKey)) {
        groups.set(dateKey, {
          date: date,
          messages: []
        });
      }
      
      groups.get(dateKey).messages.push(message);
    });

    const result = Array.from(groups.values()).sort((a, b) => 
      a.date.getTime() - b.date.getTime()
    );
    
    console.log('Groupes de messages:', result);
    return result;
  }
} 