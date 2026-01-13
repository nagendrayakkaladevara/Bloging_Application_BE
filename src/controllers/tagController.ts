import { Request, Response, NextFunction } from 'express';
import { tagService } from '../services/tagService';
import { ApiResponse, PaginationMeta } from '../types';

export class TagController {
  async getAllTags(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const popular = req.query.popular === 'true';
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;

      const tags = await tagService.getAllTags({ popular, limit });

      const response: ApiResponse = {
        success: true,
        data: {
          tags: tags.map((tag) => ({
            id: tag.id,
            name: tag.name,
            slug: tag.slug,
            description: tag.description,
            blogCount: (tag as any).blog_count || 0,
          })),
        },
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async getBlogsByTag(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { slug } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);

      const { tag, blogs, total } = await tagService.getBlogsByTag(slug, { page, limit });

      const pagination: PaginationMeta = {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      };

      const response: ApiResponse = {
        success: true,
        data: {
          tag: {
            id: tag.id,
            name: tag.name,
            slug: tag.slug,
            description: tag.description,
          },
          blogs,
          pagination,
        },
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
}

export const tagController = new TagController();
