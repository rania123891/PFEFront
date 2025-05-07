import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NbButtonModule, NbIconModule, NbInputModule, NbCardModule, NbBadgeModule, NbFormFieldModule, NbContextMenuModule } from '@nebular/theme';
import { ApiService, Tache } from '../../services/api.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'ngx-vue-calendrier',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NbButtonModule,
    NbIconModule,
    NbInputModule,
    NbCardModule,
    NbBadgeModule,
    NbFormFieldModule,
    NbContextMenuModule,
  ],
  template: `
    <div class="calendar-container">
      <!-- Barre d'outils du calendrier -->
      <div class="calendar-toolbar">
        <div class="search-box">
          <nb-form-field>
            <nb-icon nbPrefix icon="search-outline"></nb-icon>
            <input type="text" nbInput [(ngModel)]="searchTerm" placeholder="Rechercher dans le calendrier...">
          </nb-form-field>
        </div>
        <div class="calendar-actions">
          <button nbButton ghost (click)="previousMonth()">
            <nb-icon icon="chevron-left-outline"></nb-icon>
          </button>
          <button nbButton ghost (click)="goToToday()">Aujourd'hui</button>
          <button nbButton ghost (click)="nextMonth()">
            <nb-icon icon="chevron-right-outline"></nb-icon>
          </button>
          <h3>{{ currentMonthYear }}</h3>
          <button nbButton ghost>
            <nb-icon icon="share-outline"></nb-icon>
            Partager
          </button>
          <button nbButton ghost [nbContextMenu]="filterMenu">
            <nb-icon icon="funnel-outline"></nb-icon>
            Filtre
          </button>
          <button nbButton ghost>
            <nb-icon icon="more-horizontal-outline"></nb-icon>
          </button>
        </div>
      </div>

      <!-- Grille du calendrier -->
      <div class="calendar-grid">
        <!-- En-têtes des jours -->
        <div class="calendar-header">
          <div class="day-header" *ngFor="let day of weekDays">{{ day }}</div>
        </div>

        <!-- Cellules des jours -->
        <div class="calendar-body">
          <div class="week" *ngFor="let week of calendarDays">
            <div class="day" *ngFor="let day of week"
                 [class.today]="isToday(day.date)"
                 [class.other-month]="!isSameMonth(day.date)">
              <div class="day-number">{{ day.date | date:'d' }}</div>
              <div class="tasks">
                <div class="task" *ngFor="let task of day.tasks"
                     [style.background-color]="getTaskColor(task)">
                  <div class="task-content">
                    <div class="task-title">{{ task.titre }}</div>
                    <div class="task-actions">
                      <div class="task-date">{{ task.dateEcheance | date:'M/d/yy' }}</div>
                      <button nbButton ghost size="tiny" [nbContextMenu]="taskMenu">
                        <nb-icon icon="more-vertical-outline"></nb-icon>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .calendar-container {
      height: 100%;
      display: flex;
      flex-direction: column;
      background: white;
      border-radius: 0.5rem;
      padding: 1rem;
    }

    .calendar-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      gap: 1rem;

      .search-box {
        width: 300px;
      }

      .calendar-actions {
        display: flex;
        align-items: center;
        gap: 0.5rem;

        h3 {
          margin: 0 1rem;
          font-weight: 600;
        }
      }
    }

    .calendar-grid {
      flex: 1;
      display: flex;
      flex-direction: column;
      border: 1px solid #edf1f7;
      border-radius: 0.5rem;
      overflow: hidden;
    }

    .calendar-header {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      background: #f7f9fc;
      border-bottom: 1px solid #edf1f7;

      .day-header {
        padding: 0.5rem;
        text-align: center;
        font-weight: 600;
        color: #8f9bb3;
      }
    }

    .calendar-body {
      flex: 1;
      display: flex;
      flex-direction: column;

      .week {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        flex: 1;
        border-bottom: 1px solid #edf1f7;

        &:last-child {
          border-bottom: none;
        }
      }

      .day {
        padding: 0.5rem;
        border-right: 1px solid #edf1f7;
        min-height: 100px;
        position: relative;

        &:last-child {
          border-right: none;
        }

        &.today {
          background-color: #f0f6ff;
          .day-number {
            color: #3366ff;
            font-weight: 600;
          }
        }

        &.other-month {
          background-color: #fafafa;
          .day-number {
            color: #c5cee0;
          }
        }
      }

      .day-number {
        font-size: 0.875rem;
        margin-bottom: 0.5rem;
      }

      .tasks {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;

        .task {
          font-size: 0.75rem;
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          background: #edf1f7;
          color: #222b45;
          
          .task-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 0.5rem;
          }

          .task-title {
            flex: 1;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .task-actions {
            display: flex;
            align-items: center;
            gap: 0.25rem;
          }

          .task-date {
            font-size: 0.7rem;
            color: #8f9bb3;
          }

          button {
            padding: 0;
            min-width: 20px;
            height: 20px;
            line-height: 1;
          }
        }
      }
    }
  `]
})
export class VueCalendrierComponent implements OnInit {
  searchTerm: string = '';
  currentDate = new Date();
  weekDays = ['Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.', 'Dim.'];
  calendarDays: Array<Array<{date: Date, tasks: Tache[]}>> = [];
  filterMenu = [
    { title: 'Toutes les tâches' },
    { title: 'Mes tâches' },
    { title: 'Tâches en retard' },
    { title: 'Tâches à venir' }
  ];

