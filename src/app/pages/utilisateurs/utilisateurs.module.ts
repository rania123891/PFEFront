import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { 
  NbCardModule, 
  NbIconModule, 
  NbButtonModule, 
  NbBadgeModule, 
  NbDialogModule,
  NbInputModule,
  NbSelectModule,
} from '@nebular/theme';
import { ListeUtilisateursComponent } from './liste-utilisateurs/liste-utilisateurs.component';

const routes: Routes = [
  {
    path: 'liste',
    component: ListeUtilisateursComponent,
  },
];

@NgModule({
  declarations: [
    ListeUtilisateursComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    NbCardModule,
    NbIconModule,
    NbButtonModule,
    NbBadgeModule,
    NbDialogModule.forChild(),
    NbInputModule,
    NbSelectModule,
  ],
})
export class UtilisateursModule { } 