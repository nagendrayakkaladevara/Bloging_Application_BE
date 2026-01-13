import { Router } from 'express';
import { tagController } from '../controllers/tagController';
import { validateSlugParam, validatePagination, validate } from '../middleware/validation';
import { publicRateLimiter } from '../middleware/rateLimiter';

const router = Router();

router.get(
  '/',
  publicRateLimiter,
  tagController.getAllTags.bind(tagController)
);

router.get(
  '/:slug',
  validateSlugParam,
  validatePagination,
  validate,
  publicRateLimiter,
  tagController.getBlogsByTag.bind(tagController)
);

export default router;
