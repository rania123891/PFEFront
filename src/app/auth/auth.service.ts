import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { Router } from '@angular/router';

interface LoginResponse {
  token: string;
}

interface JwtPayload {
  nameid: string;
  email: string;
  role: string;
  exp: number;
}

interface RegisterDto {
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5093/user';
  private userRoleSubject = new BehaviorSubject<string | null>(this.getRole());

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  // Getter pour obtenir le rôle actuel comme Observable
  get userRole$() {
    return this.userRoleSubject.asObservable();
  }

  private decodeToken(token: string): JwtPayload {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error('Erreur lors du décodage du token:', e);
      return {} as JwtPayload;
    }
  }

  login(email: string, password: string): Observable<LoginResponse> {
    const loginData = { email, password };

    return this.http.post<LoginResponse>(`${this.apiUrl}/api/Utilisateur/login`, loginData)
      .pipe(
        tap((response: LoginResponse) => {
          if (response && response.token) {
            // Décoder le token pour obtenir le rôle
            const decodedToken = this.decodeToken(response.token);
            const role = decodedToken.role;

            this.setCookie('token', response.token, 2);
            this.setCookie('role', role, 2);
            this.userRoleSubject.next(role);
            
            // Redirection selon le rôle
            const returnUrl = this.getReturnUrl();
            if (returnUrl && this.canAccessUrl(returnUrl, role)) {
              this.router.navigateByUrl(returnUrl);
            } else {
              this.router.navigate([role === 'Admin' ? '/pages/dashboard' : '/pages/projet']);
            }
          }
        })
      );
  }

  register(userData: RegisterDto): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/Utilisateur/register`, userData)
      .pipe(
        tap(() => {
          this.router.navigate(['/auth/login']);
        })
      );
  }

  logout(): void {
    this.deleteCookie('token');
    this.deleteCookie('role');
    this.userRoleSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  // Méthodes de gestion des cookies
  private setCookie(name: string, value: string, expirationHours: number): void {
    const date = new Date();
    date.setTime(date.getTime() + (expirationHours * 60 * 60 * 1000));
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${name}=${value}; ${expires}; path=/; secure; samesite=strict`;
  }

  private getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  }

  private deleteCookie(name: string): void {
    document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT`;
  }

  // Méthodes d'accès au token et au rôle
  getToken(): string | null {
    return this.getCookie('token');
  }

  getRole(): string | null {
    const token = this.getToken();
    if (token) {
      const decodedToken = this.decodeToken(token);
      return decodedToken.role || null;
    }
    return this.getCookie('role');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  isAdmin(): boolean {
    const role = this.getRole();
    return role === 'Admin';
  }

  // Méthodes utilitaires
  private getReturnUrl(): string {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('returnUrl') || '';
  }

  private canAccessUrl(url: string, role: string): boolean {
    // Vérifier si l'URL est accessible pour le rôle
    if (role === 'Admin') return true;
    return !url.includes('/dashboard');
  }

  // Méthode pour rafraîchir le token si nécessaire
  refreshToken(): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/api/Utilisateur/refresh-token`, {})
      .pipe(
        tap((response: LoginResponse) => {
          if (response && response.token) {
            this.setCookie('token', response.token, 2);
            this.setCookie('role', this.getRole() || '', 2);
            this.userRoleSubject.next(this.getRole());
          }
        })
      );
  }
} 