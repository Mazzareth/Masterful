import { list, put } from '@vercel/blob';
import { getSession } from '../../../../auth/session';
import https from 'https';

export default async function handler(req, res) {
  console.log('Received tag delete request');
  
  if (req.method !== 'DELETE') {
    console.log('Method not allowed:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get user session
  const session = await getSession(req);
  if (!session) {
    console.log('Unauthorized: No valid session');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Get the image ID and tag from the URL
  const imageId = req.query.id;
  const tagToRemove = req.query.tag;
  
  console.log('Image ID:', imageId);
  console.log('Tag to remove:', tagToRemove);
  
  if (!imageId) {
    return res.status(400).json({ error: 'Image ID is required' });
  }
  
  if (!tagToRemove) {
    return res.status(400).json({ error: 'Tag is required' });
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
    
    // Remove the tag
    const existingTags = metadata.tags || [];
    const updatedTags = existingTags.filter(tag => tag !== tagToRemove);
    
    // If the tag wasn't found, return early
    if (existingTags.length === updatedTags.length) {
      return res.status(404).json({ error: 'Tag not found' });
    }
    
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
  } catch (error) {
    console.error('Error removing tag:', error);
    return res.status(500).json({ 
      error: 'Failed to remove tag', 
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