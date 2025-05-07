import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TableauComponent } from './tableau.component';
import { VueTableauComponent } from './vue-tableau/vue-tableau.component';
import { VueCalendrierComponent } from './vue-calendrier/vue-calendrier.component';
import { TimelineComponent } from '../timeline/timeline.component';

const routes: Routes = [
  {
    path: '',
    component: TableauComponent,
    children: [
      { path: '', redirectTo: 'liste', pathMatch: 'full' },
      { path: 'liste', component: VueTableauComponent },
      { path: 'calendar', component: VueCalendrierComponent },
      { path: 'timeline', component: TimelineComponent },
      { path: 'approvals', component: VueTableauComponent },
      { 
        path: 'forms', 
        loadChildren: () => import('./forms/feedback-form.module').then(m => m.FeedbackFormModule)
      },
      { path: 'pages', component: VueTableauComponent },
      { path: 'attachments', component: VueTableauComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TableauRoutingModule { } 