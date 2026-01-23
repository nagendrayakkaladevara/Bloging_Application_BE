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

/**
 * @swagger
 * /api/v1/blogs:
 *   get:
 *     summary: Get all blogs
 *     description: Retrieve a paginated list of blogs with optional filtering and sorting
 *     tags: [Blogs]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Number of blogs per page
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [newest, oldest, popular]
 *           default: newest
 *         description: Sort order
 *       - in: query
 *         name: tags
 *         schema:
 *           type: string
 *         description: Comma-separated list of tag slugs
 *       - in: query
 *         name: author
 *         schema:
 *           type: string
 *           maxLength: 255
 *         description: Filter by author name
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           maxLength: 200
 *         description: Search query
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         blogs:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Blog'
 *                         pagination:
 *                           $ref: '#/components/schemas/PaginationMeta'
 */
router.get(
  '/',
  validateBlogQuery,
  validate,
  publicRateLimiter,
  blogController.getAllBlogs.bind(blogController)
);

/**
 * @swagger
 * /api/v1/blogs/{slug}:
 *   get:
 *     summary: Get blog by slug
 *     description: Retrieve a single blog post by its slug
 *     tags: [Blogs]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[a-z0-9-]+$'
 *         description: Blog post slug
 *       - in: header
 *         name: X-Session-ID
 *         schema:
 *           type: string
 *         description: Optional session ID for tracking user votes
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         blog:
 *                           $ref: '#/components/schemas/Blog'
 *       404:
 *         description: Blog not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.get(
  '/:slug',
  validateSlugParam,
  validate,
  publicRateLimiter,
  blogController.getBlogBySlug.bind(blogController)
);

/**
 * @swagger
 * /api/v1/blogs:
 *   post:
 *     summary: Create a new blog post
 *     description: Create a new blog post (Admin only)
 *     tags: [Blogs]
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BlogCreate'
 *     responses:
 *       201:
 *         description: Blog created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         blog:
 *                           $ref: '#/components/schemas/Blog'
 *                     message:
 *                       type: string
 *                       example: Blog created successfully
 *       401:
 *         description: Unauthorized - Invalid or missing API key
 *       422:
 *         description: Validation error
 */
router.post(
  '/',
  requireAdminApiKey,
  adminRateLimiter,
  validateBlogCreate,
  validate,
  blogController.createBlog.bind(blogController)
);

/**
 * @swagger
 * /api/v1/blogs/{slug}:
 *   put:
 *     summary: Update a blog post
 *     description: Update an existing blog post by slug (Admin only)
 *     tags: [Blogs]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[a-z0-9-]+$'
 *         description: Blog post slug
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BlogCreate'
 *     responses:
 *       200:
 *         description: Blog updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         blog:
 *                           $ref: '#/components/schemas/Blog'
 *                     message:
 *                       type: string
 *                       example: Blog updated successfully
 *       401:
 *         description: Unauthorized - Invalid or missing API key
 *       404:
 *         description: Blog not found
 *       422:
 *         description: Validation error
 */
router.put(
  '/:slug',
  requireAdminApiKey,
  adminRateLimiter,
  validateSlugParam,
  validateBlogUpdate,
  validate,
  blogController.updateBlog.bind(blogController)
);

/**
 * @swagger
 * /api/v1/blogs/{slug}:
 *   delete:
 *     summary: Delete a blog post
 *     description: Delete a blog post by slug (Admin only)
 *     tags: [Blogs]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[a-z0-9-]+$'
 *         description: Blog post slug
 *     responses:
 *       200:
 *         description: Blog deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: Blog deleted successfully
 *       401:
 *         description: Unauthorized - Invalid or missing API key
 *       404:
 *         description: Blog not found
 */
router.delete(
  '/:slug',
  requireAdminApiKey,
  adminRateLimiter,
  validateSlugParam,
  validate,
  blogController.deleteBlog.bind(blogController)
);

/**
 * @swagger
 * /api/v1/blogs/{slug}/vote:
 *   post:
 *     summary: Vote on a blog post
 *     description: Submit an upvote or downvote for a blog post
 *     tags: [Voting]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[a-z0-9-]+$'
 *         description: Blog post slug
 *       - in: header
 *         name: X-Session-ID
 *         schema:
 *           type: string
 *         description: Optional session ID for tracking user votes
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VoteRequest'
 *     responses:
 *       200:
 *         description: Vote recorded successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         voting:
 *                           type: object
 *                           properties:
 *                             enabled:
 *                               type: boolean
 *                             upvotes:
 *                               type: integer
 *                             downvotes:
 *                               type: integer
 *                             userVote:
 *                               type: string
 *                               enum: [upvote, downvote, null]
 *                     message:
 *                       type: string
 *                       example: Vote recorded successfully
 *       404:
 *         description: Blog not found
 *       422:
 *         description: Validation error
 */
