import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Image } from '../models/image.model';

export interface ImageListResponse {
  images: Image[];
  total: number;
}

export interface ImageListOptions {
  page?: number;
  limit?: number;
  search?: string;
  contentType?: string;
  uploadedBy?: string;
  sortBy?: 'name' | 'uploadedAt' | 'size';
  sortDirection?: 'asc' | 'desc';
}

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  constructor(private http: HttpClient) {}

  /**
   * Get a list of images with optional filtering
   */
  getImages(options: ImageListOptions = {}): Observable<ImageListResponse> {
    let params = new HttpParams();
    
    if (options.page !== undefined) {
      params = params.set('page', options.page.toString());
    }
    
    if (options.limit !== undefined) {
      params = params.set('limit', options.limit.toString());
    }
    
    if (options.search) {
      params = params.set('search', options.search);
    }
    
    if (options.contentType) {
      params = params.set('contentType', options.contentType);
    }
    
    if (options.uploadedBy) {
      params = params.set('uploadedBy', options.uploadedBy);
    }
    
    if (options.sortBy) {
      params = params.set('sortBy', options.sortBy);
    }
    
    if (options.sortDirection) {
      params = params.set('sortDirection', options.sortDirection);
    }
    
    return this.http.get<ImageListResponse>('/api/blob/list', { params });
  }

  /**
   * Get a single image by ID
   */
  getImage(id: string): Observable<Image> {
    return this.http.get<Image>(`/api/blob/${id}`);
  }

  /**
   * Add tags to an image
   */
  addTags(id: string, tags: string[]): Observable<Image> {
    return this.http.post<Image>(`/api/blob/${id}/tags`, { tags });
  }

  /**
   * Remove a tag from an image
   */
  removeTag(id: string, tag: string): Observable<Image> {
    return this.http.delete<Image>(`/api/blob/${id}/tags/${tag}`);
  }
}