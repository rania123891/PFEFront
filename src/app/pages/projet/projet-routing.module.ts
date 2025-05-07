import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProjetComponent } from './projet.component';
import { ListeProjetsComponent } from './liste-projets/liste-projets.component';
import { TousProjetsComponent } from './tous-projets/tous-projets.component';
import { TableauComponent } from './tableau/tableau.component';
import { AjouterProjetComponent } from './ajouter-projet/ajouter-projet.component';
import { ModifierProjetComponent } from './modifier-projet/modifier-projet.component';
import { ListeEquipesComponent } from './equipes/liste-equipes.component';
import { ModifierEquipeComponent } from './equipes/modifier-equipe.component';
import { AjouterTableauComponent } from './tableau/ajouter-tableau/ajouter-tableau.component';
import { ResumeComponent } from './resume/resume.component';
import { TimelineComponent } from './timeline/timeline.component';

const routes: Routes = [
  {
    path: '',
    component: ProjetComponent,
    children: [
      {
        path: '',
        component: ListeProjetsComponent
      },
      {
        path: 'tous',
        component: TousProjetsComponent
      },
      {
        path: 'nouveau',
        component: AjouterProjetComponent
      },
      {
        path: ':id',
        children: [
          {
            path: 'tableau',
            children: [
              {
                path: 'nouveau',
                component: AjouterTableauComponent
              },
              {
                path: ':tableauId',
                children: [
                  {
                    path: '',
                    loadChildren: () => import('./tableau/tableau.module').then(m => m.TableauModule)
                  },
                  {
                    path: 'resume',
                    component: ResumeComponent
                  },
                  {
                    path: 'timeline',
                    component: TimelineComponent
                  }
                ]
              }
            ]
          },
          {
            path: 'equipes',
            component: ListeEquipesComponent
          },
          {
            path: 'equipes/:equipeId',
            component: ModifierEquipeComponent
          }
        ]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProjetRoutingModule { }
