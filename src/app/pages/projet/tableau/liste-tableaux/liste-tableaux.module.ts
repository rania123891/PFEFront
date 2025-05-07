import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NbCardModule, NbIconModule, NbButtonModule } from '@nebular/theme';
import { ListeTableauxComponent } from './liste-tableaux.component';

@NgModule({
  declarations: [
    ListeTableauxComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    NbCardModule,
    NbIconModule,
    NbButtonModule
  ],
  exports: [
    ListeTableauxComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ListeTableauxModule { } 