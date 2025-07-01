import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { MessageService, Message, CreateMessageDto } from '../../services/message.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NbToastrService, NbDialogService } from '@nebular/theme';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { UserService, User } from '../../services/user.service';
import { FileService, FileUploadResponse } from '../../services/file.service';
import { catchError, map, finalize } from 'rxjs/operators';
import { of, interval, Subscription, forkJoin } from 'rxjs';
import { environment } from '../../../environments/environment';

interface Conversation {
  id: string;
  otherUserId: string;
  otherUserName: string;
  otherUserInitials: string;
  otherUserPicture: string | null;
  messages: Message[];
  lastMessage?: Message;
  unreadCount?: number;
  lastMessageTime: Date;
  isOnline?: boolean;
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
  
  // Propriétés pour la gestion des fichiers
  selectedFiles: File[] = [];
  maxFileSize = 10 * 1024 * 1024; // 10MB
  allowedFileTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf', 
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/zip', 'application/x-rar-compressed'
  ];

  @ViewChild('messagesList') private messagesList: ElementRef;

  constructor(
    private messageService: MessageService,
    private fb: FormBuilder,
    private toastrService: NbToastrService,
    private router: Router,
    private authService: AuthService,
    private userService: UserService,
    private dialogService: NbDialogService,
    private fileService: FileService
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
    this.initializeMessaging();
  }

  private initializeMessaging() {
      this.isLoading = true;
      
    // Charger d'abord les utilisateurs
    this.loadAllUsers()
      .then(() => {
        // Puis charger les messages
        return this.chargerMessages();
      })
      .then(() => {
        console.log('Messagerie initialisée avec succès');
      })
      .catch(error => {
        console.error('Erreur lors de l\'initialisation:', error);
      this.toastrService.danger('Erreur lors du chargement de la messagerie', 'Erreur');
      })
      .finally(() => {
      this.isLoading = false;
      });
  }

  private loadAllUsers(): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log('Chargement des utilisateurs...');
      
      this.userService.getUsersForMessaging()
        .pipe(
          catchError(error => {
            console.error('Erreur avec endpoint for-messaging:', error);
            return this.userService.getUsers();
          })
        )
        .subscribe({
          next: (users) => {
            console.log(`${users.length} utilisateurs chargés`);
            this.utilisateurs.clear();
            users.forEach(user => {
              this.utilisateurs.set(user.id.toString(), user);
            });
            resolve();
          },
          error: (error) => {
            console.error('Erreur lors du chargement des utilisateurs:', error);
            reject(error);
          }
        });
    });
  }

  private chargerMessages(): Promise<void> {
    return new Promise((resolve, reject) => {
    if (!this.utilisateurConnecte?.id) {
        reject('Utilisateur non connecté');
      return;
    }
    
      this.messageService.getMessagesByUser(this.utilisateurConnecte.id).subscribe({
        next: (messages) => {
          console.log(`${messages.length} messages chargés`);
          this.messages = messages;
          this.groupMessagesByConversation(messages);
          resolve();
        },
        error: (error) => {
          console.error('Erreur lors du chargement des messages:', error);
          reject(error);
        }
      });
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
        const user = this.getUserInfo(otherUserId);
        const userName = user ? `${user.prenom} ${user.nom}` : `Utilisateur ${otherUserId}`;
        const userInitials = user ? this.getUserInitials(user) : otherUserId.substring(0, 2).toUpperCase();
        
        conversationsMap.set(otherUserId, {
          id: otherUserId,
          otherUserId: otherUserId,
          otherUserName: userName,
          otherUserInitials: userInitials,
          otherUserPicture: this.getUserProfilePicture(otherUserId),
          messages: [],
          lastMessage: message,
          lastMessageTime: new Date(message.envoyeLe),
          unreadCount: 0,
          isOnline: Math.random() > 0.5
        });
      }
      
      const conversation = conversationsMap.get(otherUserId);
      conversation.messages.push(message);
      
      // Mettre à jour le dernier message si celui-ci est plus récent
      if (!conversation.lastMessage || new Date(message.envoyeLe) > new Date(conversation.lastMessage.envoyeLe)) {
        conversation.lastMessage = message;
        conversation.lastMessageTime = new Date(message.envoyeLe);
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
        b.lastMessageTime.getTime() - a.lastMessageTime.getTime()
      );

    console.log(`${this.conversations.length} conversations créées`);
  }

  selectConversation(conversation: Conversation) {
    console.log('Sélection conversation:', conversation.otherUserName);
    this.selectedConversation = conversation;
    this.showNewMessageForm = false;
    
    // Réinitialiser le formulaire avec le bon destinataire
    const otherUser = this.utilisateurs.get(conversation.otherUserId);
    if (otherUser) {
      this.messageForm.reset();
      this.messageForm.patchValue({
        emailDestinataire: otherUser.email,
        contenu: ''
      });
    }
    
    // Marquer les messages comme lus
    this.markMessagesAsRead(conversation);
    
    // Faire défiler vers le bas
    setTimeout(() => this.scrollToBottom(), 200);
  }

  getTimeDisplay(date: Date): string {
    if (!date) return '';
    
    const now = new Date();
    const messageDate = new Date(date);
    const diffInHours = (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return messageDate.toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (diffInHours < 24 * 7) {
      return messageDate.toLocaleDateString('fr-FR', { weekday: 'short' });
    } else {
      return messageDate.toLocaleDateString('fr-FR', { 
        day: '2-digit', 
        month: '2-digit' 
      });
    }
  }

  handleEnterKey(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
        this.envoyerMessage();
    }
  }

  private markMessagesAsRead(conversation: Conversation) {
    conversation.messages
      .filter(message => message.expediteurId !== this.utilisateurConnecte?.id && !message.lu)
      .forEach(message => {
        this.messageService.marquerCommeLu(message.id).subscribe({
          next: () => {
        message.lu = true;
          },
          error: (error) => {
            console.error('Erreur lors du marquage comme lu:', error);
          }
        });
      });
    
    // Réinitialiser le compteur de messages non lus
            conversation.unreadCount = 0;
  }

  private loadUserInfo() {
    const token = this.authService.getToken();
    if (token) {
      try {
        // Décoder le token pour obtenir les informations utilisateur
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        const decodedToken = JSON.parse(jsonPayload);
        
    this.utilisateurConnecte = {
          id: decodedToken.nameid,
            email: decodedToken.email,
            role: decodedToken.role,
          prenom: decodedToken.prenom || 'Utilisateur',
          nom: decodedToken.nom || ''
          };
        console.log('Utilisateur connecté:', this.utilisateurConnecte);
      } catch (error) {
        console.error('Erreur lors du décodage du token:', error);
        this.router.navigate(['/auth/login']);
      }
    } else {
      console.error('Aucun token trouvé');
      this.router.navigate(['/auth/login']);
    }
  }

  getUserFullName(userId: string): string {
    const user = this.getUserInfo(userId);
    return user ? `${user.prenom} ${user.nom}` : `Utilisateur ${userId}`;
  }

  private getUserColor(userId: string): string {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
      '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43',
      '#10AC84', '#EE5A24', '#0984E3', '#6C5CE7', '#FD79A8'
    ];
    
    const hash = userId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    return colors[Math.abs(hash) % colors.length];
  }

  private avatarCache = new Map<string, string>();

  getUserProfilePicture(userId: string): string | null {
    if (!userId) return null;
    
    // Vérifier le cache d'abord
    if (this.avatarCache.has(userId)) {
      return this.avatarCache.get(userId);
    }
    
    const user = this.getUserInfo(userId);
    if (user?.profilePicture) {
      this.avatarCache.set(userId, user.profilePicture);
      return user.profilePicture;
    }
    
    // Générer un avatar SVG avec les initiales
    const initials = user ? this.getUserInitials(user) : userId.substring(0, 2).toUpperCase();
        const backgroundColor = this.getUserColor(userId);
    const avatarSvg = this.generateAvatarSvg(initials, backgroundColor);
    
    this.avatarCache.set(userId, avatarSvg);
    return avatarSvg;
  }

  getUserInitials(user: any): string {
    if (!user) return '?';
    const prenom = user.prenom || '';
    const nom = user.nom || '';
    return (prenom.charAt(0) + nom.charAt(0)).toUpperCase() || user.email?.charAt(0).toUpperCase() || '?';
  }

  private generateAvatarSvg(initials: string, backgroundColor: string): string {
    const svg = `
      <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="20" fill="${backgroundColor}"/>
        <text x="20" y="25" text-anchor="middle" fill="white" font-family="Arial" font-size="14" font-weight="bold">${initials}</text>
      </svg>
    `;
    return 'data:image/svg+xml;base64,' + btoa(svg);
  }

  getUserInfo(userId: string): User | null {
    return this.utilisateurs.get(userId) || null;
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
  }

  getMessageUserName(message: Message): string {
    if (message.expediteur) {
      return `${message.expediteur.prenom} ${message.expediteur.nom}`;
    }
    return this.getUserFullName(message.expediteurId);
  }

  isMessageSent(message: Message): boolean {
    const cleanString = (val: any): string => String(val || '').trim();
    return cleanString(message.expediteurId) === cleanString(this.utilisateurConnecte?.id);
  }

  selectMessage(message: Message) {
    console.log('Message sélectionné:', message);
  }

  private scrollToBottom() {
    try {
      if (this.messagesList) {
        this.messagesList.nativeElement.scrollTop = this.messagesList.nativeElement.scrollHeight;
      }
    } catch (err) {
      console.error('Erreur lors du scroll:', err);
    }
  }

  envoyerMessage() {
    if (this.messageForm.valid && this.messageForm.value.contenu.trim()) {
      const emailDestinataire = this.messageForm.value.emailDestinataire;
      console.log('📤 Envoi message vers email:', emailDestinataire);
      
      // Trouver l'ID du destinataire à partir de son email
      let destinataireId = null;
      for (const [id, user] of this.utilisateurs.entries()) {
        if (user.email === emailDestinataire) {
          destinataireId = id;
          console.log('✅ Destinataire trouvé - Email:', user.email, 'ID:', id);
          break;
        }
      }
      
      if (!destinataireId) {
        console.error('❌ Destinataire non trouvé pour email:', emailDestinataire);
        this.toastrService.danger('Destinataire non trouvé', 'Erreur');
      return;
    }

      const messageData: CreateMessageDto = {
        contenu: this.messageForm.value.contenu.trim(),
        expediteurEmail: this.utilisateurConnecte?.email || '',
        emailDestinataire: emailDestinataire,
        expediteurId: this.utilisateurConnecte?.id,
        destinataireId: destinataireId
      };

      console.log('📋 Données du message à envoyer:', {
        contenu: messageData.contenu,
        expediteurEmail: messageData.expediteurEmail,
        emailDestinataire: messageData.emailDestinataire,
        expediteurId: messageData.expediteurId,
        destinataireId: messageData.destinataireId
      });

      this.messageService.envoyerMessage(messageData).subscribe({
        next: (response) => {
          console.log('✅ Message envoyé avec succès:', response);
          this.toastrService.success('Message envoyé avec succès', 'Succès');
          
          // Réinitialiser SEULEMENT le contenu, pas le destinataire
          this.messageForm.patchValue({ contenu: '' });
          
          // Recharger les messages
          this.chargerMessages().then(() => {
            // Maintenir la conversation sélectionnée après rechargement
              if (this.selectedConversation) {
              const updatedConversation = this.conversations.find(c => c.id === this.selectedConversation.id);
              if (updatedConversation) {
                this.selectedConversation = updatedConversation;
                setTimeout(() => this.scrollToBottom(), 100);
              }
            }
          });
        },
        error: (error) => {
          console.error('❌ Erreur lors de l\'envoi du message:', error);
          this.toastrService.danger('Erreur lors de l\'envoi du message', 'Erreur');
        }
      });
    } else {
      console.warn('⚠️ Formulaire invalide ou contenu vide');
      if (!this.messageForm.value.emailDestinataire) {
        this.toastrService.warning('Veuillez sélectionner un destinataire', 'Attention');
      }
      if (!this.messageForm.value.contenu?.trim()) {
        this.toastrService.warning('Veuillez saisir un message', 'Attention');
      }
    }
  }

  toggleNewMessageForm() {
    this.showNewMessageForm = !this.showNewMessageForm;
    this.selectedConversation = null;
    
    if (this.showNewMessageForm) {
      // Réinitialiser complètement le formulaire pour un nouveau message
      this.messageForm.reset();
      this.messageForm.patchValue({
        emailDestinataire: '',
        contenu: ''
      });
      this.filterUsers('');
    }
  }

  filterUsers(searchTerm: string) {
    if (!searchTerm.trim()) {
      this.filteredUsers = Array.from(this.utilisateurs.values())
        .filter(user => user.id.toString() !== this.utilisateurConnecte?.id)
        .slice(0, 10);
    } else {
      this.filteredUsers = Array.from(this.utilisateurs.values())
        .filter(user => {
          const fullName = `${user.prenom} ${user.nom}`.toLowerCase();
          const email = user.email.toLowerCase();
          const search = searchTerm.toLowerCase();
          return user.id.toString() !== this.utilisateurConnecte?.id &&
                 (fullName.includes(search) || email.includes(search));
        })
        .slice(0, 10);
    }
  }

  selectUser(user: User) {
    // Réinitialiser le formulaire avec le nouvel utilisateur sélectionné
    this.messageForm.reset();
    this.messageForm.patchValue({
      emailDestinataire: user.email,
      contenu: ''
    });
    this.filteredUsers = [];
    this.searchTerm = '';
    
    console.log('👤 Utilisateur sélectionné:', user.email);
  }

  messageGroup: MessageGroup[] = [];

  get messageGroups(): MessageGroup[] {
    if (!this.selectedConversation?.messages) {
      return [];
    }

    const groups: MessageGroup[] = [];
    const messages = this.selectedConversation.messages;

    messages.forEach(message => {
      const messageDate = new Date(message.envoyeLe);
      const dateKey = messageDate.toDateString();
      
      let group = groups.find(g => g.date.toDateString() === dateKey);
      if (!group) {
        group = {
          date: messageDate,
          messages: []
        };
        groups.push(group);
      }
      
      group.messages.push(message);
    });

    return groups.sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  // Méthodes pour les fichiers (simplifiées)
  onFileSelected(event: Event): void {
    // Implementation simplifiée
  }

  isFileMessage(message: Message): boolean {
    return message.isFile || !!message.fileId;
  }

  isImageFile(message: Message): boolean {
    if (!message.mimeType) return false;
    return message.mimeType.startsWith('image/');
  }

  getFileIcon(message: Message): string {
    if (!message.mimeType) return 'file-text-outline';
    
    if (message.mimeType.includes('pdf')) return 'file-text-outline';
    if (message.mimeType.includes('word')) return 'file-text-outline';
    if (message.mimeType.includes('excel') || message.mimeType.includes('spreadsheet')) return 'file-text-outline';
    if (message.mimeType.includes('zip') || message.mimeType.includes('rar')) return 'archive-outline';
    
    return 'file-outline';
  }

  getFilePreviewUrl(message: Message): string | null {
    if (message.fileId && this.isImageFile(message)) {
      return `${environment.apiUrl}/files/${message.fileId}`;
    }
    return null;
  }

  openFilePreview(message: Message): void {
    if (message.fileId) {
      window.open(`${environment.apiUrl}/files/${message.fileId}`, '_blank');
    }
  }

  downloadFile(message: Message): void {
    if (message.fileId) {
      window.open(`${environment.apiUrl}/files/${message.fileId}/download`, '_blank');
    }
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
} 