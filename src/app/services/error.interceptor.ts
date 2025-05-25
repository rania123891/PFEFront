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
import { NbToastrService } from '@nebular/theme';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private toastrService: NbToastrService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Une erreur est survenue';
        
        if (error.status === 0) {
          errorMessage = 'Impossible de contacter le serveur. Vérifiez votre connexion ou que le serveur est bien démarré.';
        } else if (error.status === 404) {
          errorMessage = 'La ressource demandée n\'existe pas.';
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        }

        this.toastrService.danger(errorMessage, 'Erreur');
        return throwError(() => error);
      })
    );
  }
} 