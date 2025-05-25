import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MembresEquipeComponent } from './equipes/membres-equipe/membres-equipe.component';
import { MembresEquipeSharedModule } from './equipes/membres-equipe/membres-equipe.module';

@NgModule({
  imports: [
    CommonModule,
    MembresEquipeSharedModule,
    RouterModule.forChild([
      {
        path: '',
        component: MembresEquipeComponent,
      }
    ]),
  ],
})
export class MembresModule { } 