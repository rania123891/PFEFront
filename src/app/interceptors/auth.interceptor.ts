import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { NbToastrService } from '@nebular/theme';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private router: Router,
    private toastrService: NbToastrService
  ) {}

  // Méthode pour récupérer un cookie
  private getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  }

  // Méthode pour supprimer un cookie
  private deleteCookie(name: string): void {
    document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT`;
  }

  private isTokenExpired(token: string): boolean {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return true;
      
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
      const currentTime = Math.floor(Date.now() / 1000);
      
      return payload.exp < currentTime;
    } catch (error) {
      return true;
    }
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.getCookie('token');
    
    if (token) {
      // Vérifier si le token est expiré
      if (this.isTokenExpired(token)) {
        console.log('Token expiré détecté, nettoyage des cookies');
        this.deleteCookie('token');
        this.deleteCookie('role');
        
        // Ne pas ajouter le token expiré aux headers
        if (!request.url.includes('/login')) {
          this.toastrService.danger(
            'Votre session a expiré. Veuillez vous reconnecter.',
            'Session expirée'
          );
          this.router.navigate(['/auth/login']);
          return throwError(() => new Error('Token expiré'));
        }
      } else {
        console.log('AuthInterceptor - Token valide trouvé, ajout aux headers');
        request = request.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        });
      }
    } else {
      console.log('AuthInterceptor - Aucun token trouvé');
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('AuthInterceptor - Erreur interceptée:', error);
        
        if (error.status === 401) {
          console.log('Erreur 401 interceptée - Session expirée');
          
          // Nettoyer les cookies
          this.deleteCookie('token');
          this.deleteCookie('role');
          
          // Afficher le message d'erreur
          this.toastrService.danger(
            'Votre session a expiré. Veuillez vous reconnecter.',
            'Session expirée'
          );
          
          // Rediriger vers la page de connexion
          this.router.navigate(['/auth/login']);
        }
        
        return throwError(() => error);
      })
    );
  }
} 