import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChronologieComponent } from './chronologie.component';

const routes: Routes = [
  {
    path: '',
    component: ChronologieComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ChronologieRoutingModule { } 