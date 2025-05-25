import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TachesComponent } from './taches.component';
import {
  NbCardModule,
  NbIconModule,
  NbInputModule,
  NbButtonModule,
  NbSelectModule,
  NbDatepickerModule,
  NbBadgeModule,
  NbSpinnerModule
} from '@nebular/theme';

@NgModule({
  declarations: [
    TachesComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NbCardModule,
    NbIconModule,
    NbInputModule,
    NbButtonModule,
    NbSelectModule,
    NbDatepickerModule,
    NbBadgeModule,
    NbSpinnerModule,
    RouterModule.forChild([
      {
        path: '',
        component: TachesComponent,
      }
    ])
  ]
})
export class TachesModule { } 