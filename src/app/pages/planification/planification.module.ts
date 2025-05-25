import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PlanificationComponent } from './planification.component';
import {
  NbCardModule,
  NbIconModule,
  NbInputModule,
  NbButtonModule,
  NbSelectModule,
  NbDatepickerModule,
  NbUserModule,
  NbActionsModule,
  NbSpinnerModule,
  NbTooltipModule,
  NbOptionModule,
} from '@nebular/theme';

@NgModule({
  declarations: [
    PlanificationComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NbCardModule,
    NbIconModule,
    NbInputModule,
    NbButtonModule,
    NbSelectModule,
    NbDatepickerModule,
    NbUserModule,
    NbActionsModule,
    NbSpinnerModule,
    NbTooltipModule,
    NbOptionModule,
    RouterModule.forChild([
      {
        path: '',
        component: PlanificationComponent,
      }
    ])
  ]
})
export class PlanificationModule { } 