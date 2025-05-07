import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import {
  NbCardModule,
  NbInputModule,
  NbButtonModule,
  NbRadioModule,
  NbCheckboxModule,
  NbSelectModule,
} from '@nebular/theme';
import { FeedbackFormComponent } from './feedback-form.component';

const routes: Routes = [
  {
    path: '',
    component: FeedbackFormComponent,
  },
];

@NgModule({
  declarations: [
    FeedbackFormComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    NbCardModule,
    NbInputModule,
    NbButtonModule,
    NbRadioModule,
    NbCheckboxModule,
    NbSelectModule,
  ],
})
export class FeedbackFormModule { } 