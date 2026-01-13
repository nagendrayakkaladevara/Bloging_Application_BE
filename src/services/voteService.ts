import { prisma } from '../config/database';
import { AppError } from '../middleware/errorHandler';

export class VoteService {
  async vote(blogSlug: string, voteType: 'upvote' | 'downvote', ipAddress?: string, sessionId?: string): Promise<{
    enabled: boolean;
    upvotes: number;
    downvotes: number;
    userVote: 'upvote' | 'downvote' | null;
  }> {
    // Get blog
    const blog = await prisma.blog.findUnique({
      where: { slug: blogSlug },
      select: { id: true, enableVoting: true },
    });

    if (!blog) {
      throw new AppError('NOT_FOUND', 'Blog not found', 404);
    }

    if (!blog.enableVoting) {
      throw new AppError('VALIDATION_ERROR', 'Voting is disabled for this blog', 400);
    }

    if (!ipAddress && !sessionId) {
      throw new AppError('VALIDATION_ERROR', 'IP address or session ID is required', 400);
    }

    // Check if vote exists and update or create
    const existingVote = await prisma.blogVote.findFirst({
      where: {
        blogId: blog.id,
        OR: [
          { ipAddress: ipAddress || undefined },
          { sessionId: sessionId || undefined },
        ],
      },
    });

    if (existingVote) {
      // Update existing vote
      await prisma.blogVote.update({
        where: { id: existingVote.id },
        data: { voteType },
      });
    } else {
      // Create new vote
      await prisma.blogVote.create({
        data: {
          blogId: blog.id,
          ipAddress: ipAddress || null,
          sessionId: sessionId || null,
          voteType,
        },
      });
    }

    // Get updated counts
    return await this.getVotingStats(blog.id, ipAddress, sessionId);
  }

  async removeVote(blogSlug: string, ipAddress?: string, sessionId?: string): Promise<{
    enabled: boolean;
    upvotes: number;
    downvotes: number;
    userVote: null;
  }> {
    // Get blog
    const blog = await prisma.blog.findUnique({
      where: { slug: blogSlug },
      select: { id: true, enableVoting: true },
    });

    if (!blog) {
      throw new AppError('NOT_FOUND', 'Blog not found', 404);
    }

    if (!ipAddress && !sessionId) {
      throw new AppError('VALIDATION_ERROR', 'IP address or session ID is required', 400);
    }

    // Delete vote
    await prisma.blogVote.deleteMany({
      where: {
        blogId: blog.id,
        OR: [
          { ipAddress: ipAddress || undefined },
          { sessionId: sessionId || undefined },
        ],
      },
    });

    // Get updated counts
    const stats = await this.getVotingStats(blog.id, ipAddress, sessionId);
    return { ...stats, userVote: null };
  }

  async getVotingStats(blogId: string, ipAddress?: string, sessionId?: string): Promise<{
    enabled: boolean;
    upvotes: number;
    downvotes: number;
    userVote: 'upvote' | 'downvote' | null;
  }> {
    // Get blog voting settings
    const blog = await prisma.blog.findUnique({
      where: { id: blogId },
      select: { enableVoting: true },
    });

    if (!blog) {
      throw new AppError('NOT_FOUND', 'Blog not found', 404);
    }

    // Get vote counts
    const [upvotes, downvotes, userVoteResult] = await Promise.all([
      prisma.blogVote.count({
        where: {
          blogId,
          voteType: 'upvote',
        },
      }),
      prisma.blogVote.count({
        where: {
          blogId,
          voteType: 'downvote',
        },
      }),
      ipAddress || sessionId
        ? prisma.blogVote.findFirst({
            where: {
              blogId,
              OR: [
                { ipAddress: ipAddress || undefined },
                { sessionId: sessionId || undefined },
              ],
            },
            select: { voteType: true },
          })
        : null,
    ]);

    return {
      enabled: blog.enableVoting,
      upvotes,
      downvotes,
      userVote: (userVoteResult?.voteType as 'upvote' | 'downvote') || null,
    };
  }
}

export const voteService = new VoteService();
