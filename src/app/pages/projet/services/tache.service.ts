import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface TacheGanttDto {
  id?: number;
  name: string;
  start: string;
  end: string;
  progress?: number;
  dependencies?: string;
}

@Injectable({ providedIn: 'root' })
export class TacheService {
  private apiUrl = 'http://localhost:5093/projet/api/taches';

  constructor(private http: HttpClient) {}

  getTachesGantt(): Observable<TacheGanttDto[]> {
    return this.http.get<TacheGanttDto[]>(`${this.apiUrl}/gantt`);
  }
} 