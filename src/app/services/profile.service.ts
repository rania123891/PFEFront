import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private apiUrl = environment.apis.user + '/Utilisateur';

  constructor(private http: HttpClient) { }

  getUserProfile(userId: number): Observable<any> {
    console.log('🔍 getUserProfile - URL:', `${this.apiUrl}/${userId}`);
    return this.http.get(`${this.apiUrl}/${userId}`).pipe(
      tap(response => console.log('✅ getUserProfile réussi:', response)),
      catchError(error => {
        console.error('❌ getUserProfile échoué:', error);
        return of(null);
      })
    );
  }

  uploadProfilePhoto(file: File, userId?: number): Observable<any> {
    const formData = new FormData();
    formData.append('Photo', file);
    
    // 🚧 Temporaire : ajouter l'UserId dans le FormData
    if (userId) {
      formData.append('UserId', userId.toString());
      console.log('🆔 UserId ajouté au FormData:', userId);
    }
    
    console.log('🚀 Upload Photo - Détails:');
    console.log('- URL:', `${this.apiUrl}/upload-photo`);
    console.log('- File name:', file.name);
    console.log('- File size:', file.size);
    console.log('- File type:', file.type);
    
    // Debug: vérifier le contenu du FormData
    console.log('📦 FormData contents:');
    for (let pair of (formData as any).entries()) {
      console.log(`  ${pair[0]}:`, pair[1]);
    }
    
    // Créer des headers explicites pour debug
    const headers = new HttpHeaders();
    // Ne pas définir Content-Type pour multipart/form-data, Angular le fera automatiquement
    
    console.log('📨 Envoi de la requête...');
    return this.http.post(`${this.apiUrl}/upload-photo`, formData, { headers }).pipe(
      tap(response => {
        console.log('✅ Upload réussi:', response);
      }),
      catchError(error => {
        console.error('❌ Upload échoué - Détails complets:', {
          status: error.status,
          statusText: error.statusText,
          error: error.error,
          message: error.message,
          url: error.url,
          ok: error.ok,
          type: error.type
        });
        throw error; // Re-lancer l'erreur pour que le composant puisse la gérer
      })
    );
  }

  // Méthode de test pour vérifier la communication
  testUpload(): Observable<any> {
    const testUrl = `${this.apiUrl}/test-upload`;
    console.log('🧪 Test URL:', testUrl);
    
    return this.http.post(testUrl, {}).pipe(
      tap(response => {
        console.log('✅ Test backend réussi:', response);
      }),
      catchError(error => {
        console.error('❌ Test backend échoué:', error);
        throw error;
      })
    );
  }

  // 🚧 Méthode temporaire pour tester l'interface sans backend
  uploadProfilePhotoMock(file: File): Observable<any> {
    console.log('🎭 Mode MOCK - Simulation d\'upload:', file.name);
    
    // Simuler un délai d'upload avec Observable
    return new Observable(observer => {
      setTimeout(() => {
        const mockUrl = `http://localhost:5093/uploads/profile-photos/${Date.now()}_${file.name}`;
        observer.next({ PhotoUrl: mockUrl, status: 'success' });
        observer.complete();
      }, 1000);
    });
  }
} 