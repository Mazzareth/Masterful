# Vercel Blob Setup for Angular

This document explains how Vercel Blob has been integrated into this Angular project for file uploads.

## What is Vercel Blob?

Vercel Blob is a storage solution for files that integrates seamlessly with Vercel deployments. It provides a simple API for uploading, downloading, and managing files.

## Setup Steps

### 1. Installation

The Vercel Blob SDK has been installed:

```bash
npm install @vercel/blob
```

### 2. Environment Variables

For the Vercel Blob to work properly, you need to set up the following environment variables in your Vercel project:

- `BLOB_READ_WRITE_TOKEN`: A token for read and write access to your Blob storage

You can set these up by running:

```bash
vercel link
vercel env add BLOB_READ_WRITE_TOKEN
```

### 3. Implementation Details

#### Angular Service

A `BlobService` has been created at `src/app/services/blob.service.ts` that provides methods for uploading files to Vercel Blob.

#### File Upload Component

A standalone Angular component has been created at `src/app/components/file-upload/file-upload.component.ts` that provides a UI for uploading files.

#### API Endpoint

A serverless function has been created at `api/blob/upload/index.js` that handles the file upload to Vercel Blob.

#### Vercel Configuration

The `vercel.json` file has been updated to include the API routes for Vercel Blob.

## Usage

1. Navigate to the dashboard page after logging in
2. Click on the "Upload Files with Vercel Blob" button
3. Select a file to upload
4. After uploading, you'll see the URL to the uploaded file

## Limitations

- Server uploads are limited to 4.5 MB. For larger files, client-side uploads should be implemented.
- The current implementation requires authentication to access the upload page.

## Further Improvements

- Add progress indicators for uploads
- Implement client-side uploads for larger files
- Add file management capabilities (listing, deleting files)
- Add validation for file types and sizes