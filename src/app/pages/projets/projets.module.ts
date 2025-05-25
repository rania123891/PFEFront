import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ProjetsComponent } from './projets.component';
import {
  NbCardModule,
  NbIconModule,
  NbInputModule,
  NbButtonModule,
  NbBadgeModule,
  NbDialogModule,
  NbSelectModule,
  NbDatepickerModule,
} from '@nebular/theme';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NbCardModule,
    NbIconModule,
    NbInputModule,
    NbButtonModule,
    NbBadgeModule,
    NbSelectModule,
    NbDatepickerModule,
    NbDialogModule.forChild(),
    RouterModule.forChild([
      {
        path: '',
        component: ProjetsComponent,
      },
    ]),
  ],
  declarations: [
    ProjetsComponent,
  ],
})
export class ProjetsModule { } 