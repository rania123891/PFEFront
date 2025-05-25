import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
  NbCardModule,
  NbInputModule,
  NbButtonModule,
  NbListModule,
  NbUserModule,
  NbIconModule,
  NbActionsModule
} from '@nebular/theme';
import { MessagesComponent } from './messages.component';
import { MessageService } from '../../services/message.service';

@NgModule({
  declarations: [
    MessagesComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild([
      {
        path: '',
        component: MessagesComponent
      }
    ]),
    NbCardModule,
    NbInputModule,
    NbButtonModule,
    NbListModule,
    NbUserModule,
    NbIconModule,
    NbActionsModule
  ],
  providers: [MessageService]
})
export class MessagesModule { } 