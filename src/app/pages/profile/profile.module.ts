import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NbCardModule, NbUserModule } from '@nebular/theme';
import { ProfileComponent } from './profile.component';

@NgModule({
  declarations: [
    ProfileComponent
  ],
  imports: [
    CommonModule,
    NbCardModule,
    NbUserModule,
    RouterModule.forChild([
      {
        path: '',
        component: ProfileComponent
      }
    ])
  ]
})
export class ProfileModule { } 