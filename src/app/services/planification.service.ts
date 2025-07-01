import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { NbToastrService } from '@nebular/theme';

export enum EtatListe {
  Todo = 0,
  EnCours = 1,
  Test = 2,
  Termine = 3
}

export interface Planification {
  id?: number;
  date: Date | string;
  heureDebut: string;
  heureFin: string;
  description?: string;
  tacheId: number;
  projetId: number;
  listeId: EtatListe;
  userId: number;
  tache?: any;
  projet?: any;
}

export interface CreatePlanificationDto {
  date: string;
  heureDebut: string;
  heureFin: string;
  description?: string;
  tacheId: number;
  projetId: number;
  listeId: EtatListe;
  userId?: number; // Optionnel - sera rempli automatiquement si non fourni
}

export interface UserPermissions {
  userId: number;
  isAdmin: boolean;
  role: string;
  canViewAllPlanifications: boolean;
  canModifyAllPlanifications: boolean;
}

export interface UserForSelection {
  id: number;
  email: string;
  nom: string;
  prenom: string;
  fullName: string;
  displayText: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class PlanificationService {
  private apiUrl = 'http://localhost:5093/projet/api/planifications';
  private userApiUrl = 'http://localhost:5093/user/api/utilisateur';

  constructor(
    private http: HttpClient,
    private toastrService: NbToastrService
  ) { }

  // Méthode pour créer les options HTTP avec le token actuel
  private getHttpOptions(): { headers: HttpHeaders, withCredentials: boolean } {
    // Suppression de la gestion manuelle du token - l'AuthInterceptor s'en occupe
    console.log('🔧 Headers créés (AuthInterceptor gère le token automatiquement)');
    
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
      // Authorization retiré - l'AuthInterceptor l'ajoute automatiquement
    });

