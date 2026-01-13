import { Router } from 'express';
import { blogController } from '../controllers/blogController';
import { voteController } from '../controllers/voteController';
import { commentController } from '../controllers/commentController';
import {
  validateBlogCreate,
  validateBlogUpdate,
  validateVote,
  validateComment,
  validateCommentStatus,
  validateSlugParam,
  validateIdParam,
  validateBlogQuery,
  validatePagination,
  validate,
} from '../middleware/validation';
import { requireAdminApiKey } from '../middleware/auth';
import { publicRateLimiter, adminRateLimiter, commentRateLimiter } from '../middleware/rateLimiter';

const router = Router();

// Public routes
router.get(
  '/',
  validateBlogQuery,
  validate,
  publicRateLimiter,
  blogController.getAllBlogs.bind(blogController)
);

router.get(
  '/:slug',
  validateSlugParam,
  validate,
  publicRateLimiter,
  blogController.getBlogBySlug.bind(blogController)
);

// Admin routes
router.post(
  '/',
  requireAdminApiKey,
  adminRateLimiter,
  validateBlogCreate,
  validate,
  blogController.createBlog.bind(blogController)
);

router.put(
  '/:slug',
  requireAdminApiKey,
  adminRateLimiter,
  validateSlugParam,
  validateBlogUpdate,
  validate,
  blogController.updateBlog.bind(blogController)
);

router.delete(
  '/:slug',
  requireAdminApiKey,
  adminRateLimiter,
  validateSlugParam,
  validate,
  blogController.deleteBlog.bind(blogController)
);

// Voting routes
router.post(
  '/:slug/vote',
  validateSlugParam,
  validateVote,
  validate,
  publicRateLimiter,
  voteController.vote.bind(voteController)
);

router.delete(
  '/:slug/vote',
  validateSlugParam,
  validate,
  publicRateLimiter,
  voteController.removeVote.bind(voteController)
);

// Comment routes
router.get(
  '/:slug/comments',
  validateSlugParam,
  validatePagination,
  validate,
  publicRateLimiter,
  commentController.getComments.bind(commentController)
);

router.post(
  '/:slug/comments',
  validateSlugParam,
  validateComment,
  validate,
  commentRateLimiter,
  commentController.createComment.bind(commentController)
);

router.delete(
  '/:slug/comments/:commentId',
  requireAdminApiKey,
  adminRateLimiter,
  validateSlugParam,
  validateIdParam,
  validate,
  commentController.deleteComment.bind(commentController)
);

router.put(
  '/:slug/comments/:commentId/status',
  requireAdminApiKey,
  adminRateLimiter,
  validateSlugParam,
  validateIdParam,
  validateCommentStatus,
  validate,
  commentController.updateCommentStatus.bind(commentController)
);

export default router;
