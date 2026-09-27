import { Router } from 'express';
import {
  listCategories,
  createCategory,
  getCategory,
  updateCategory,
  deleteCategory,
} from './category.controller';
import { validateRequest } from '../../middlewares/validateRequest';
import { createCategorySchema, updateCategorySchema, categoryIdParamSchema } from './category.schema';

export const categoryRoutes = Router();

categoryRoutes
  .route('/')
  .get(listCategories)
  .post(validateRequest(createCategorySchema), createCategory);

categoryRoutes
  .route('/:id')
  .get(validateRequest(categoryIdParamSchema, 'params'), getCategory)
  .patch(
    validateRequest(categoryIdParamSchema, 'params'),
    validateRequest(updateCategorySchema),
    updateCategory,
  )
  .delete(validateRequest(categoryIdParamSchema, 'params'), deleteCategory);
