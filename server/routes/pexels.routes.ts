import { Router } from 'express';
import { z } from 'zod';
import { imageSearchRateLimiter } from '../security/rateLimiters';

const router = Router();

// Pexels API search endpoint
router.get('/search', imageSearchRateLimiter, async (req, res) => {
  try {
    const apiKey = process.env.PEXELS_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ 
        error: 'Pexels API key not configured' 
      });
    }

    const query = req.query.query as string || 'nature';
    const page = parseInt(req.query.page as string) || 1;
    const perPage = parseInt(req.query.per_page as string) || 15;

    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`,
      {
        headers: {
          'Authorization': apiKey
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Pexels API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Transform to simpler format for frontend
    const transformedData = {
      page: data.page,
      per_page: data.per_page,
      total_results: data.total_results,
      next_page: data.next_page,
      photos: data.photos.map((photo: any) => ({
        id: photo.id,
        width: photo.width,
        height: photo.height,
        photographer: photo.photographer,
        photographer_url: photo.photographer_url,
        src: {
          original: photo.src.original,
          large2x: photo.src.large2x,
          large: photo.src.large,
          medium: photo.src.medium,
          small: photo.src.small,
          portrait: photo.src.portrait,
          landscape: photo.src.landscape,
          tiny: photo.src.tiny
        },
        alt: photo.alt || query
      }))
    };

    res.json(transformedData);
  } catch (error) {
    console.error('[Pexels] Search error:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to search Pexels' 
    });
  }
});

// Get curated photos (for homepage/default view)
router.get('/curated', imageSearchRateLimiter, async (req, res) => {
  try {
    const apiKey = process.env.PEXELS_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ 
        error: 'Pexels API key not configured' 
      });
    }

    const page = parseInt(req.query.page as string) || 1;
    const perPage = parseInt(req.query.per_page as string) || 15;

    const response = await fetch(
      `https://api.pexels.com/v1/curated?page=${page}&per_page=${perPage}`,
      {
        headers: {
          'Authorization': apiKey
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Pexels API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Transform to simpler format for frontend
    const transformedData = {
      page: data.page,
      per_page: data.per_page,
      total_results: data.total_results,
      next_page: data.next_page,
      photos: data.photos.map((photo: any) => ({
        id: photo.id,
        width: photo.width,
        height: photo.height,
        photographer: photo.photographer,
        photographer_url: photo.photographer_url,
        src: {
          original: photo.src.original,
          large2x: photo.src.large2x,
          large: photo.src.large,
          medium: photo.src.medium,
          small: photo.src.small,
          portrait: photo.src.portrait,
          landscape: photo.src.landscape,
          tiny: photo.src.tiny
        },
        alt: photo.alt || 'Curated photo'
      }))
    };

    res.json(transformedData);
  } catch (error) {
    console.error('[Pexels] Curated error:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to fetch curated photos' 
    });
  }
});

export default router;
