import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface ProjectStats {
  totalTasks: number;
  completedTasks: number;
  lateTasks: number;
  inProgressTasks: number;
  activeProjects: number;
  completedProjects: number;
  mostActiveTeam: string;
  averageTaskCompletionTime: number;
}

export interface ProjectTimeline {
  projectId: string;
  projectName: string;
  startDate: Date;
  endDate: Date;
  progress: number;
  tasks: {
    taskId: string;
    taskName: string;
    startDate: Date;
    endDate: Date;
    status: 'completed' | 'in-progress' | 'late';
  }[];
}

@Injectable()
export class ProjectStatsService {
  private mockStats: ProjectStats = {
    totalTasks: 150,
    completedTasks: 85,
    lateTasks: 15,
    inProgressTasks: 50,
    activeProjects: 12,
    completedProjects: 8,
    mostActiveTeam: 'Équipe Alpha',
    averageTaskCompletionTime: 4.5, // en jours
  };

  private mockTimeline: ProjectTimeline[] = [
    {
      projectId: '1',
      projectName: 'Projet A',
      startDate: new Date('2024-03-01'),
      endDate: new Date('2024-06-30'),
      progress: 65,
      tasks: [
        {
          taskId: '1-1',
          taskName: 'Phase 1',
          startDate: new Date('2024-03-01'),
          endDate: new Date('2024-04-15'),
          status: 'completed',
        },
        {
          taskId: '1-2',
          taskName: 'Phase 2',
          startDate: new Date('2024-04-16'),
          endDate: new Date('2024-05-30'),
          status: 'in-progress',
        },
      ],
    },
    // Ajoutez d'autres projets ici
  ];

  getProjectStats(): Observable<ProjectStats> {
    return of(this.mockStats);
  }

  getProjectTimeline(): Observable<ProjectTimeline[]> {
    return of(this.mockTimeline);
  }
} 