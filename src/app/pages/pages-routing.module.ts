import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { PagesComponent } from './pages.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AdminGuard } from '../auth/admin.guard';

const routes: Routes = [{
  path: '',
  component: PagesComponent,
  children: [
    {
      path: 'assistant',
      loadChildren: () => import('./assistant/assistant.module')
        .then(m => m.AssistantModule),
    },
    {
      path: 'dashboard',
      component: DashboardComponent,
    },
    {
      path: 'profile',
      loadChildren: () => import('./profile/profile.module')
        .then(m => m.ProfileModule),
    },
    {
      path: 'messages',
      loadChildren: () => import('./messages/messages.module').then(m => m.MessagesModule),
    },
    {
      path: 'projets',
      loadChildren: () => import('./projets/projets.module')
        .then(m => m.ProjetsModule),
      canActivate: [AdminGuard],
    },
    {
      path: 'taches',
      loadChildren: () => import('./taches/taches.module')
        .then(m => m.TachesModule),
      canActivate: [AdminGuard],
    },
    {
      path: 'equipes',
      loadChildren: () => import('./equipes/equipes.module')
        .then(m => m.EquipesModule),
      canActivate: [AdminGuard],
    },
    {
      path: 'utilisateurs',
      loadChildren: () => import('./utilisateurs/utilisateurs.module')
        .then(m => m.UtilisateursModule),
      canActivate: [AdminGuard],
    },
    {
      path: 'planification',
      loadChildren: () => import('./planification/planification.module')
        .then(m => m.PlanificationModule),
    },
    {
      path: 'chronologie',
      loadChildren: () => import('./chronologie/chronologie.module').then(m => m.ChronologieModule),
    },
    {
      path: 'predictions',
      loadChildren: () => import('./predictions/predictions.module')
        .then(m => m.PredictionsModule),
    },
    {
      path: 'statistique',
      loadChildren: () => import('./statistique/statistique.module')
        .then(m => m.StatistiqueModule),
    },
    {
      path: '',
      redirectTo: 'dashboard',
      pathMatch: 'full',
    },
    {
      path: '**',
      redirectTo: 'dashboard',
    },
  ],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagesRoutingModule {
}
