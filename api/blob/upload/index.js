import { put } from '@vercel/blob';
import { createReadStream } from 'fs';
import { pipeline } from 'stream/promises';
import { Readable } from 'stream';
import busboy from 'busboy';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { searchParams } = new URL(req.url, `http://${req.headers.host}`);
  const filename = searchParams.get('filename');

  if (!filename) {
    return res.status(400).json({ error: 'Filename is required' });
  }

  try {
    // Parse the multipart form data
    const bb = busboy({ headers: req.headers });
    let fileBuffer = null;

    bb.on('file', async (_, file, info) => {
      const chunks = [];
      for await (const chunk of file) {
        chunks.push(chunk);
      }
      fileBuffer = Buffer.concat(chunks);
    });

    await new Promise((resolve, reject) => {
      bb.on('close', resolve);
      bb.on('error', reject);
      req.pipe(bb);
    });

    if (!fileBuffer) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Upload to Vercel Blob
    const blob = await put(filename, fileBuffer, {
      access: 'public',
    });

    return res.status(200).json(blob);
  } catch (error) {
    console.error('Error uploading to Vercel Blob:', error);
    return res.status(500).json({ error: 'Failed to upload file' });
  }
}