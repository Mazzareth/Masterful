import { list } from '@vercel/blob';
import { getSession } from '../../auth/session';

export default async function handler(req, res) {
  console.log('Received get image request');
  
  if (req.method !== 'GET') {
    console.log('Method not allowed:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get user session
  const session = await getSession(req);
  if (!session) {
    console.log('Unauthorized: No valid session');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Get the image ID from the URL
    const imageId = req.query.id;
    console.log('Looking for image with ID:', imageId);
    
    if (!imageId) {
      return res.status(400).json({ error: 'Image ID is required' });
    }

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
    
    // Extract metadata from blob
    const metadata = matchingBlob.metadata || {};
    
    // Log metadata for debugging
    console.log('Retrieved blob metadata:', metadata);
    
    // Transform blob to include metadata
    const image = {
      id: metadata.imageId || matchingBlob.pathname,
      name: metadata.name || matchingBlob.pathname.split('/').pop(),
      url: matchingBlob.url,
      pathname: matchingBlob.pathname,
      contentType: matchingBlob.contentType,
      size: matchingBlob.size,
      uploadedBy: metadata.uploadedBy || 'unknown',
      uploadedAt: metadata.uploadedAt || matchingBlob.uploadedAt || 0,
      tags: metadata.tags || []
    };
    
    // Log the image URL for debugging
    console.log('Image URL:', image.url);
    
    return res.status(200).json(image);
  } catch (error) {
    console.error('Error getting image:', error);
    return res.status(500).json({ 
      error: 'Failed to get image', 
      details: error.message 
    });
  }
}