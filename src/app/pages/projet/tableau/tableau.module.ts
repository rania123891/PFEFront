import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { 
  NbCardModule, 
  NbIconModule, 
  NbInputModule, 
  NbButtonModule,
  NbFormFieldModule,
  NbDialogModule,
  NbSelectModule,
  NbToastrModule,
  NbContextMenuModule,
  NbDatepickerModule
} from '@nebular/theme';
import { TableauRoutingModule } from './tableau-routing.module';
import { TableauComponent } from './tableau.component';
import { TableauDialogComponent } from './tableau-dialog/tableau-dialog.component';
import { ListeDialogComponent } from './liste-dialog/liste-dialog.component';
import { VueTableauComponent } from './vue-tableau/vue-tableau.component';

@NgModule({
  declarations: [
    TableauDialogComponent,
    ListeDialogComponent,
    VueTableauComponent
  ],
  imports: [
    CommonModule,
    TableauRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NbCardModule,
    NbIconModule,
    NbInputModule,
    NbButtonModule,
    NbFormFieldModule,
    NbDialogModule.forChild(),
    NbSelectModule,
    NbToastrModule,
    NbContextMenuModule,
    NbDatepickerModule,
    TableauComponent
  ]
})
export class TableauModule { } 