import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ProjetRoutingModule } from './projet-routing.module';
import {
  NbCardModule,
  NbIconModule,
  NbInputModule,
  NbButtonModule,
  NbSelectModule,
  NbUserModule,
  NbDatepickerModule,
  NbDialogModule,
  NbFormFieldModule,
  NbListModule,
  NbContextMenuModule,
  NbLayoutModule,
  NbSidebarModule,
  NbMenuModule,
  NbActionsModule,
  NbBadgeModule,
  NbProgressBarModule,
  NbTooltipModule,
  NbToastrModule,
  NbOptionModule,
  NbSpinnerModule,
  NbAlertModule,
} from '@nebular/theme';
import { ToastrModule } from 'ngx-toastr';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { ProjetComponent } from './projet.component';
import { ListeProjetsComponent } from './liste-projets/liste-projets.component';
import { TousProjetsComponent } from './tous-projets/tous-projets.component';
import { ListeComponent } from './tableau/liste/liste.component';
import { CommentaireComponent } from './tableau/tache-dialog/commentaire.component';
import { AjouterProjetComponent } from './ajouter-projet/ajouter-projet.component';
import { ModifierProjetComponent } from './modifier-projet/modifier-projet.component';
import { ConfirmationDialogComponent } from './confirmation-dialog/confirmation-dialog.component';
import { ApiService } from './services/api.service';
import { ProjetMenuService } from './services/projet-menu.service';
import { ListeEquipesComponent } from './equipes/liste-equipes.component';
import { ModifierEquipeComponent } from './equipes/modifier-equipe.component';
import { AjouterTableauModule } from './tableau/ajouter-tableau/ajouter-tableau.module';
import { ResumeComponent } from './resume/resume.component';
import { AttachmentUploadComponent } from './tableau/attachments/attachment-upload.component';

@NgModule({
  declarations: [
    ProjetComponent,
    ListeProjetsComponent,
    TousProjetsComponent,
    ListeComponent,
    CommentaireComponent,
    AjouterProjetComponent,
    ModifierProjetComponent,
    ConfirmationDialogComponent,
    ListeEquipesComponent,
    ModifierEquipeComponent,
    ResumeComponent,
    AttachmentUploadComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    HttpClientModule,
    DragDropModule,
    ProjetRoutingModule,
    NbCardModule,
    NbIconModule,
    NbInputModule,
    NbButtonModule,
    NbSelectModule,
    NbUserModule,
    NbDatepickerModule,
    NbDialogModule.forChild(),
    NbFormFieldModule,
    NbListModule,
    NbContextMenuModule,
    NbLayoutModule,
    NbSidebarModule,
    NbMenuModule,
    NbActionsModule,
    NbBadgeModule,
    NbProgressBarModule,
    NbTooltipModule,
    NbToastrModule,
    NbOptionModule,
    NbSpinnerModule,
    NbAlertModule,
    AjouterTableauModule,
    NgxChartsModule
  ],
  providers: [
    ApiService,
    ProjetMenuService,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  exports: [
    ResumeComponent,
    AttachmentUploadComponent
  ]
})
export class ProjetModule { }
