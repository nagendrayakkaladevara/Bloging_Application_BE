import { Request, Response, NextFunction } from 'express';
import { searchService } from '../services/searchService';
import { getClientIpAddress } from '../utils/ipAddress';
import { ApiResponse, PaginationMeta } from '../types';

export class SearchController {
  async search(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.query.q as string;
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
      const tags = req.query.tags ? (req.query.tags as string).split(',') : undefined;
      const ipAddress = getClientIpAddress(req);

      const { results, total, query: searchQuery } = await searchService.search(
        query,
        { page, limit, tags },
        ipAddress
      );

      const pagination: PaginationMeta = {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      };

      const response: ApiResponse = {
        success: true,
        data: {
          results,
          pagination,
          query: searchQuery,
          totalResults: total,
        },
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
}

export const searchController = new SearchController();
