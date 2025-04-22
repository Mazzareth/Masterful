import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BlobService, PutBlobResult } from '../../services/blob.service';

interface UploadHistoryItem extends PutBlobResult {
  timestamp: number;
}

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss']
})
export class FileUploadComponent {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('urlInput') urlInput!: ElementRef<HTMLInputElement>;
  
  blob: PutBlobResult | null = null;
  isUploading = false;
  errorMessage = '';
  isDragging = false;
  selectedFile: File | null = null;
  selectedFileName = '';
  customImageName = '';
  previewUrl: string | null = null;
  isImageFile = false;
  uploadHistory: UploadHistoryItem[] = [];
  
  constructor(private blobService: BlobService) {
    // Load upload history from localStorage
    this.loadUploadHistory();
  }
  
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }
  
  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }
  
  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
    
    if (event.dataTransfer?.files.length) {
      this.handleFileSelection(event.dataTransfer.files[0]);
    }
  }
  
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    
    if (input.files?.length) {
      this.handleFileSelection(input.files[0]);
    }
  }
  
  handleFileSelection(file: File): void {
    // Reset error state
    this.errorMessage = '';
    
    // Check file size (4.5MB limit)
    if (file.size > 4.5 * 1024 * 1024) {
      this.errorMessage = 'File size exceeds the 4.5MB limit. Please select a smaller file.';
      return;
    }
    
    this.selectedFile = file;
    this.selectedFileName = file.name;
    
    // Check if it's an image file
    this.isImageFile = file.type.startsWith('image/');
    
    // Create preview for images
    if (this.isImageFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewUrl = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    } else {
      this.previewUrl = 'file-icon';
    }
  }
  
  uploadFile(): void {
    if (!this.selectedFile) {
      this.errorMessage = 'Please select a file';
      return;
    }
    
    // Set loading state
    this.isUploading = true;
    
    // Use custom name if provided, otherwise use the file name
    const imageName = this.customImageName.trim() || this.selectedFile.name;
    
    this.blobService.uploadFile(this.selectedFile, this.selectedFile.name, imageName).subscribe({
      next: (result) => {
        this.isUploading = false;
        this.blob = result;
        console.log('Upload successful:', result);
        
        // Add to upload history
        this.addToUploadHistory(result);
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
  
  resetUpload(): void {
    this.selectedFile = null;
    this.selectedFileName = '';
    this.customImageName = '';
    this.previewUrl = null;
    this.isImageFile = false;
    this.errorMessage = '';
    this.blob = null;
    
    // Reset file input
    if (this.fileInput?.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
  }
  
  copyToClipboard(inputElement: HTMLInputElement): void {
    inputElement.select();
    document.execCommand('copy');
    
    // Show a temporary tooltip or notification
    const originalText = inputElement.value;
    inputElement.value = 'Copied!';
    setTimeout(() => {
      inputElement.value = originalText;
    }, 1000);
  }
  
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
  
  formatDate(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  }
  
  getFileNameFromUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      return decodeURIComponent(pathParts[pathParts.length - 1]);
    } catch (e) {
      return url;
    }
  }
  
  isImageType(contentType: string): boolean {
    return contentType.startsWith('image/');
  }
  
  private addToUploadHistory(result: PutBlobResult): void {
    const historyItem: UploadHistoryItem = {
      ...result,
      timestamp: Date.now()
    };
    
    // Add to the beginning of the array
    this.uploadHistory.unshift(historyItem);
    
    // Keep only the last 5 items
    if (this.uploadHistory.length > 5) {
      this.uploadHistory = this.uploadHistory.slice(0, 5);
    }
    
    // Save to localStorage
    this.saveUploadHistory();
  }
  
  private loadUploadHistory(): void {
    try {
      const history = localStorage.getItem('uploadHistory');
      if (history) {
        this.uploadHistory = JSON.parse(history);
      }
    } catch (e) {
      console.error('Error loading upload history:', e);
      this.uploadHistory = [];
    }
  }
  
  private saveUploadHistory(): void {
    try {
      localStorage.setItem('uploadHistory', JSON.stringify(this.uploadHistory));
    } catch (e) {
      console.error('Error saving upload history:', e);
    }
  }
}