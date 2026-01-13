import { Request, Response, NextFunction } from 'express';
import { blogService } from '../services/blogService';
import { getClientIpAddress } from '../utils/ipAddress';
import { ApiResponse, PaginationMeta } from '../types';

export class BlogController {
  async getAllBlogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
      const sort = (req.query.sort as string) || 'newest';
      const tags = req.query.tags ? (req.query.tags as string).split(',') : undefined;
      const author = req.query.author as string | undefined;
      const search = req.query.search as string | undefined;

      const { blogs, total } = await blogService.getAllBlogs({
        page,
        limit,
        sort: sort as 'newest' | 'oldest' | 'popular',
        tags,
        author,
        search,
      });

      const pagination: PaginationMeta = {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      };

      const response: ApiResponse = {
        success: true,
        data: {
          blogs,
          pagination,
        },
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async getBlogBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { slug } = req.params;
      const ipAddress = getClientIpAddress(req);
      const sessionId = req.headers['x-session-id'] as string | undefined;

      const blog = await blogService.getBlogBySlug(slug, ipAddress, sessionId);

      if (!blog) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Blog not found',
          },
        });
        return;
      }

      const response: ApiResponse = {
        success: true,
        data: { blog },
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async createBlog(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const blog = await blogService.createBlog(req.body);

      const response: ApiResponse = {
        success: true,
        data: { blog },
        message: 'Blog created successfully',
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  async updateBlog(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { slug } = req.params;
      const blog = await blogService.updateBlog(slug, req.body);

      const response: ApiResponse = {
        success: true,
        data: { blog },
        message: 'Blog updated successfully',
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async deleteBlog(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { slug } = req.params;
      await blogService.deleteBlog(slug);

      const response: ApiResponse = {
        success: true,
        message: 'Blog deleted successfully',
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
}

export const blogController = new BlogController();
