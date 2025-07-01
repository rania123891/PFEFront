import { NgModule } from '@angular/core';
import {
  NbActionsModule,
  NbButtonModule,
  NbCardModule,
  NbTabsetModule,
  NbUserModule,
  NbRadioModule,
  NbSelectModule,
  NbListModule,
  NbIconModule,
  NbSpinnerModule,
} from '@nebular/theme';
import { NgxEchartsModule } from 'ngx-echarts';

import { ThemeModule } from '../../@theme/theme.module';
import { DashboardComponent } from './dashboard.component';

// Nouveaux composants
import { OverviewCardComponent } from './overview-card/overview-card.component';
import { TaskStatusChartComponent } from './task-status-chart/task-status-chart.component';
import { TaskPriorityChartComponent } from './task-priority-chart/task-priority-chart.component';
import { ProjectsTrendChartComponent } from './projects-trend-chart/projects-trend-chart.component';
import { PlanningChartComponent } from './planning-chart/planning-chart.component';
import { RecentActivityComponent } from './recent-activity/recent-activity.component';
import { ProjectsProgressComponent } from './projects-progress/projects-progress.component';
import { QuickActionsComponent } from './quick-actions/quick-actions.component';
import { TeamsOverviewComponent } from './teams-overview/teams-overview.component';

// Anciens composants (gardés pour compatibilité)
import { StatusCardComponent } from './status-card/status-card.component';
import { ContactsComponent } from './contacts/contacts.component';
import { RoomsComponent } from './rooms/rooms.component';
import { RoomSelectorComponent } from './rooms/room-selector/room-selector.component';
import { TemperatureComponent } from './temperature/temperature.component';
import { TemperatureDraggerComponent } from './temperature/temperature-dragger/temperature-dragger.component';
import { KittenComponent } from './kitten/kitten.component';
import { SecurityCamerasComponent } from './security-cameras/security-cameras.component';
import { ElectricityComponent } from './electricity/electricity.component';
import { ElectricityChartComponent } from './electricity/electricity-chart/electricity-chart.component';
import { WeatherComponent } from './weather/weather.component';
import { SolarComponent } from './solar/solar.component';
import { PlayerComponent } from './rooms/player/player.component';
import { TrafficComponent } from './traffic/traffic.component';
import { TrafficChartComponent } from './traffic/traffic-chart.component';
import { FormsModule } from '@angular/forms';
import { ProjectStatsComponent } from './project-stats/project-stats.component';
import { ProjectTimelineComponent } from './project-timeline/project-timeline.component';
import { ProjectStatsService } from '../../@core/data/project-stats';

// Services
import { StatistiqueService } from '../../services/statistique.service';
import { DashboardService } from '../../services/dashboard.service';
import { EquipeService } from '../../services/equipe.service';

@NgModule({
  imports: [
    FormsModule,
    ThemeModule,
    NbCardModule,
    NbUserModule,
    NbButtonModule,
    NbTabsetModule,
    NbActionsModule,
    NbRadioModule,
    NbSelectModule,
    NbListModule,
    NbIconModule,
    NbButtonModule,
    NbSpinnerModule,
    NgxEchartsModule,
  ],
  declarations: [
    DashboardComponent,
    
    // Nouveaux composants
    OverviewCardComponent,
    TaskStatusChartComponent,
    TaskPriorityChartComponent,
    ProjectsTrendChartComponent,
    PlanningChartComponent,
    RecentActivityComponent,
    ProjectsProgressComponent,
    QuickActionsComponent,
    TeamsOverviewComponent,
    
    // Anciens composants (gardés pour compatibilité)
    StatusCardComponent,
    TemperatureDraggerComponent,
    ContactsComponent,
    RoomSelectorComponent,
    TemperatureComponent,
    RoomsComponent,
    KittenComponent,
    SecurityCamerasComponent,
    ElectricityComponent,
    ElectricityChartComponent,
    WeatherComponent,
    PlayerComponent,
    SolarComponent,
    TrafficComponent,
    TrafficChartComponent,
    ProjectStatsComponent,
    ProjectTimelineComponent,
  ],
  providers: [
    ProjectStatsService,
    StatistiqueService,
    DashboardService,
    EquipeService,
  ],
})
export class DashboardModule { }
