import { list, put } from '@vercel/blob';
import { getSession } from '../../../auth/session';
import fs from 'fs';
import https from 'https';
import { Readable } from 'stream';

export default async function handler(req, res) {
  console.log('Received tags request');
  
  // Get user session
  const session = await getSession(req);
  if (!session) {
    console.log('Unauthorized: No valid session');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Get the image ID from the URL
  const imageId = req.query.id;
  console.log('Image ID:', imageId);
  
  if (!imageId) {
    return res.status(400).json({ error: 'Image ID is required' });
  }

  try {
    // Get the list of blobs
    const { blobs } = await list();
    
    // Find the blob with the matching ID
    const matchingBlob = blobs.find(blob => {
      const metadata = blob.metadata || {};
      return metadata.imageId === imageId || blob.pathname === imageId;
    });
    
    if (!matchingBlob) {
      return res.status(404).json({ error: 'Image not found' });
    }
    
    // Extract existing metadata
    const metadata = matchingBlob.metadata || {};
    
    // Handle different HTTP methods
    switch (req.method) {
      case 'POST': {
        // Add tags
        const { tags } = req.body;
        
        if (!Array.isArray(tags)) {
          return res.status(400).json({ error: 'Tags must be an array' });
        }
        
        // Combine existing tags with new tags, removing duplicates
        const existingTags = metadata.tags || [];
        const updatedTags = [...new Set([...existingTags, ...tags])];
        
        // Update metadata
        const updatedMetadata = {
          ...metadata,
          tags: updatedTags
        };
        
        // Log the updated metadata for debugging
        console.log('Original metadata:', metadata);
        console.log('Updated metadata:', updatedMetadata);
        
        // Download the file
        const fileBuffer = await downloadFile(matchingBlob.url);
        
        // Re-upload with updated metadata
        const updatedBlob = await put(matchingBlob.pathname, fileBuffer, {
          access: 'public',
          contentType: matchingBlob.contentType,
          metadata: updatedMetadata
        });
        
        // Return the updated image
        return res.status(200).json({
          id: metadata.imageId || matchingBlob.pathname,
          name: metadata.name || matchingBlob.pathname.split('/').pop(),
          url: updatedBlob.url,
          pathname: updatedBlob.pathname,
          contentType: updatedBlob.contentType,
          size: updatedBlob.size,
          uploadedBy: metadata.uploadedBy || 'unknown',
          uploadedAt: metadata.uploadedAt || matchingBlob.uploadedAt || 0,
          tags: updatedTags
        });
      }
      
      case 'GET': {
        // Get tags
        const tags = metadata.tags || [];
        return res.status(200).json({ tags });
      }
      
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error managing tags:', error);
    return res.status(500).json({ 
      error: 'Failed to manage tags', 
      details: error.message 
    });
  }
}

// Helper function to download a file from a URL
async function downloadFile(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download file: ${response.statusCode}`));
        return;
      }
      
      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => resolve(Buffer.concat(chunks)));
      response.on('error', reject);
    }).on('error', reject);
  });
}