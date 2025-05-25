import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import {
  NbActionsModule,
  NbButtonModule,
  NbCardModule,
  NbIconModule,
  NbInputModule,
  NbSelectModule,
  NbUserModule,
  NbLayoutModule,
  NbMenuModule,
  NbSpinnerModule,
  NbProgressBarModule,
  NbToastrModule,
} from '@nebular/theme';

import { ThemeModule } from '../../@theme/theme.module';
import { PredictionsComponent } from './predictions.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild([
      {
        path: '',
        component: PredictionsComponent,
      },
    ]),
    ThemeModule,
    NbActionsModule,
    NbButtonModule,
    NbCardModule,
    NbIconModule,
    NbInputModule,
    NbSelectModule,
    NbUserModule,
    NbLayoutModule,
    NbMenuModule,
    NbSpinnerModule,
    NbProgressBarModule,
    NbToastrModule,
  ],
  declarations: [
    PredictionsComponent,
  ],
})
export class PredictionsModule { } 