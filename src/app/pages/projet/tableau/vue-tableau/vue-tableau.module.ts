import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { 
  NbButtonModule, 
  NbIconModule, 
  NbCardModule, 
  NbBadgeModule, 
  NbFormFieldModule,
  NbInputModule,
  NbContextMenuModule,
  NbDatepickerModule,
  NbSelectModule
} from '@nebular/theme';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { VueTableauComponent } from './vue-tableau.component';

@NgModule({
  declarations: [VueTableauComponent],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    NbButtonModule,
    NbIconModule,
    NbCardModule,
    NbBadgeModule,
    NbFormFieldModule,
    NbInputModule,
    NbContextMenuModule,
    NbDatepickerModule,
    NbSelectModule
  ],
  exports: [VueTableauComponent]
})
export class VueTableauModule { } 