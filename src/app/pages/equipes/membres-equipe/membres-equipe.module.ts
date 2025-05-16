import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MembresEquipeComponent } from './membres-equipe.component';
import {
  NbCardModule,
  NbIconModule,
  NbInputModule,
  NbButtonModule,
  NbSelectModule,
  NbFormFieldModule,
  NbSpinnerModule,
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
    NbSelectModule,
    NbFormFieldModule,
    NbSpinnerModule,
  ],
  declarations: [
    MembresEquipeComponent
  ],
  exports: [
    MembresEquipeComponent
  ]
})
export class MembresEquipeSharedModule { } 