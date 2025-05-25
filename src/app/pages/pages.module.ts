import { NgModule } from '@angular/core';
import { NbMenuModule } from '@nebular/theme';

import { ThemeModule } from '../@theme/theme.module';
import { PagesComponent } from './pages.component';
import { DashboardModule } from './dashboard/dashboard.module';
import { PagesRoutingModule } from './pages-routing.module';
import { ProjetsModule } from './projets/projets.module';
import { UtilisateursModule } from './utilisateurs/utilisateurs.module';
import { AjouterProjetComponent } from './pages/projets/ajouter-projet/ajouter-projet.component';
import { ModifierProjetComponent } from './pages/projets/modifier-projet/modifier-projet.component';

@NgModule({
  imports: [
    PagesRoutingModule,
    ThemeModule,
    NbMenuModule,
    DashboardModule,
    ProjetsModule,
    UtilisateursModule,
  ],
  declarations: [
    PagesComponent,
    AjouterProjetComponent,
    ModifierProjetComponent,
  ],
})
export class PagesModule {
}
