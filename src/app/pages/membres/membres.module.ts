import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  NbCardModule,
  NbSelectModule,
  NbInputModule,
  NbButtonModule,
  NbIconModule,
  NbUserModule,
  NbActionsModule
} from '@nebular/theme';

import { MembresComponent } from './membres.component';

@NgModule({
  declarations: [
    MembresComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NbCardModule,
    NbSelectModule,
    NbInputModule,
    NbButtonModule,
    NbIconModule,
    NbUserModule,
    NbActionsModule,
    RouterModule.forChild([
      {
        path: '',
        component: MembresComponent
      }
    ])
  ]
})
export class MembresModule { } 