import { prisma } from '../config/database';
import { Tag, BlogPreview } from '../types';
import { blogService } from './blogService';
import { AppError } from '../middleware/errorHandler';

export class TagService {
  async getAllTags(params: {
    popular?: boolean;
    limit?: number;
  }): Promise<Tag[]> {
    const where = params.popular
      ? {
          blogs: {
            some: {
              blog: {
                status: 'published',
              },
            },
          },
        }
      : undefined;

    const tags = await prisma.tag.findMany({
      where,
      include: {
        blogs: {
          where: {
            blog: {
              status: 'published',
            },
          },
        },
      },
      orderBy: params.popular
        ? undefined // Will sort by count after
        : { name: 'asc' },
      take: params.limit,
    });

    // Sort by blog count if popular
    if (params.popular) {
      tags.sort((a, b) => b.blogs.length - a.blogs.length);
    }

    return tags.map((tag) => ({
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
      description: tag.description,
      created_at: tag.createdAt,
      blog_count: tag.blogs.length,
    })) as any;
  }

  async getTagBySlug(slug: string): Promise<Tag | null> {
    const tag = await prisma.tag.findUnique({
      where: { slug },
    });

    if (!tag) {
      return null;
    }

    return {
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
      description: tag.description,
      created_at: tag.createdAt,
    };
  }

  async getBlogsByTag(slug: string, params: {
    page?: number;
    limit?: number;
  }): Promise<{ tag: Tag; blogs: BlogPreview[]; total: number }> {
    const tag = await this.getTagBySlug(slug);
    if (!tag) {
      throw new AppError('NOT_FOUND', 'Tag not found', 404);
    }

    const { blogs, total } = await blogService.getAllBlogs({
      tags: [slug],
      page: params.page,
      limit: params.limit,
    });

    return { tag, blogs, total };
  }
}

export const tagService = new TagService();
