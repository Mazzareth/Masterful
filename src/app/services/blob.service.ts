import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PutBlobResult {
  url: string;
  pathname: string;
  contentType: string;
  contentDisposition: string;
  size: number;
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
   * @returns An Observable with the blob result
   */
  uploadFile(file: File, filename: string): Observable<PutBlobResult> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.http.post<PutBlobResult>(`/api/blob/upload?filename=${encodeURIComponent(filename)}`, formData);
  }
}