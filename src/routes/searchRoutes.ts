import { Router } from 'express';
import { searchController } from '../controllers/searchController';
import { validateSearchQuery, validate } from '../middleware/validation';
import { publicRateLimiter } from '../middleware/rateLimiter';

const router = Router();

router.get(
  '/',
  validateSearchQuery,
  validate,
  publicRateLimiter,
  searchController.search.bind(searchController)
);

export default router;
