import { prisma } from '../config/database';
import { BlogPreview, BlogDetail } from '../types';
import { generateSlug } from '../utils/slug';
import { calculateReadTime } from '../utils/readTime';
import { AppError } from '../middleware/errorHandler';
import { Prisma } from '@prisma/client';

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
    const limit = params.limit || 10;
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
    let orderBy: Prisma.BlogOrderByWithRelationInput;
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

    // Get blogs with tags
    const [blogs, total] = await Promise.all([
      prisma.blog.findMany({
        where,
        skip,
        take: limit,
        orderBy: Array.isArray(orderBy) ? orderBy : [orderBy],
        include: {
          tags: {
            include: {
              tag: true,
            },
          },
        },
      }),
      prisma.blog.count({ where }),
    ]);

    // For popular sort, we need to sort by vote count
    if (sort === 'popular') {
      const blogsWithVotes = await Promise.all(
        blogs.map(async (blog) => {
          const upvotes = await prisma.blogVote.count({
            where: {
              blogId: blog.id,
              voteType: 'upvote',
            },
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
  }

  async getBlogBySlug(slug: string, ipAddress?: string, sessionId?: string): Promise<BlogDetail | null> {
    const blog = await prisma.blog.findUnique({
      where: { slug, status: 'published' },
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

    if (!blog) {
      return null;
    }

    // Get comments count
    const commentsCount = await prisma.comment.count({
      where: {
        blogId: blog.id,
        status: 'approved',
      },
    });

    // Get voting stats
    const [upvotes, downvotes, userVote] = await Promise.all([
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
      const tempBlocks = data.blocks.map((b, idx) => ({
        id: '',
        blogId: '',
        blockType: b.type as any,
        blockOrder: b.order || idx,
        content: b.content,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));
      readTime = calculateReadTime(tempBlocks);
    }

    // Process tags - get or create
    const tagConnections = await Promise.all(
      (data.tags || []).map(async (tagName) => {
        const tagSlug = tagName.toLowerCase().replace(/\s+/g, '-');
        let tag = await prisma.tag.findUnique({
          where: { slug: tagSlug },
        });

        if (!tag) {
          tag = await prisma.tag.create({
            data: {
              name: tagName,
              slug: tagSlug,
            },
          });
        }

        return { tagId: tag.id };
      })
    );

    // Create blog with relations
    const blog = await prisma.blog.create({
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
          create: (data.blocks || []).map((block, idx) => ({
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

    // Fetch complete blog
    const completeBlog = await this.getBlogBySlug(slug);
    if (!completeBlog) {
      throw new AppError('INTERNAL_ERROR', 'Failed to retrieve created blog', 500);
    }

    return completeBlog;
  }

  async updateBlog(slug: string, data: Partial<typeof data>): Promise<BlogDetail> {
    // Get existing blog
    const existingBlog = await prisma.blog.findUnique({
      where: { slug },
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
      const tempBlocks = data.blocks.map((b, idx) => ({
        id: '',
        blogId: '',
        blockType: b.type as any,
        blockOrder: b.order || idx,
        content: b.content,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));
      readTime = calculateReadTime(tempBlocks);
    }

    // Process tags if provided
    let tagConnections: { tagId: string }[] | undefined;
    if (data.tags) {
      // Delete existing tags
      await prisma.blogTag.deleteMany({
        where: { blogId: existingBlog.id },
      });

      // Create new tag connections
      tagConnections = await Promise.all(
        data.tags.map(async (tagName) => {
          const tagSlug = tagName.toLowerCase().replace(/\s+/g, '-');
          let tag = await prisma.tag.findUnique({
            where: { slug: tagSlug },
          });

          if (!tag) {
            tag = await prisma.tag.create({
              data: {
                name: tagName,
                slug: tagSlug,
              },
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
        create: data.links.map((link, idx) => ({
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
        create: data.blocks.map((block, idx) => ({
          blockType: block.type as any,
          blockOrder: block.order || idx,
          content: block.content as Prisma.InputJsonValue,
        })),
      };
    }

    await prisma.blog.update({
      where: { id: existingBlog.id },
      data: updateData,
    });

    // Fetch updated blog
    const updatedBlog = await this.getBlogBySlug(newSlug);
    if (!updatedBlog) {
      throw new AppError('INTERNAL_ERROR', 'Failed to retrieve updated blog', 500);
    }

    return updatedBlog;
  }

  async deleteBlog(slug: string): Promise<void> {
    const result = await prisma.blog.delete({
      where: { slug },
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
      tags: blog.tags?.map((bt: any) => bt.tag?.name || bt.name) || [],
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
      layout: {
        type: blog.layoutType,
        maxWidth: blog.maxWidth,
        showTableOfContents: blog.showTableOfContents,
      },
      settings: {
        enableVoting: blog.enableVoting,
        enableSocialShare: blog.enableSocialShare,
        enableComments: blog.enableComments,
      },
      commentsCount,
      tags,
      links: links.map((l) => ({
        id: l.id,
        blog_id: l.blogId,
        label: l.label,
        url: l.url,
        link_type: l.linkType,
        link_order: l.linkOrder,
        created_at: l.createdAt,
      })),
      blocks: blocks.map((b) => ({
        id: b.id,
        blog_id: b.blogId,
        block_type: b.blockType,
        block_order: b.blockOrder,
        content: typeof b.content === 'string' ? JSON.parse(b.content) : b.content,
        created_at: b.createdAt,
        updated_at: b.updatedAt,
      })),
      voting: {
        enabled: blog.enableVoting,
        upvotes,
        downvotes,
        userVote,
      },
      socialShare: {
        enabled: blog.enableSocialShare,
        platforms: ['twitter', 'facebook', 'linkedin', 'copy'],
      },
    };
  }
}

export const blogService = new BlogService();
