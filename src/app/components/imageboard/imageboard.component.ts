import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ImageService, ImageListOptions } from '../../services/image.service';
import { Image } from '../../models/image.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-imageboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './imageboard.component.html',
  styleUrls: ['./imageboard.component.scss']
})
export class ImageboardComponent implements OnInit {
  images: Image[] = [];
  totalImages: number = 0;
  currentPage: number = 1;
  pageSize: number = 12;
  totalPages: number = 0;
  
  loading: boolean = false;
  error: string | null = null;
  
  // Filter options
  searchQuery: string = '';
  contentTypeFilter: string = '';
  uploaderFilter: string = '';
  sortBy: 'name' | 'uploadedAt' | 'size' = 'uploadedAt';
  sortDirection: 'asc' | 'desc' = 'desc';
  
  // Content type options
  contentTypeOptions = [
    { value: '', label: 'All Types' },
    { value: 'image/', label: 'Images' },
    { value: 'application/', label: 'Documents' },
    { value: 'video/', label: 'Videos' },
    { value: 'audio/', label: 'Audio' }
  ];
  
  // Sort options
  sortOptions = [
    { value: 'uploadedAt', label: 'Upload Date' },
    { value: 'name', label: 'Name' },
    { value: 'size', label: 'Size' }
  ];
  
  // Selected image for detail view
  selectedImage: Image | null = null;
  
  // New tag input
  newTag: string = '';
  
  // Current user email
  currentUserEmail: string | null = null;

  constructor(
    private imageService: ImageService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.currentUserEmail = user?.email || null;
    
    this.loadImages();
  }

  loadImages(): void {
    this.loading = true;
    this.error = null;
    
    const options: ImageListOptions = {
      page: this.currentPage,
      limit: this.pageSize,
      sortBy: this.sortBy,
      sortDirection: this.sortDirection
    };
    
    if (this.searchQuery) {
      options.search = this.searchQuery;
    }
    
    if (this.contentTypeFilter) {
      options.contentType = this.contentTypeFilter;
    }
    
    if (this.uploaderFilter) {
      options.uploadedBy = this.uploaderFilter;
    }
    
    this.imageService.getImages(options).subscribe({
      next: (response) => {
        this.images = response.images;
        this.totalImages = response.total;
        this.totalPages = Math.ceil(this.totalImages / this.pageSize);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading images:', err);
        this.error = 'Failed to load images. Please try again.';
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    this.currentPage = 1; // Reset to first page when filters change
    this.loadImages();
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.contentTypeFilter = '';
    this.uploaderFilter = '';
    this.sortBy = 'uploadedAt';
    this.sortDirection = 'desc';
    this.currentPage = 1;
    this.loadImages();
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) {
      return;
    }
    
    this.currentPage = page;
    this.loadImages();
  }

  toggleSortDirection(): void {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    this.loadImages();
  }

  viewImageDetails(image: Image): void {
    this.selectedImage = image;
  }

  closeImageDetails(): void {
    this.selectedImage = null;
    this.newTag = '';
  }

  addTag(): void {
    if (!this.selectedImage || !this.newTag.trim()) {
      return;
    }
    
    const tag = this.newTag.trim();
    
    this.imageService.addTags(this.selectedImage.id, [tag]).subscribe({
      next: (updatedImage) => {
        this.selectedImage = updatedImage;
        this.newTag = '';
        
        // Also update the image in the list
        const index = this.images.findIndex(img => img.id === updatedImage.id);
        if (index !== -1) {
          this.images[index] = updatedImage;
        }
      },
      error: (err) => {
        console.error('Error adding tag:', err);
        this.error = 'Failed to add tag. Please try again.';
      }
    });
  }

  removeTag(tag: string): void {
    if (!this.selectedImage) {
      return;
    }
    
    this.imageService.removeTag(this.selectedImage.id, tag).subscribe({
      next: (updatedImage) => {
        this.selectedImage = updatedImage;
        
        // Also update the image in the list
        const index = this.images.findIndex(img => img.id === updatedImage.id);
        if (index !== -1) {
          this.images[index] = updatedImage;
        }
      },
      error: (err) => {
        console.error('Error removing tag:', err);
        this.error = 'Failed to remove tag. Please try again.';
      }
    });
  }

  formatDate(timestamp: number): string {
    if (!timestamp) return 'Unknown';
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  isImage(contentType: string): boolean {
    return contentType.startsWith('image/');
  }

  getFileIcon(contentType: string): string {
    if (contentType.startsWith('image/')) {
      return 'image';
    } else if (contentType.startsWith('video/')) {
      return 'video';
    } else if (contentType.startsWith('audio/')) {
      return 'audio';
    } else if (contentType.includes('pdf')) {
      return 'pdf';
    } else if (contentType.includes('word') || contentType.includes('document')) {
      return 'document';
    } else if (contentType.includes('spreadsheet') || contentType.includes('excel')) {
      return 'spreadsheet';
    } else {
      return 'file';
    }
  }

  getPageNumbers(): number[] {
    const pages = [];
    const maxPagesToShow = 5;
    
    if (this.totalPages <= maxPagesToShow) {
      // Show all pages if there are few
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show a window of pages around the current page
      let start = Math.max(1, this.currentPage - Math.floor(maxPagesToShow / 2));
      let end = Math.min(this.totalPages, start + maxPagesToShow - 1);
      
      // Adjust if we're near the end
      if (end === this.totalPages) {
        start = Math.max(1, end - maxPagesToShow + 1);
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  }
  
  copyToClipboard(inputElement: HTMLInputElement): void {
    inputElement.select();
    document.execCommand('copy');
    
    // Show a temporary tooltip or notification
    const originalValue = inputElement.value;
    inputElement.value = 'Copied!';
    setTimeout(() => {
      inputElement.value = originalValue;
    }, 1000);
  }
}