  projetId: number;
  tableauId: number;
  taches: Tache[] = [];

  taskMenu = [
    { title: 'Modifier' },
    { title: 'Supprimer' }
  ];

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.projetId = +params['id'];
      this.tableauId = +params['tableauId'];
      this.loadTasks();
    });
    this.generateCalendar();
  }

  get currentMonthYear(): string {
    return this.currentDate.toLocaleString('fr-FR', { month: 'long', year: 'numeric' });
  }

  loadTasks() {
    this.apiService.getTableau(this.tableauId).subscribe(tableau => {
      this.taches = tableau.listes.reduce((acc, liste) => [...acc, ...liste.taches], [] as Tache[]);
      this.generateCalendar();
    });
  }

  generateCalendar() {
    const firstDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
    const lastDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);
    
    // Ajuster pour commencer par lundi
    let start = new Date(firstDay);
    start.setDate(start.getDate() - (start.getDay() === 0 ? 6 : start.getDay() - 1));
    
    let end = new Date(lastDay);
    end.setDate(end.getDate() + (7 - end.getDay()) % 7);

    this.calendarDays = [];
    let week: Array<{date: Date, tasks: Tache[]}> = [];
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dayTasks = this.taches.filter(task => {
        const taskDate = new Date(task.dateEcheance);
        return taskDate.getDate() === d.getDate() &&
               taskDate.getMonth() === d.getMonth() &&
               taskDate.getFullYear() === d.getFullYear();
      });
      
      week.push({
        date: new Date(d),
        tasks: dayTasks
      });
      
      if (week.length === 7) {
        this.calendarDays.push(week);
        week = [];
      }
    }
  }

  previousMonth() {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1);
    this.generateCalendar();
  }

  nextMonth() {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1);
    this.generateCalendar();
  }

  goToToday() {
    this.currentDate = new Date();
    this.generateCalendar();
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  }

  isSameMonth(date: Date): boolean {
    return date.getMonth() === this.currentDate.getMonth();
  }

  getTaskColor(task: Tache): string {
    // Vous pouvez personnaliser les couleurs en fonction de la priorité ou du statut
    switch (task.priorite) {
      case 0: return '#e7f5ff'; // Faible
      case 1: return '#fff3e0'; // Moyenne
      case 2: return '#ffe0e0'; // Élevée
      default: return '#edf1f7';
    }
  }
} 