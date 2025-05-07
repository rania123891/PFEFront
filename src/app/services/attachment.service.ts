import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AttachmentService {
  private apiUrl = `${environment.apis.projet}/attachments`;

  constructor(private http: HttpClient) { }

  uploadAttachment(file: File, projectId: number): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('projectId', projectId.toString());
    
    return this.http.post(`${this.apiUrl}/upload`, formData);
  }

  getAttachments(projectId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${projectId}`);
  }

  deleteAttachment(attachmentId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${attachmentId}`);
  }
} 