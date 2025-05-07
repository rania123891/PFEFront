import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NbCardModule, NbInputModule, NbButtonModule } from '@nebular/theme';
import { AjouterTableauComponent } from './ajouter-tableau.component';

@NgModule({
  declarations: [
    AjouterTableauComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    NbCardModule,
    NbInputModule,
    NbButtonModule
  ],
  exports: [
    AjouterTableauComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AjouterTableauModule { } 