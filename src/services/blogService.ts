import { prisma } from '../config/database';
import { BlogPreview, BlogDetail, BlogBlock } from '../types';
import { generateSlug } from '../utils/slug';
import { calculateReadTime } from '../utils/readTime';
import { AppError } from '../middleware/errorHandler';
import { Prisma } from '@prisma/client'; 
import { queryWithRetry } from '../utils/queryWithRetry';

export class BlogService {
  async getAllBlogs(params: {
    page?: number;
    limit?: number;
    sort?: 'newest' | 'oldest' | 'popular';
    tags?: string[];
    author?: string;
    search?: string;
  }): Promise<{ blogs: BlogPreview[]; total: number }> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 10, 50);
    const skip = (page - 1) * limit;
    const sort = params.sort || 'newest';

    // Build where clause
    const where: Prisma.BlogWhereInput = {
      status: 'published',
    };

    // Filter by tags
    if (params.tags && params.tags.length > 0) {
      where.tags = {
        some: {
          tag: {
            slug: {
              in: params.tags,
            },
          },
        },
      };
    }

    // Filter by author
    if (params.author) {
      where.author = params.author;
    }

    // Search (full-text search using raw query)
    // Note: Prisma doesn't support full-text search directly, so we'll filter after
    // For production, consider using a search service like Elasticsearch or Algolia
    if (params.search) {
      // Use contains for basic search (case-insensitive)
      where.OR = [
        {
          title: {
            contains: params.search,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: params.search,
            mode: 'insensitive',
          },
        },
        {
          tags: {
            some: {
              tag: {
                name: {
                  contains: params.search,
                  mode: 'insensitive',
                },
              },
            },
          },
        },
      ];
    }

    // Build orderBy
    let orderBy: Prisma.BlogOrderByWithRelationInput | Prisma.BlogOrderByWithRelationInput[];
    switch (sort) {
      case 'oldest':
        orderBy = [
          { publishedAt: 'asc' },
          { createdAt: 'asc' },
        ];
        break;
      case 'popular':
        // For popular, we'll need to use raw query or calculate separately
        // For now, use a simpler approach
        orderBy = { publishedAt: 'desc' };
        break;
      case 'newest':
      default:
        orderBy = [
          { publishedAt: 'desc' },
          { createdAt: 'desc' },
        ];
        break;
    }

    // Get blogs with tags - use retry wrapper for connection errors
    try {
      const [blogs, total] = await queryWithRetry(async () => {
        return await Promise.all([
          prisma.blog.findMany({
            where,
            skip,
            take: limit,
            orderBy: Array.isArray(orderBy) ? orderBy : [orderBy],
            include: {
              tags: {
                include: {
                  tag: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
          }),
          prisma.blog.count({ where }),
        ]);
      });

    // For popular sort, we need to sort by vote count
    if (sort === 'popular') {
      const blogsWithVotes = await Promise.all(
        blogs.map(async (blog) => {
          const upvotes = await queryWithRetry(async () => {
            return await prisma.blogVote.count({
              where: {
                blogId: blog.id,
                voteType: 'upvote',
              },
            });
          });
          return { blog, upvotes };
        })
      );

      blogsWithVotes.sort((a, b) => b.upvotes - a.upvotes);
      return {
        blogs: blogsWithVotes.map(({ blog }) => this.mapToPreview(blog)),
        total,
      };
    }

      return {
        blogs: blogs.map((blog) => this.mapToPreview(blog)),
        total,
      };
    } catch (error) {
      console.error('Error fetching blogs:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      throw new AppError('INTERNAL_ERROR', 'Failed to fetch blogs', 500);
    }
  }

  async getBlogBySlug(slug: string, ipAddress?: string, sessionId?: string): Promise<BlogDetail | null> {
    const blog = await queryWithRetry(async () => {
      return await prisma.blog.findUnique({
        where: { slug },
        include: {
          blocks: {
            orderBy: { blockOrder: 'asc' },
          },
          tags: {
            include: {
              tag: true,
            },
          },
          links: {
            orderBy: { linkOrder: 'asc' },
          },
        },
      });
    });

    // Check if blog exists and is published
    if (!blog || blog.status !== 'published') {
      return null;
    }

    // Get comments count (with retry)
    const commentsCount = await queryWithRetry(async () => {
      return await prisma.comment.count({
        where: {
          blogId: blog.id,
          status: 'approved',
        },
      });
    });

    // Get voting stats (with retry)
    const [upvotes, downvotes, userVote] = await queryWithRetry(async () => {
      return await Promise.all([
        prisma.blogVote.count({
          where: {
            blogId: blog.id,
            voteType: 'upvote',
          },
        }),
        prisma.blogVote.count({
          where: {
            blogId: blog.id,
            voteType: 'downvote',
          },
        }),
        ipAddress || sessionId
          ? prisma.blogVote.findFirst({
              where: {
                blogId: blog.id,
                OR: [
                  { ipAddress: ipAddress || undefined },
                  { sessionId: sessionId || undefined },
                ],
              },
              select: { voteType: true },
            })
          : null,
      ]);
    });

    return this.mapToDetail(
      blog,
      blog.blocks,
      blog.tags.map((bt) => bt.tag.name),
      blog.links,
      commentsCount,
      upvotes,
      downvotes,
      (userVote?.voteType as 'upvote' | 'downvote') || null
    );
  }

  async createBlog(data: {
    title: string;
    description?: string;
    slug?: string;
    author?: string;
    coverImage?: string;
    layout?: { type?: string; maxWidth?: string; showTableOfContents?: boolean };
    settings?: { enableVoting?: boolean; enableSocialShare?: boolean; enableComments?: boolean };
    tags?: string[];
    links?: Array<{ label: string; url: string; type?: string }>;
    blocks?: Array<{ type: string; content: any; order?: number }>;
    status?: string;
  }): Promise<BlogDetail> {
    // Generate slug if not provided
    const slug = data.slug || await generateSlug(data.title);

    // Calculate read time from blocks
    let readTime = null;
    if (data.blocks && data.blocks.length > 0) {
      const tempBlocks: BlogBlock[] = data.blocks.map((b: { type: string; content: any; order?: number }) => ({
        id: '',
        type: b.type as BlogBlock['type'],
        content: b.content,
      }));
      readTime = calculateReadTime(tempBlocks);
    }

    // Process tags - get or create (with retry for connection errors)
    const tagConnections = await Promise.all(
      (data.tags || []).map(async (tagName: string) => {
        const tagSlug = tagName.toLowerCase().replace(/\s+/g, '-');
        let tag = await queryWithRetry(async () => {
          return await prisma.tag.findUnique({
            where: { slug: tagSlug },
          });
        });

        if (!tag) {
          tag = await queryWithRetry(async () => {
            return await prisma.tag.create({
              data: {
                name: tagName,
                slug: tagSlug,
              },
            });
          });
        }

        return { tagId: tag.id };
      })
    );

    // Create blog with relations (with retry for connection errors)
    await queryWithRetry(async () => {
      return await prisma.blog.create({
      data: {
        slug,
        title: data.title,
        description: data.description || null,
        author: data.author || null,
        coverImageUrl: data.coverImage || null,
        publishedAt: data.status === 'published' ? new Date() : null,
        readTime,
        layoutType: (data.layout?.type || 'single-column') as 'single-column' | 'two-column',
        maxWidth: data.layout?.maxWidth || '800px',
        showTableOfContents: data.layout?.showTableOfContents || false,
        enableVoting: data.settings?.enableVoting !== false,
        enableSocialShare: data.settings?.enableSocialShare !== false,
        enableComments: data.settings?.enableComments !== false,
        status: (data.status || 'published') as 'published' | 'archived',
        tags: {
          create: tagConnections,
        },
        links: {
          create: (data.links || []).map((link, idx) => ({
            label: link.label,
            url: link.url,
            linkType: (link.type || 'external') as 'internal' | 'external',
            linkOrder: idx,
          })),
        },
        blocks: {
          create: (data.blocks || []).map((block: { type: string; content: any; order?: number }, idx: number) => ({
            blockType: block.type as any,
            blockOrder: block.order || idx,
            content: block.content as Prisma.InputJsonValue,
          })),
        },
      },
      include: {
        blocks: {
          orderBy: { blockOrder: 'asc' },
        },
        tags: {
          include: {
            tag: true,
          },
        },
        links: {
          orderBy: { linkOrder: 'asc' },
        },
      },
      });
    });

    // Fetch complete blog
    const completeBlog = await this.getBlogBySlug(slug);
    if (!completeBlog) {
      throw new AppError('INTERNAL_ERROR', 'Failed to retrieve created blog', 500);
    }

    return completeBlog;
  }

  async updateBlog(slug: string, data: Partial<{
    title: string;
    description?: string;
    slug?: string;
    author?: string;
    coverImage?: string;
    layout?: { type?: string; maxWidth?: string; showTableOfContents?: boolean };
    settings?: { enableVoting?: boolean; enableSocialShare?: boolean; enableComments?: boolean };
    tags?: string[];
    links?: Array<{ label: string; url: string; type?: string }>;
    blocks?: Array<{ type: string; content: any; order?: number }>;
    status?: string;
  }>): Promise<BlogDetail> {
    // Get existing blog (with retry)
    const existingBlog = await queryWithRetry(async () => {
      return await prisma.blog.findUnique({
        where: { slug },
      });
    });

    if (!existingBlog) {
      throw new AppError('NOT_FOUND', 'Blog not found', 404);
    }

    // Generate new slug if title changed
    let newSlug = existingBlog.slug;
    if (data.title && data.title !== existingBlog.title) {
      newSlug = data.slug || await generateSlug(data.title, existingBlog.slug);
    }

    // Recalculate read time if blocks changed
    let readTime = existingBlog.readTime;
    if (data.blocks && data.blocks.length > 0) {
      const tempBlocks: BlogBlock[] = data.blocks.map((b: { type: string; content: any; order?: number }) => ({
        id: '',
        type: b.type as BlogBlock['type'],
        content: b.content,
      }));
      readTime = calculateReadTime(tempBlocks);
    }

    // Process tags if provided
    let tagConnections: { tagId: string }[] | undefined;
    if (data.tags) {
      // Delete existing tags (with retry)
      await queryWithRetry(async () => {
        return await prisma.blogTag.deleteMany({
          where: { blogId: existingBlog.id },
        });
      });

      // Create new tag connections (with retry)
      tagConnections = await Promise.all(
        data.tags.map(async (tagName: string) => {
          const tagSlug = tagName.toLowerCase().replace(/\s+/g, '-');
          let tag = await queryWithRetry(async () => {
            return await prisma.tag.findUnique({
              where: { slug: tagSlug },
            });
          });

          if (!tag) {
            tag = await queryWithRetry(async () => {
              return await prisma.tag.create({
                data: {
                  name: tagName,
                  slug: tagSlug,
                },
              });
            });
          }

          return { tagId: tag.id };
        })
      );
    }

    // Update blog
    const updateData: Prisma.BlogUpdateInput = {
      slug: newSlug,
      title: data.title ?? undefined,
      description: data.description ?? undefined,
      author: data.author ?? undefined,
      coverImageUrl: data.coverImage ?? undefined,
      publishedAt:
        data.status === 'published' && !existingBlog.publishedAt
          ? new Date()
          : data.status
          ? undefined
          : undefined,
      readTime: readTime ?? undefined,
      layoutType: data.layout?.type
        ? (data.layout.type as 'single-column' | 'two-column')
        : undefined,
      maxWidth: data.layout?.maxWidth ?? undefined,
      showTableOfContents: data.layout?.showTableOfContents ?? undefined,
      enableVoting: data.settings?.enableVoting ?? undefined,
      enableSocialShare: data.settings?.enableSocialShare ?? undefined,
      enableComments: data.settings?.enableComments ?? undefined,
      status: data.status ? (data.status as 'published' | 'archived') : undefined,
    };

    if (tagConnections) {
      updateData.tags = {
        deleteMany: {},
        create: tagConnections,
      };
    }

    if (data.links) {
      updateData.links = {
        deleteMany: {},
        create: data.links.map((link: { label: string; url: string; type?: string }, idx: number) => ({
          label: link.label,
          url: link.url,
          linkType: (link.type || 'external') as 'internal' | 'external',
          linkOrder: idx,
        })),
      };
    }

    if (data.blocks) {
      updateData.blocks = {
        deleteMany: {},
        create: data.blocks.map((block: { type: string; content: any; order?: number }, idx: number) => ({
          blockType: block.type as any,
          blockOrder: block.order || idx,
          content: block.content as Prisma.InputJsonValue,
        })),
      };
    }

    await queryWithRetry(async () => {
      return await prisma.blog.update({
        where: { id: existingBlog.id },
        data: updateData,
      });
    });

    // Fetch updated blog
    const updatedBlog = await this.getBlogBySlug(newSlug);
    if (!updatedBlog) {
      throw new AppError('INTERNAL_ERROR', 'Failed to retrieve updated blog', 500);
    }

    return updatedBlog;
  }

  async deleteBlog(slug: string): Promise<void> {
    const result = await queryWithRetry(async () => {
      return await prisma.blog.delete({
        where: { slug },
      });
    });

    if (!result) {
      throw new AppError('NOT_FOUND', 'Blog not found', 404);
    }
  }

  private mapToPreview(blog: any): BlogPreview {
    return {
      id: blog.id,
      slug: blog.slug,
      meta: {
        title: blog.title,
        description: blog.description,
        author: blog.author,
        publishedAt: blog.publishedAt ? blog.publishedAt.toISOString() : null,
        readTime: blog.readTime,
        coverImage: blog.coverImageUrl,
      },
      tags: blog.tags?.map((bt: any) => bt.tag?.name || bt.name || '') || [],
    };
  }

  private mapToDetail(
    blog: any,
    blocks: any[],
    tags: string[],
    links: any[],
    commentsCount: number,
    upvotes: number,
    downvotes: number,
    userVote: 'upvote' | 'downvote' | null
  ): BlogDetail {
    // Ensure required fields are not null
    const description = blog.description || '';
    const author = blog.author || '';
    const publishedAt = blog.publishedAt ? blog.publishedAt.toISOString() : new Date().toISOString();
    const readTime = blog.readTime ?? 0;

    return {
      id: blog.id,
      slug: blog.slug,
      meta: {
        title: blog.title,
        description,
        author,
        publishedAt,
        readTime,
        coverImage: blog.coverImageUrl || undefined,
      },
      layout: {
        type: blog.layoutType || 'single-column',
        maxWidth: blog.maxWidth || '1200px',
        showTableOfContents: blog.showTableOfContents || false,
      },
      settings: {
        enableVoting: blog.enableVoting ?? true,
        enableSocialShare: blog.enableSocialShare ?? true,
        enableComments: blog.enableComments ?? true,
      },
      commentsCount,
      tags: tags || [],
      // Transform links to frontend format: { label, url, type }
      links: links.map((l) => ({
        label: l.label,
        url: l.url,
        type: l.linkType || 'external',
      })),
      // Transform blocks to frontend format: { id, type, content }
      blocks: blocks.map((b) => ({
        id: b.id,
        type: b.blockType,
        content: typeof b.content === 'string' ? JSON.parse(b.content) : b.content,
      })),
      voting: {
        enabled: blog.enableVoting ?? true,
        upvotes: upvotes || 0,
        downvotes: downvotes || 0,
        userVote: userVote || null,
      },
      socialShare: {
        enabled: blog.enableSocialShare ?? true,
        platforms: ['twitter', 'facebook', 'linkedin', 'copy'],
      },
    };
  }
}

export const blogService = new BlogService();
