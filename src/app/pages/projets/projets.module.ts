import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ProjetsComponent } from './projets.component';
import { AffectationEquipesComponent } from './affectation-equipes/affectation-equipes.component';
import {
  NbCardModule,
  NbIconModule,
  NbInputModule,
  NbButtonModule,
  NbBadgeModule,
  NbDialogModule,
  NbSelectModule,
  NbDatepickerModule,
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
    NbBadgeModule,
    NbSelectModule,
    NbDatepickerModule,
    NbSpinnerModule,
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
    AffectationEquipesComponent,
  ],
})
export class ProjetsModule { } 