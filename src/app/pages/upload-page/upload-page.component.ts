import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FileUploadComponent } from '../../components/file-upload/file-upload.component';

@Component({
  selector: 'app-upload-page',
  standalone: true,
  imports: [CommonModule, RouterModule, FileUploadComponent],
  templateUrl: './upload-page.component.html',
  styleUrls: ['./upload-page.component.scss']
})
export class UploadPageComponent {
  constructor() {}
}