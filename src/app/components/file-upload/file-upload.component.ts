import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlobService, PutBlobResult } from '../../services/blob.service';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <h2>Upload File</h2>
      <form (submit)="onSubmit($event)">
        <input 
          type="file" 
          #fileInput
          required
        />
        <button type="submit">Upload</button>
      </form>
      
      <div *ngIf="blob">
        <p>File uploaded successfully!</p>
        <p>Blob URL: <a [href]="blob.url" target="_blank">{{ blob.url }}</a></p>
      </div>
    </div>
  `,
  styles: [`
    div {
      margin: 20px;
    }
    
    form {
      margin-bottom: 20px;
    }
    
    input {
      margin-right: 10px;
    }
  `]
})
export class FileUploadComponent {
  blob: PutBlobResult | null = null;
  
  constructor(private blobService: BlobService) {}
  
  onSubmit(event: Event): void {
    event.preventDefault();
    
    const fileInput = (event.target as HTMLFormElement).querySelector('input[type="file"]') as HTMLInputElement;
    
    if (!fileInput?.files?.length) {
      alert('Please select a file');
      return;
    }
    
    const file = fileInput.files[0];
    
    this.blobService.uploadFile(file, file.name).subscribe({
      next: (result) => {
        this.blob = result;
        console.log('Upload successful:', result);
      },
      error: (error) => {
        console.error('Upload failed:', error);
        alert('Upload failed. Please try again.');
      }
    });
  }
}