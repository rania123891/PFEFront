import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  NbCardModule,
  NbButtonModule,
  NbIconModule,
  NbCalendarModule,
  NbAlertModule,
  NbBadgeModule,
  NbButtonGroupModule,
  NbDatepickerModule,
  NbSpinnerModule
} from '@nebular/theme';

import { ThemeModule } from '../../@theme/theme.module';
import { ChronologieRoutingModule } from './chronologie-routing.module';
import { ChronologieComponent } from './chronologie.component';

@NgModule({
  declarations: [
    ChronologieComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ThemeModule,
    ChronologieRoutingModule,
    
    // Modules Nebular
    NbCardModule,
    NbButtonModule,
    NbIconModule,
    NbCalendarModule,
    NbAlertModule,
    NbBadgeModule,
    NbButtonGroupModule,
    NbDatepickerModule,
    NbSpinnerModule
  ]
})
export class ChronologieModule { } 