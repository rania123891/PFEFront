import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ListeEquipesComponent } from './liste-equipes.component';
import { ModifierEquipeComponent } from './modifier-equipe.component';

const routes: Routes = [
  {
    path: '',
    component: ListeEquipesComponent,
  },
  {
    path: 'ajouter',
    component: ModifierEquipeComponent,
  },
  {
    path: ':id',
    component: ModifierEquipeComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EquipesRoutingModule { } 