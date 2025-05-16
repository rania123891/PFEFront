import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { EquipesComponent } from './equipes.component';
import { MembresEquipeSharedModule } from './membres-equipe/membres-equipe.module';
import { MembresEquipeComponent } from './membres-equipe/membres-equipe.component';
import {
  NbCardModule,
  NbIconModule,
  NbInputModule,
  NbButtonModule,
  NbSelectModule,
  NbFormFieldModule,
  NbToastrModule,
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
    NbToastrModule,
    MembresEquipeSharedModule,
    RouterModule.forChild([
      {
        path: '',
        component: EquipesComponent,
      },
      {
        path: 'membres',
        component: MembresEquipeComponent,
      },
      {
        path: ':id/membres',
        component: MembresEquipeComponent,
      }
    ]),
  ],
  declarations: [
    EquipesComponent,
  ],
})
export class EquipesModule { } 