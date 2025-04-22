import { list } from '@vercel/blob';
import { getSession } from '../../auth/session';

export default async function handler(req, res) {
  console.log('Received list images request');
  
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
    // Get query parameters for filtering
    const { searchParams } = new URL(req.url, `http://${req.headers.host}`);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const search = searchParams.get('search') || '';
    const contentType = searchParams.get('contentType') || '';
    const uploadedBy = searchParams.get('uploadedBy') || '';
    const sortBy = searchParams.get('sortBy') || 'uploadedAt';
    const sortDirection = searchParams.get('sortDirection') || 'desc';
    
    console.log('List parameters:', {
      limit,
      page,
      search,
      contentType,
      uploadedBy,
      sortBy,
      sortDirection
    });

    // Get the list of blobs
    const { blobs } = await list();
    console.log(`Found ${blobs.length} blobs`);
    
    // Transform blobs to include metadata
    let images = blobs.map(blob => {
      // Extract metadata from blob
      const metadata = blob.metadata || {};
      
      return {
        id: metadata.imageId || blob.pathname,
        name: metadata.name || blob.pathname.split('/').pop(),
        url: blob.url,
        pathname: blob.pathname,
        contentType: blob.contentType,
        size: blob.size,
        uploadedBy: metadata.uploadedBy || 'unknown',
        uploadedAt: metadata.uploadedAt || blob.uploadedAt || 0,
        tags: metadata.tags || []
      };
    });
    
    // Apply filters
    if (search) {
      const searchLower = search.toLowerCase();
      images = images.filter(image => 
        image.name.toLowerCase().includes(searchLower) ||
        image.pathname.toLowerCase().includes(searchLower) ||
        (image.tags && image.tags.some(tag => tag.toLowerCase().includes(searchLower)))
      );
    }
    
    if (contentType) {
      images = images.filter(image => image.contentType.startsWith(contentType));
    }
    
    if (uploadedBy) {
      images = images.filter(image => image.uploadedBy === uploadedBy);
    }
    
    // Sort images
    images.sort((a, b) => {
      let valueA, valueB;
      
      switch (sortBy) {
        case 'name':
          valueA = a.name.toLowerCase();
          valueB = b.name.toLowerCase();
          break;
        case 'size':
          valueA = a.size;
          valueB = b.size;
          break;
        case 'uploadedAt':
        default:
          valueA = a.uploadedAt;
          valueB = b.uploadedAt;
          break;
      }
      
      if (sortDirection === 'asc') {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });
    
    // Paginate results
    const total = images.length;
    const offset = (page - 1) * limit;
    const paginatedImages = images.slice(offset, offset + limit);
    
    return res.status(200).json({
      images: paginatedImages,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error listing images:', error);
    return res.status(500).json({ 
      error: 'Failed to list images', 
      details: error.message 
    });
  }
}