router.post(
  '/:slug/vote',
  validateSlugParam,
  validateVote,
  validate,
  publicRateLimiter,
  voteController.vote.bind(voteController)
);

/**
 * @swagger
 * /api/v1/blogs/{slug}/vote:
 *   delete:
 *     summary: Remove vote from a blog post
 *     description: Remove a previously submitted vote
 *     tags: [Voting]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[a-z0-9-]+$'
 *         description: Blog post slug
 *       - in: header
 *         name: X-Session-ID
 *         schema:
 *           type: string
 *         description: Optional session ID for tracking user votes
 *     responses:
 *       200:
 *         description: Vote removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         voting:
 *                           type: object
 *                           properties:
 *                             enabled:
 *                               type: boolean
 *                             upvotes:
 *                               type: integer
 *                             downvotes:
 *                               type: integer
 *                             userVote:
 *                               type: string
 *                               nullable: true
 *                     message:
 *                       type: string
 *                       example: Vote removed successfully
 *       404:
 *         description: Blog not found
 */
router.delete(
  '/:slug/vote',
  validateSlugParam,
  validate,
  publicRateLimiter,
  voteController.removeVote.bind(voteController)
);

/**
 * @swagger
 * /api/v1/blogs/{slug}/comments:
 *   get:
 *     summary: Get comments for a blog post
 *     description: Retrieve paginated comments for a specific blog post
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[a-z0-9-]+$'
 *         description: Blog post slug
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of comments per page
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [newest, oldest]
 *           default: newest
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         comments:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Comment'
 *                         pagination:
 *                           $ref: '#/components/schemas/PaginationMeta'
 *       404:
 *         description: Blog not found
 */
router.get(
  '/:slug/comments',
  validateSlugParam,
  validatePagination,
  validate,
  publicRateLimiter,
  commentController.getComments.bind(commentController)
);

/**
 * @swagger
 * /api/v1/blogs/{slug}/comments:
 *   post:
 *     summary: Create a comment on a blog post
 *     description: Submit a new comment on a blog post
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[a-z0-9-]+$'
 *         description: Blog post slug
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CommentCreate'
 *     responses:
 *       201:
 *         description: Comment posted successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         comment:
 *                           $ref: '#/components/schemas/Comment'
 *                     message:
 *                       type: string
 *                       example: Comment posted successfully
 *       404:
 *         description: Blog not found
 *       422:
 *         description: Validation error
 */
router.post(
  '/:slug/comments',
  validateSlugParam,
  validateComment,
  validate,
  commentRateLimiter,
  commentController.createComment.bind(commentController)
);

/**
 * @swagger
 * /api/v1/blogs/{slug}/comments/{commentId}:
 *   delete:
 *     summary: Delete a comment
 *     description: Delete a comment by ID (Admin only)
 *     tags: [Comments]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[a-z0-9-]+$'
 *         description: Blog post slug
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Comment ID
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: Comment deleted successfully
 *       401:
 *         description: Unauthorized - Invalid or missing API key
 *       404:
 *         description: Comment not found
 */
router.delete(
  '/:slug/comments/:commentId',
  requireAdminApiKey,
  adminRateLimiter,
  validateSlugParam,
  validateIdParam,
  validate,
  commentController.deleteComment.bind(commentController)
);

/**
 * @swagger
 * /api/v1/blogs/{slug}/comments/{commentId}/status:
 *   put:
 *     summary: Update comment status
 *     description: Update the status of a comment (Admin only)
 *     tags: [Comments]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[a-z0-9-]+$'
 *         description: Blog post slug
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Comment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CommentStatusUpdate'
 *     responses:
 *       200:
 *         description: Comment status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         comment:
 *                           allOf:
 *                             - $ref: '#/components/schemas/Comment'
 *                             - type: object
 *                               properties:
 *                                 status:
 *                                   type: string
 *                                   enum: [approved, pending, spam, deleted]
 *                     message:
 *                       type: string
 *                       example: Comment status updated successfully
 *       401:
 *         description: Unauthorized - Invalid or missing API key
 *       404:
 *         description: Comment not found
 *       422:
 *         description: Validation error
 */
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
