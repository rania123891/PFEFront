import { Component, Input } from '@angular/core';
import { AttachmentService } from '../../../../services/attachment.service';
import { NbToastrService } from '@nebular/theme';

@Component({
  selector: 'ngx-attachment-upload',
  template: `
    <div class="upload-container">
      <input
        type="file"
        #fileInput
        (change)="onFileSelected($event)"
        style="display: none"
        multiple
      />
      <button nbButton status="primary" (click)="fileInput.click()">
        <nb-icon icon="upload-outline"></nb-icon>
        Ajouter des pièces jointes
      </button>
      
      <div class="attachments-list" *ngIf="attachments.length > 0">
        <nb-card *ngFor="let attachment of attachments">
          <nb-card-body class="attachment-item">
            <span>{{ attachment.name }}</span>
            <button nbButton status="danger" size="tiny" (click)="deleteAttachment(attachment.id)">
              <nb-icon icon="trash-2-outline"></nb-icon>
            </button>
          </nb-card-body>
        </nb-card>
      </div>
    </div>
  `,
  styles: [`
    .upload-container {
      padding: 1rem;
    }
    .attachments-list {
      margin-top: 1rem;
    }
    .attachment-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  `]
})
export class AttachmentUploadComponent {
  @Input() projectId: number;
  attachments: any[] = [];

  constructor(
    private attachmentService: AttachmentService,
    private toastrService: NbToastrService
  ) {}

  ngOnInit() {
    this.loadAttachments();
  }

  loadAttachments() {
    this.attachmentService.getAttachments(this.projectId)
      .subscribe(
        (data) => {
          this.attachments = data;
        },
        (error) => {
          this.toastrService.danger('Erreur lors du chargement des pièces jointes', 'Erreur');
        }
      );
  }

  onFileSelected(event: any) {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach((file: File) => {
        this.attachmentService.uploadAttachment(file, this.projectId)
          .subscribe(
            (response) => {
              this.toastrService.success('Pièce jointe ajoutée avec succès', 'Succès');
              this.loadAttachments();
            },
            (error) => {
              this.toastrService.danger('Erreur lors de l\'upload du fichier', 'Erreur');
            }
          );
      });
    }
  }

  deleteAttachment(attachmentId: number) {
    this.attachmentService.deleteAttachment(attachmentId)
      .subscribe(
        () => {
          this.toastrService.success('Pièce jointe supprimée avec succès', 'Succès');
          this.loadAttachments();
        },
        (error) => {
          this.toastrService.danger('Erreur lors de la suppression', 'Erreur');
        }
      );
  }
} 