    return {
      headers: headers,
      withCredentials: true
    };
  }

  getEtatLabel(etat: EtatListe): string {
    switch (etat) {
      case EtatListe.Todo:
        return 'To Do';
      case EtatListe.EnCours:
        return 'En Cours';
      case EtatListe.Test:
        return 'Test';
      case EtatListe.Termine:
        return 'Terminé';
      default:
        return 'Inconnu';
    }
  }

  private handleError = (error: any): Observable<never> => {
    console.error('❌ Erreur service planification:', error);
    
    let errorMessage = 'Une erreur inconnue s\'est produite';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erreur: ${error.error.message}`;
    } else {
      errorMessage = `Code d'erreur: ${error.status}\nMessage: ${error.message}`;
      if (error.error && error.error.message) {
        errorMessage += `\nDétail: ${error.error.message}`;
      }
    }
    
    // Si erreur 401, token peut-être expiré
    if (error.status === 401) {
      console.error('🚫 Erreur 401 - Token potentiellement expiré ou invalide');
      this.toastrService.danger('Session expirée. Veuillez vous reconnecter.', 'Authentification');
    }
    
    return throwError(() => new Error(errorMessage));
  }

  // ===== NOUVEAUX ENDPOINTS AVEC PERMISSIONS =====

  /**
   * Vérifier les permissions de l'utilisateur actuel
   */
  getCurrentUserPermissions(): Observable<UserPermissions> {
    console.log('🔍 Vérification des permissions utilisateur...');
    const options = this.getHttpOptions();
    console.log('📍 URL:', `${this.apiUrl}/permissions`);
    
    return this.http.get<UserPermissions>(`${this.apiUrl}/permissions`, options)
      .pipe(
        tap(permissions => console.log('✅ Permissions reçues:', permissions)),
        catchError(this.handleError)
      );
  }

  /**
   * Récupérer MES propres planifications (pour tous utilisateurs)
   */
  getMyPlanifications(): Observable<Planification[]> {
    console.log('📋 Récupération de mes planifications...');
    const options = this.getHttpOptions();
    console.log('📍 URL:', `${this.apiUrl}/my-planifications`);
    
    return this.http.get<Planification[]>(`${this.apiUrl}/my-planifications`, options)
      .pipe(
        tap(planifications => console.log('✅ Mes planifications reçues:', planifications.length)),
        catchError(this.handleError)
      );
  }

  /**
   * Récupérer MES planifications pour une date (pour tous utilisateurs)
   */
  getMyPlanificationsByDate(date: string): Observable<Planification[]> {
    console.log('📅 Récupération de mes planifications pour la date:', date);
    const options = this.getHttpOptions();
    const url = `${this.apiUrl}/my-planifications/date/${date}`;
    console.log('📍 URL:', url);
    
    return this.http.get<Planification[]>(url, options)
      .pipe(
        tap(planifications => console.log('✅ Planifications reçues pour la date:', planifications.length)),
        catchError(this.handleError)
      );
  }

  /**
   * Récupérer TOUTES les planifications (admin seulement)
   */
  getAllPlanifications(): Observable<Planification[]> {
    console.log('📋 Récupération de toutes les planifications (admin)...');
    const options = this.getHttpOptions();
    
    return this.http.get<Planification[]>(this.apiUrl, options)
      .pipe(
        tap(planifications => console.log('✅ Toutes les planifications reçues:', planifications.length)),
        catchError(this.handleError)
      );
  }

  /**
   * Récupérer toutes les planifications pour une date (admin seulement)
   */
  getAllPlanificationsByDate(date: string): Observable<Planification[]> {
    console.log('📅 Récupération de toutes les planifications pour la date:', date);
    const options = this.getHttpOptions();
    
    return this.http.get<Planification[]>(`${this.apiUrl}/date/${date}`, options)
      .pipe(
        tap(planifications => console.log('✅ Toutes les planifications reçues pour la date:', planifications.length)),
        catchError(this.handleError)
      );
  }

  /**
   * Récupérer les statistiques (admin seulement)
   */
  getAdminStatistics(): Observable<any> {
    const options = this.getHttpOptions();
    return this.http.get<any>(`${this.apiUrl}/admin/statistics`, options)
      .pipe(catchError(this.handleError));
  }

  /**
   * Récupérer la liste des utilisateurs pour sélection (admin seulement)
   */
  getUsersForSelection(): Observable<UserForSelection[]> {
    const options = this.getHttpOptions();
    return this.http.get<UserForSelection[]>(`${this.userApiUrl}/for-selection`, options)
      .pipe(
        tap(users => console.log('👥 Utilisateurs pour sélection:', users.length)),
        catchError(this.handleError)
      );
  }

  /**
   * Rechercher des utilisateurs (admin seulement)
   */
  searchUsers(query: string): Observable<UserForSelection[]> {
    const options = this.getHttpOptions();
    return this.http.get<UserForSelection[]>(`${this.userApiUrl}/search?query=${encodeURIComponent(query)}`, options)
      .pipe(catchError(this.handleError));
  }

  /**
   * Récupérer les infos basiques d'un utilisateur
   */
  getUserBasicInfo(userId: number): Observable<any> {
    const options = this.getHttpOptions();
    return this.http.get<any>(`${this.userApiUrl}/${userId}/basic`, options)
      .pipe(catchError(this.handleError));
  }

  // ===== ENDPOINTS EXISTANTS MODIFIÉS =====

  /**
   * @deprecated Utiliser getMyPlanifications() ou getAllPlanifications() selon le contexte
   */
  getPlanifications(): Observable<Planification[]> {
    const options = this.getHttpOptions();
    return this.http.get<Planification[]>(this.apiUrl, options)
      .pipe(catchError(this.handleError));
  }

  /**
   * @deprecated Utiliser getMyPlanificationsByDate() ou getAllPlanificationsByDate() selon le contexte
   */
  getPlanificationsByDate(date: string): Observable<Planification[]> {
    const options = this.getHttpOptions();
    return this.http.get<Planification[]>(`${this.apiUrl}/date/${date}`, options)
      .pipe(catchError(this.handleError));
  }

  /**
   * Récupérer les planifications d'un utilisateur par date
   */
  getPlanificationsByUserAndDate(userId: number, dateStr: string): Observable<Planification[]> {
    console.log(`📅 Récupération des planifications pour l'utilisateur ${userId} et la date: ${dateStr}`);
    const options = this.getHttpOptions();
    console.log(`📍 URL: ${this.apiUrl}/user/${userId}/date/${dateStr}`);
    
    return this.http.get<Planification[]>(`${this.apiUrl}/user/${userId}/date/${dateStr}`, options)
      .pipe(
        tap(planifications => console.log('✅ Planifications reçues:', planifications.length)),
        catchError(this.handleError)
      );
  }

  /**
   * Récupérer toutes les planifications d'un utilisateur
   */
  getPlanificationsByUser(userId: number): Observable<Planification[]> {
    console.log(`📅 Récupération de toutes les planifications pour l'utilisateur ${userId}`);
    const options = this.getHttpOptions();
    
    return this.http.get<Planification[]>(`${this.apiUrl}/user/${userId}`, options)
      .pipe(
        tap(planifications => console.log('✅ Planifications reçues:', planifications.length)),
        catchError(this.handleError)
      );
  }

  getPlanification(id: number): Observable<Planification> {
    const options = this.getHttpOptions();
    return this.http.get<Planification>(`${this.apiUrl}/${id}`, options)
      .pipe(catchError(this.handleError));
  }

  /**
   * Créer une planification
   * Si admin et userId spécifié : crée pour l'utilisateur spécifié
   * Sinon : crée pour l'utilisateur actuel
   */
  createPlanification(planification: CreatePlanificationDto): Observable<Planification> {
    const options = this.getHttpOptions();
    console.log('📝 Création planification:', planification);
    
    return this.http.post<Planification>(this.apiUrl, planification, options)
      .pipe(
        tap(result => console.log('✅ Planification créée:', result)),
        catchError(this.handleError)
      );
  }

  updatePlanification(id: number, planification: Partial<Planification>): Observable<Planification> {
    const options = this.getHttpOptions();
    return this.http.put<Planification>(`${this.apiUrl}/${id}`, planification, options)
      .pipe(catchError(this.handleError));
  }

  updatePlanificationStatus(id: number, listeId: EtatListe): Observable<Planification> {
    const url = `${this.apiUrl}/${id}/statut`;
    const body = { listeId };
    const options = this.getHttpOptions();
    
    console.log('🔍 DEBUG PATCH REQUEST:', {
      url: url,
      method: 'PATCH',
      body: body,
      headers: options.headers.get('Authorization') ? 'Bearer [TOKEN]' : 'MANQUANT'
    });
    
    return this.http.patch<Planification>(url, body, options)
      .pipe(catchError(this.handleError));
  }

  deletePlanification(id: number): Observable<void> {
    const options = this.getHttpOptions();
    return this.http.delete<void>(`${this.apiUrl}/${id}`, options)
      .pipe(catchError(this.handleError));
  }

  // ===== MÉTHODES UTILITAIRES =====

  /**
   * Méthode intelligente pour récupérer les planifications selon le contexte
   */
  getPlanificationsForCurrentContext(date?: string): Observable<Planification[]> {
    return this.getCurrentUserPermissions().pipe(
      switchMap(permissions => {
        if (date) {
          return permissions.isAdmin 
            ? this.getAllPlanificationsByDate(date)
            : this.getMyPlanificationsByDate(date);
        } else {
          return permissions.isAdmin 
            ? this.getAllPlanifications()
            : this.getMyPlanifications();
        }
      })
    );
  }

  /**
   * Créer une planification avec gestion intelligente de l'userId
   */
  createPlanificationSmart(planification: CreatePlanificationDto, targetUserId?: number): Observable<Planification> {
    const planificationData = { ...planification };
    
    // Si un userId cible est spécifié (mode admin), l'utiliser
    if (targetUserId) {
      planificationData.userId = targetUserId;
    }
    // Sinon, laisser le backend déterminer automatiquement
    
    return this.createPlanification(planificationData);
  }

  /**
   * MÉTHODE SIMPLE : Récupérer TOUTES les planifications (bypass JWT)
   */
  getAllPlanificationsSimple(): Observable<Planification[]> {
    console.log('🔍 SIMPLE: Récupération de toutes les planifications...');
    const options = this.getHttpOptions();
    const url = `${this.apiUrl.replace('/planifications', '')}/planifications`; // URL directe
    console.log('📍 URL simple:', url);
    
    return this.http.get<Planification[]>(url, options)
      .pipe(
        tap(planifications => console.log('✅ SIMPLE: Toutes les planifications reçues:', planifications.length)),
        catchError(this.handleError)
      );
  }
} 