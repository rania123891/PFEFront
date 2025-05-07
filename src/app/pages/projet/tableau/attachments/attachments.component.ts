import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'ngx-attachments',
  template: `
    <nb-card>
      <nb-card-header>
        <h5>Pièces jointes</h5>
      </nb-card-header>
      <nb-card-body>
        <ngx-attachment-upload [projectId]="projectId"></ngx-attachment-upload>
      </nb-card-body>
    </nb-card>
  `
})
export class AttachmentsComponent implements OnInit {
  projectId: number;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.projectId = Number(this.route.snapshot.params['id']);
  }
} 