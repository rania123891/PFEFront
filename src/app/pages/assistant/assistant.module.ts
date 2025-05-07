import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { AssistantComponent } from './assistant.component';
import { 
  NbLayoutModule, 
  NbIconModule, 
  NbInputModule, 
  NbButtonModule, 
  NbSpinnerModule,
  NbToastrModule,
  NbCardModule,
  NbThemeModule
} from '@nebular/theme';

const routes: Routes = [
  {
    path: '',
    component: AssistantComponent,
  }
];

@NgModule({
  declarations: [
    AssistantComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes),
    NbLayoutModule,
    NbIconModule,
    NbInputModule,
    NbButtonModule,
    NbSpinnerModule,
    NbCardModule,
    NbToastrModule.forRoot(),
  ]
})
export class AssistantModule { } 