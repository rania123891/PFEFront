import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpEvent, HttpEventType } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface FileUploadResponse {
  id: string;
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
  uploadDate: string;
  uploadedBy: string;
}

export interface FileMessage {
  id?: string;
  contenu: string;
  expediteurId: string;
  destinataireId: string;
  expediteurEmail: string;
  emailDestinataire: string;
  fileId?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
}

@Injectable({
  providedIn: 'root'
})
export class FileService {
  private baseUrl = `${environment.apiUrl}/file`;

  constructor(private http: HttpClient) {}

  // Upload d'un fichier
  uploadFile(file: File, expediteurId: string, destinataireId: string): Observable<FileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('expediteurId', expediteurId);
    formData.append('destinataireId', destinataireId);

    return this.http.post<FileUploadResponse>(`${this.baseUrl}/upload`, formData)
      .pipe(
        catchError(error => {
          console.error('Erreur upload fichier:', error);
          return throwError(error);
        })
      );
  }

  // Télécharger un fichier
  downloadFile(fileId: string, fileName: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/download/${fileId}`, {
      responseType: 'blob'
    }).pipe(
      catchError(error => {
        console.error('Erreur téléchargement fichier:', error);
        return throwError(error);
      })
    );
  }

  // Obtenir l'URL de prévisualisation pour les images
  getFilePreviewUrl(fileId: string): string {
    return `${this.baseUrl}/preview/${fileId}`;
  }

  // Vérifier si le fichier est une image
  isImageFile(mimeType: string): boolean {
    return mimeType?.startsWith('image/') || false;
  }

  // Obtenir l'icône du fichier selon son type
  getFileIcon(mimeType: string): string {
    if (this.isImageFile(mimeType)) {
      return 'image-outline';
    }
    
    switch (mimeType) {
      case 'application/pdf':
        return 'file-text-outline';
      case 'application/msword':
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return 'file-text-outline';
      case 'application/vnd.ms-excel':
      case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
        return 'grid-outline';
      case 'application/zip':
      case 'application/x-rar-compressed':
        return 'archive-outline';
      default:
        return 'attach-outline';
    }
  }

  // Télécharger et sauvegarder le fichier
  downloadAndSave(fileId: string, fileName: string): void {
    this.downloadFile(fileId, fileName).subscribe({
      next: (blob) => {
        // Créer un lien de téléchargement
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Erreur lors du téléchargement:', error);
      }
    });
  }
} 