import { prisma } from '../config/database';
import { Comment } from '../types';
import { AppError } from '../middleware/errorHandler';
import { Prisma } from '@prisma/client';

export class CommentService {
  async getComments(blogSlug: string, params: {
    page?: number;
    limit?: number;
    sort?: 'newest' | 'oldest';
  }): Promise<{ comments: Comment[]; total: number }> {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;
    const sort = params.sort || 'newest';

    // Get blog ID
    const blog = await prisma.blog.findUnique({
      where: { slug: blogSlug },
      select: { id: true },
    });

    if (!blog) {
      throw new AppError('NOT_FOUND', 'Blog not found', 404);
    }

    // Get comments
    const orderBy: Prisma.CommentOrderByWithRelationInput = sort === 'oldest' 
      ? { createdAt: 'asc' } 
      : { createdAt: 'desc' };

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where: {
          blogId: blog.id,
          status: 'approved',
        },
        skip,
        take: limit,
        orderBy,
      }),
      prisma.comment.count({
        where: {
          blogId: blog.id,
          status: 'approved',
        },
      }),
    ]);

    return {
      comments: comments.map((c) => ({
        id: c.id,
        blog_id: c.blogId,
        name: c.name,
        comment: c.comment,
        ip_address: c.ipAddress,
        status: c.status as 'approved' | 'pending' | 'spam' | 'deleted',
        created_at: c.createdAt,
        updated_at: c.updatedAt,
      })),
      total,
    };
  }

  async createComment(blogSlug: string, name: string, comment: string, ipAddress?: string): Promise<Comment> {
    // Get blog
    const blog = await prisma.blog.findUnique({
      where: { slug: blogSlug },
      select: { id: true, enableComments: true },
    });

    if (!blog) {
      throw new AppError('NOT_FOUND', 'Blog not found', 404);
    }

    if (!blog.enableComments) {
      throw new AppError('VALIDATION_ERROR', 'Comments are disabled for this blog', 400);
    }

    // Create comment (auto-approved by default)
    const created = await prisma.comment.create({
      data: {
        blogId: blog.id,
        name,
        comment,
        ipAddress: ipAddress || null,
        status: 'approved',
      },
    });

    return {
      id: created.id,
      blog_id: created.blogId,
      name: created.name,
      comment: created.comment,
      ip_address: created.ipAddress,
      status: created.status as 'approved' | 'pending' | 'spam' | 'deleted',
      created_at: created.createdAt,
      updated_at: created.updatedAt,
    };
  }

  async deleteComment(commentId: string): Promise<void> {
    const result = await prisma.comment.delete({
      where: { id: commentId },
    });

    if (!result) {
      throw new AppError('NOT_FOUND', 'Comment not found', 404);
    }
  }

  async updateCommentStatus(commentId: string, status: 'approved' | 'pending' | 'spam' | 'deleted'): Promise<Comment> {
    const comment = await prisma.comment.update({
      where: { id: commentId },
      data: { status },
    });

    return {
      id: comment.id,
      blog_id: comment.blogId,
      name: comment.name,
      comment: comment.comment,
      ip_address: comment.ipAddress,
      status: comment.status as 'approved' | 'pending' | 'spam' | 'deleted',
      created_at: comment.createdAt,
      updated_at: comment.updatedAt,
    };
  }
}

export const commentService = new CommentService();
