import { prisma } from '../config/database';
import { BlogPreview } from '../types';
import { blogService } from './blogService';

export class SearchService {
  async search(query: string, params: {
    page?: number;
    limit?: number;
    tags?: string[];
  }, ipAddress?: string): Promise<{
    results: (BlogPreview & { relevanceScore: number })[];
    total: number;
    query: string;
  }> {
    // Use blog service to search
    const { blogs, total } = await blogService.getAllBlogs({
      search: query,
      page: params.page,
      limit: params.limit,
      tags: params.tags,
    });

    // Calculate relevance scores (simplified - can be enhanced)
    const results = blogs.map((blog) => {
      let score = 0;

      // Title match (highest weight)
      if (blog.meta.title.toLowerCase().includes(query.toLowerCase())) {
        score += 10;
      }

      // Description match
      if (blog.meta.description?.toLowerCase().includes(query.toLowerCase())) {
        score += 5;
      }

      // Tag match
      if (blog.tags.some((tag) => tag.toLowerCase().includes(query.toLowerCase()))) {
        score += 3;
      }

      // Normalize score to 0-1 range
      const relevanceScore = Math.min(score / 10, 1);

      return {
        ...blog,
        relevanceScore,
      };
    });

    // Sort by relevance
    results.sort((a, b) => b.relevanceScore - a.relevanceScore);

    // Log search history (optional)
    if (ipAddress) {
      try {
        await prisma.searchHistory.create({
          data: {
            ipAddress,
            query,
            resultsCount: total,
          },
        });
      } catch (error) {
        // Don't fail search if logging fails
        console.error('Failed to log search history:', error);
      }
    }

    return {
      results,
      total,
      query,
    };
  }
}

export const searchService = new SearchService();
