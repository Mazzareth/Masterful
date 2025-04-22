import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PutBlobResult {
  id?: string;
  url: string;
  pathname: string;
  contentType: string;
  contentDisposition: string;
  size: number;
  uploadedBy?: string;
  uploadedAt?: number;
  name?: string;
}

@Injectable({
  providedIn: 'root'
})
export class BlobService {
  constructor(private http: HttpClient) {}

  /**
   * Upload a file to Vercel Blob storage via the server API
   * @param file The file to upload
   * @param filename The name of the file
   * @param customName Optional custom name for the image
   * @returns An Observable with the blob result
   */
  uploadFile(file: File, filename: string, customName?: string): Observable<PutBlobResult> {
    console.log('Preparing to upload file:', filename);
    console.log('File size:', file.size, 'bytes');
    console.log('File type:', file.type);
    
    const formData = new FormData();
    formData.append('file', file);
    
    // Log the FormData contents (for debugging)
    console.log('FormData created with file appended');
    
    let url = `/api/blob/upload?filename=${encodeURIComponent(filename)}`;
    
    // Add custom name if provided
    if (customName) {
      url += `&name=${encodeURIComponent(customName)}`;
    }
    
    return this.http.post<PutBlobResult>(url, formData);
  }
}