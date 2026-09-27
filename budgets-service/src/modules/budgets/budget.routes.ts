import { Router } from 'express';
import {
  listBudgets,
  createBudget,
  getBudget,
  updateBudget,
  deleteBudget,
} from './budget.controller';
import { validateRequest } from '../../middlewares/validateRequest';
import {
  createBudgetSchema,
  updateBudgetSchema,
  budgetIdParamSchema,
  listBudgetsQuerySchema,
} from './budget.schema';

export const budgetRoutes = Router();

budgetRoutes
  .route('/')
  .get(validateRequest(listBudgetsQuerySchema, 'query'), listBudgets)
  .post(validateRequest(createBudgetSchema, 'body'), createBudget);

budgetRoutes
  .route('/:id')
  .get(validateRequest(budgetIdParamSchema, 'params'), getBudget)
  .patch(
    validateRequest(budgetIdParamSchema, 'params'),
    validateRequest(updateBudgetSchema, 'body'),
    updateBudget,
  )
  .delete(validateRequest(budgetIdParamSchema, 'params'), deleteBudget);
