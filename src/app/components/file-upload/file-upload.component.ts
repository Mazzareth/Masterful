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
        <button type="submit" [disabled]="isUploading">
          {{ isUploading ? 'Uploading...' : 'Upload' }}
        </button>
      </form>
      
      <div *ngIf="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
      
      <div *ngIf="blob" class="success-message">
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
    
    .error-message {
      color: #d9534f;
      margin-top: 10px;
      padding: 10px;
      border: 1px solid #d9534f;
      border-radius: 4px;
      background-color: #f9f2f2;
    }
    
    .success-message {
      color: #5cb85c;
      margin-top: 10px;
      padding: 10px;
      border: 1px solid #5cb85c;
      border-radius: 4px;
      background-color: #f2f9f2;
    }
  `]
})
export class FileUploadComponent {
  blob: PutBlobResult | null = null;
  isUploading = false;
  errorMessage = '';
  
  constructor(private blobService: BlobService) {}
  
  onSubmit(event: Event): void {
    event.preventDefault();
    
    // Reset state
    this.errorMessage = '';
    this.blob = null;
    
    const fileInput = (event.target as HTMLFormElement).querySelector('input[type="file"]') as HTMLInputElement;
    
    if (!fileInput?.files?.length) {
      this.errorMessage = 'Please select a file';
      return;
    }
    
    const file = fileInput.files[0];
    console.log('Selected file:', file.name);
    console.log('File size:', file.size, 'bytes');
    console.log('File type:', file.type);
    
    // Set loading state
    this.isUploading = true;
    
    this.blobService.uploadFile(file, file.name).subscribe({
      next: (result) => {
        this.isUploading = false;
        this.blob = result;
        console.log('Upload successful:', result);
      },
      error: (error) => {
        this.isUploading = false;
        console.error('Upload failed:', error);
        
        // More detailed error message
        let errorMessage = 'Upload failed. ';
        
        if (error.error && typeof error.error === 'object') {
          errorMessage += error.error.error || '';
          if (error.error.details) {
            errorMessage += ' ' + error.error.details;
          }
        }
        
        this.errorMessage = errorMessage || 'Upload failed. Please try again.';
      }
    });
  }
}