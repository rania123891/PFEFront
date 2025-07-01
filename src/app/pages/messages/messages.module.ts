import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
  NbCardModule,
  NbInputModule,
  NbButtonModule,
  NbListModule,
  NbUserModule,
  NbIconModule,
  NbActionsModule,
  NbSpinnerModule,
  NbFormFieldModule
} from '@nebular/theme';
import { MessagesComponent } from './messages.component';
import { MessageService } from '../../services/message.service';

@NgModule({
  declarations: [
    MessagesComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
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
    NbActionsModule,
    NbSpinnerModule,
    NbFormFieldModule
  ],
  providers: [MessageService]
})
export class MessagesModule { } 