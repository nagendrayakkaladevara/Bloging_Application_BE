import { body, query, param, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';

// Standalone middleware to check validation results from previous validation chains
export const validate = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorDetails: Record<string, string[]> = {};
      errors.array().forEach((error: any) => {
        const field = error.path || error.param;
        if (!errorDetails[field]) {
          errorDetails[field] = [];
        }
        errorDetails[field].push(error.msg);
      });

      return next(new AppError(
        'VALIDATION_ERROR',
        'Validation failed',
        422,
        { fields: errorDetails }
      ));
    }

    next();
  } catch (error) {
    next(error);
  }
};

// Blog validation
export const validateBlogCreate = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 1, max: 500 }).withMessage('Title must be between 1 and 500 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage('Description must not exceed 2000 characters'),
  body('slug')
    .optional()
    .trim()
    .matches(/^[a-z0-9-]+$/).withMessage('Slug must be lowercase with hyphens only'),
  body('author')
    .optional()
    .trim()
    .isLength({ max: 255 }).withMessage('Author name must not exceed 255 characters'),
  body('coverImage')
    .optional()
    .isURL().withMessage('Cover image must be a valid URL'),
  body('layout.type')
    .optional()
    .isIn(['single-column', 'two-column']).withMessage('Layout type must be single-column or two-column'),
  body('layout.maxWidth')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('Max width must not exceed 50 characters'),
  body('layout.showTableOfContents')
    .optional()
    .isBoolean().withMessage('showTableOfContents must be a boolean'),
  body('settings.enableVoting')
    .optional()
    .isBoolean().withMessage('enableVoting must be a boolean'),
  body('settings.enableSocialShare')
    .optional()
    .isBoolean().withMessage('enableSocialShare must be a boolean'),
  body('settings.enableComments')
    .optional()
    .isBoolean().withMessage('enableComments must be a boolean'),
  body('status')
    .optional()
    .isIn(['published', 'archived']).withMessage('Status must be published or archived'),
  body('tags')
    .optional()
    .isArray().withMessage('Tags must be an array'),
  body('blocks')
    .optional()
    .isArray().withMessage('Blocks must be an array'),
];

export const validateBlogUpdate = validateBlogCreate.map(validation => validation.optional());

// Vote validation
export const validateVote = [
  body('voteType')
    .notEmpty().withMessage('Vote type is required')
    .isIn(['upvote', 'downvote']).withMessage('Vote type must be upvote or downvote'),
];

// Comment validation
export const validateComment = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 1, max: 255 }).withMessage('Name must be between 1 and 255 characters'),
  body('comment')
    .trim()
    .notEmpty().withMessage('Comment is required')
    .isLength({ min: 1, max: 5000 }).withMessage('Comment must be between 1 and 5000 characters'),
];

export const validateCommentStatus = [
  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(['approved', 'pending', 'spam', 'deleted']).withMessage('Status must be approved, pending, spam, or deleted'),
];

// Calendar event validation
export const validateCalendarEvent = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 1, max: 255 }).withMessage('Title must be between 1 and 255 characters'),
  body('description')
    .optional()
    .trim(),
  body('date')
    .notEmpty().withMessage('Date is required')
    .isISO8601().withMessage('Date must be a valid ISO 8601 date'),
  body('startTime')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Start time must be in HH:mm format'),
  body('endTime')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('End time must be in HH:mm format'),
  body('color')
    .optional()
    .isIn(['blue', 'green', 'purple', 'orange']).withMessage('Color must be blue, green, purple, or orange'),
  body('blogId')
    .optional()
    .isUUID().withMessage('Blog ID must be a valid UUID'),
];

// Query parameter validation
export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer')
    .toInt(),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
    .toInt(),
];

export const validateBlogQuery = [
  ...validatePagination,
  query('sort')
    .optional()
    .isIn(['newest', 'oldest', 'popular']).withMessage('Sort must be newest, oldest, or popular'),
  query('tags')
    .optional()
    .isString().withMessage('Tags must be a comma-separated string'),
  query('author')
    .optional()
    .trim()
    .isLength({ max: 255 }).withMessage('Author must not exceed 255 characters'),
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 }).withMessage('Search query must be between 1 and 200 characters'),
];

export const validateSearchQuery = [
  query('q')
    .trim()
    .notEmpty().withMessage('Search query is required')
    .isLength({ min: 1, max: 200 }).withMessage('Search query must be between 1 and 200 characters'),
  ...validatePagination,
];

export const validateSlugParam = [
  param('slug')
    .trim()
    .notEmpty().withMessage('Slug is required')
    .matches(/^[a-z0-9-]+$/).withMessage('Slug must be lowercase with hyphens only'),
];

export const validateIdParam = [
  param('id')
    .isUUID().withMessage('ID must be a valid UUID'),
];
