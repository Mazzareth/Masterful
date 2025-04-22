import { put } from '@vercel/blob';
import { formidable } from 'formidable';
import fs from 'fs';

// Disable the default body parser to handle the form data manually
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  console.log('Received upload request');
  
  if (req.method !== 'POST') {
    console.log('Method not allowed:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { searchParams } = new URL(req.url, `http://${req.headers.host}`);
  const filename = searchParams.get('filename');
  console.log('Filename from query params:', filename);

  if (!filename) {
    console.log('No filename provided');
    return res.status(400).json({ error: 'Filename is required' });
  }
  
  console.log('Content-Type:', req.headers['content-type']);

  try {
    // Use formidable to parse the multipart form data
    const form = formidable({
      keepExtensions: true,
      multiples: true,
    });
    
    // Parse the form
    const [fields, files] = await form.parse(req);
    
    console.log('Form fields:', fields);
    console.log('Files received:', Object.keys(files));
    
    // Check if we have a file
    const fileField = files.file;
    if (!fileField || fileField.length === 0) {
      console.log('No file found in the request');
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const uploadedFile = fileField[0];
    console.log('File details:', {
      originalFilename: uploadedFile.originalFilename,
      mimetype: uploadedFile.mimetype,
      size: uploadedFile.size,
      filepath: uploadedFile.filepath
    });
    
    // Read the file from disk
    const fileBuffer = fs.readFileSync(uploadedFile.filepath);
    console.log('File buffer created, size:', fileBuffer.length);
    
    console.log('Uploading file to Vercel Blob:', filename);
    
    // Upload to Vercel Blob
    try {
      const blob = await put(filename, fileBuffer, {
        access: 'public',
        contentType: uploadedFile.mimetype || 'application/octet-stream'
      });
      
      console.log('Upload successful, blob URL:', blob.url);
      return res.status(200).json(blob);
    } catch (uploadError) {
      console.error('Error in put operation:', uploadError);
      return res.status(500).json({ 
        error: 'Failed to upload to Vercel Blob', 
        details: uploadError.message 
      });
    } finally {
      // Clean up the temp file
      try {
        fs.unlinkSync(uploadedFile.filepath);
      } catch (cleanupError) {
        console.error('Error cleaning up temp file:', cleanupError);
      }
    }
  } catch (error) {
    console.error('Error processing upload:', error);
    return res.status(500).json({ 
      error: 'Failed to process upload', 
      details: error.message 
    });
  }
}