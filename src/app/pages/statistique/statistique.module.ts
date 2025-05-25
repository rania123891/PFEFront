import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import {
  NbCardModule,
  NbIconModule,
  NbSpinnerModule,
  NbButtonModule,
  NbSelectModule,
  NbDatepickerModule,
  NbInputModule,
} from '@nebular/theme';

import { NgxEchartsModule } from 'ngx-echarts';
import { ThemeModule } from '../../@theme/theme.module';
import { StatistiqueComponent } from './statistique.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ThemeModule,
    NbCardModule,
    NbIconModule,
    NbSpinnerModule,
    NbButtonModule,
    NbSelectModule,
    NbDatepickerModule,
    NbInputModule,
    NgxEchartsModule,
    RouterModule.forChild([
      {
        path: '',
        component: StatistiqueComponent,
      },
    ]),
  ],
  declarations: [
    StatistiqueComponent,
  ],
})
export class StatistiqueModule { } 