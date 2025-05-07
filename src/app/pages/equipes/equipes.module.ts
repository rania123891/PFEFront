import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NbCardModule, NbButtonModule, NbIconModule, NbInputModule, NbSelectModule, NbSpinnerModule, NbBadgeModule, NbDialogModule, NbRadioModule } from '@nebular/theme';

import { ListeEquipesComponent } from './liste-equipes.component';
import { ModifierEquipeComponent } from './modifier-equipe.component';
import { EquipeService } from './equipe.service';
import { AjouterMembreDialogComponent } from './ajouter-membre-dialog.component';
import { EquipesComponent } from './equipes.component';
import { TeamMemberService } from '../../services/team-member.service';
import { UserService } from '../../services/user.service';

@NgModule({
  declarations: [
    ListeEquipesComponent,
    ModifierEquipeComponent,
    AjouterMembreDialogComponent,
    EquipesComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule.forChild([
      { path: '', component: ListeEquipesComponent },
      { path: 'ajouter', component: ModifierEquipeComponent },
      { path: 'modifier/:id', component: ModifierEquipeComponent }
    ]),
    NbCardModule,
    NbButtonModule,
    NbIconModule,
    NbInputModule,
    NbSelectModule,
    NbSpinnerModule,
    NbBadgeModule,
    NbRadioModule,
    NbDialogModule.forChild()
  ],
  providers: [
    EquipeService,
    TeamMemberService,
    UserService
  ],
  exports: [ListeEquipesComponent, EquipesComponent]
})
export class EquipesModule { } 