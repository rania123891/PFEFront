import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { TacheService, TacheGanttDto } from '../services/tache.service';
import 'dhtmlx-gantt';

// Déclaration du type gantt global
declare let gantt: any;

@Component({
  selector: 'ngx-timeline',
  template: `
    <div class="timeline-container">
      <h2>Chronologie des tâches (Gantt)</h2>
      <div *ngIf="chargementEnCours" class="loading-container">
        <nb-spinner size="large"></nb-spinner>
        <p>Chargement des tâches...</p>
      </div>
      <div [style.height.px]="500" #gantt></div>
    </div>
  `,
  styleUrls: ['./timeline.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TimelineComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('gantt') ganttContainer!: ElementRef;
  chargementEnCours = true;

  constructor(private tacheService: TacheService) {
    // Configuration de base
    gantt.config.date_format = "%Y-%m-%d";
    gantt.config.scale_unit = "day";
    gantt.config.duration_unit = "day";
    gantt.config.row_height = 30;
    gantt.config.min_column_width = 40;
    gantt.config.scale_height = 60;

    // Configuration en français
    gantt.i18n.setLocale('fr');

    // Configuration de l'échelle de temps
    gantt.config.scales = [
      { unit: "month", step: 1, format: "%F %Y" },
      { unit: "day", step: 1, format: "%d %M" }
    ];

    // Configuration des colonnes
    gantt.config.columns = [
      { name: "text", label: "Nom de la tâche", width: 200, tree: true },
      { name: "start_date", label: "Date de début", align: "center", width: 100 },
      { name: "duration", label: "Durée (jours)", align: "center", width: 100 }
    ];

    // Configuration supplémentaire
    gantt.config.show_progress = true;
    gantt.config.show_grid = true;
    gantt.config.show_chart = true;
  }

  ngOnInit(): void {
    this.loadTaches();
  }

  ngAfterViewInit(): void {
    gantt.init(this.ganttContainer.nativeElement);
  }

  ngOnDestroy(): void {
    gantt.clearAll();
  }

  private formatDate(dateStr: string): Date {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        return new Date();
      }
      return date;
    } catch (error) {
      console.error('Erreur de formatage de date:', error);
      return new Date();
    }
  }

  loadTaches() {
    this.chargementEnCours = true;
    this.tacheService.getTachesGantt().subscribe({
      next: (data) => {
        console.log('Données brutes reçues de l\'API:', data);

        if (!data || !Array.isArray(data) || data.length === 0) {
          console.log('Aucune donnée reçue ou format invalide');
          this.chargementEnCours = false;
          return;
        }

        const tasks = {
          data: data.filter(tache => tache && tache.name && tache.start && tache.end)
            .map(tache => ({
              id: tache.id?.toString() || Math.random().toString(),
              text: tache.name,
              start_date: this.formatDate(tache.start),
              end_date: this.formatDate(tache.end),
              progress: (tache.progress || 0) / 100,
              parent: 0
            }))
        };

        console.log('Tâches formatées pour Gantt:', tasks);
        gantt.parse(tasks);
        this.chargementEnCours = false;
      },
      error: (error) => {
        console.error('Erreur lors de la récupération des tâches:', error);
        this.chargementEnCours = false;
      }
    });
  }
} 