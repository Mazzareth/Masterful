import { put } from '@vercel/blob';
import { createReadStream } from 'fs';
import { pipeline } from 'stream/promises';
import { Readable } from 'stream';
import busboy from 'busboy';

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
    // Parse the multipart form data
    const bb = busboy({ headers: req.headers });
    let fileBuffer = null;

    bb.on('file', async (fieldname, file, info) => {
      console.log('Received file with fieldname:', fieldname);
      console.log('File info:', info);
      
      // Only process the file if the fieldname is 'file'
      if (fieldname === 'file') {
        const chunks = [];
        for await (const chunk of file) {
          chunks.push(chunk);
        }
        fileBuffer = Buffer.concat(chunks);
        console.log('File buffer created, size:', fileBuffer.length);
      } else {
        console.log('Ignoring file with fieldname:', fieldname);
        // Consume the file stream to prevent memory leaks
        for await (const chunk of file) {
          // Discard chunk
        }
      }
    });

    await new Promise((resolve, reject) => {
      bb.on('close', resolve);
      bb.on('error', reject);
      req.pipe(bb);
    });

    if (!fileBuffer) {
      console.log('No file buffer created after processing');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('Uploading file to Vercel Blob:', filename);
    
    // Upload to Vercel Blob
    try {
      const blob = await put(filename, fileBuffer, {
        access: 'public',
      });
      
      console.log('Upload successful, blob URL:', blob.url);
      return res.status(200).json(blob);
    } catch (uploadError) {
      console.error('Error in put operation:', uploadError);
      return res.status(500).json({ error: 'Failed to upload to Vercel Blob', details: uploadError.message });
    }
  } catch (error) {
    console.error('Error uploading to Vercel Blob:', error);
    return res.status(500).json({ error: 'Failed to upload file' });
  }
}