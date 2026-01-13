import { Request, Response, NextFunction } from 'express';
import { commentService } from '../services/commentService';
import { getClientIpAddress } from '../utils/ipAddress';
import { ApiResponse, PaginationMeta } from '../types';

export class CommentController {
  async getComments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { slug } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
      const sort = (req.query.sort as string) || 'newest';

      const { comments, total } = await commentService.getComments(slug, {
        page,
        limit,
        sort: sort as 'newest' | 'oldest',
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
          comments: comments.map((c) => ({
            id: c.id,
            name: c.name,
            comment: c.comment,
            createdAt: c.created_at.toISOString(),
          })),
          pagination,
        },
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async createComment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { slug } = req.params;
      const { name, comment } = req.body;
      const ipAddress = getClientIpAddress(req);

      const createdComment = await commentService.createComment(slug, name, comment, ipAddress);

      const response: ApiResponse = {
        success: true,
        data: {
          comment: {
            id: createdComment.id,
            name: createdComment.name,
            comment: createdComment.comment,
            createdAt: createdComment.created_at.toISOString(),
          },
        },
        message: 'Comment posted successfully',
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  async deleteComment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { commentId } = req.params;
      await commentService.deleteComment(commentId);

      const response: ApiResponse = {
        success: true,
        message: 'Comment deleted successfully',
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async updateCommentStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { commentId } = req.params;
      const { status } = req.body;

      const comment = await commentService.updateCommentStatus(commentId, status);

      const response: ApiResponse = {
        success: true,
        data: {
          comment: {
            id: comment.id,
            name: comment.name,
            comment: comment.comment,
            status: comment.status,
            createdAt: comment.created_at.toISOString(),
          },
        },
        message: 'Comment status updated successfully',
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
}

export const commentController = new CommentController();
