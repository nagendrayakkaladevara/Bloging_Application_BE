import { Router } from 'express';
import { tagController } from '../controllers/tagController';
import { validateSlugParam, validatePagination, validate } from '../middleware/validation';
import { publicRateLimiter } from '../middleware/rateLimiter';

const router = Router();

/**
 * @swagger
 * /api/v1/tags:
 *   get:
 *     summary: Get all tags
 *     description: Retrieve all tags with optional filtering for popular tags
 *     tags: [Tags]
 *     parameters:
 *       - in: query
 *         name: popular
 *         schema:
 *           type: boolean
 *         description: Filter to show only popular tags
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Limit the number of tags returned
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
 *                         tags:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Tag'
 */
router.get(
  '/',
  publicRateLimiter,
  tagController.getAllTags.bind(tagController)
);

/**
 * @swagger
 * /api/v1/tags/{slug}:
 *   get:
 *     summary: Get blogs by tag
 *     description: Retrieve all blogs associated with a specific tag
 *     tags: [Tags]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[a-z0-9-]+$'
 *         description: Tag slug
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
 *                         tag:
 *                           $ref: '#/components/schemas/Tag'
 *                         blogs:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Blog'
 *                         pagination:
 *                           $ref: '#/components/schemas/PaginationMeta'
 *       404:
 *         description: Tag not found
 */
router.get(
  '/:slug',
  validateSlugParam,
  validatePagination,
  validate,
  publicRateLimiter,
  tagController.getBlogsByTag.bind(tagController)
);

export default router;
