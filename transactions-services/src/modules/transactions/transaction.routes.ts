import { Router } from 'express';
import {
  createTransaction,
  listTransactions,
  getTransaction,
  updateTransaction,
  deleteTransaction,
} from './transaction.controller';
import { validateRequest } from '../../middlewares/validateRequest';
import {
  createTransactionSchema,
  updateTransactionSchema,
  listTransactionsQuerySchema,
  idParamSchema,
} from './transaction.schema';

export const transactionRoutes = Router();

transactionRoutes
  .route('/')
  .post(validateRequest(createTransactionSchema), createTransaction)
  .get(validateRequest(listTransactionsQuerySchema, 'query'), listTransactions);

transactionRoutes
  .route('/:id')
  .get(validateRequest(idParamSchema, 'params'), getTransaction)
  .patch(
    validateRequest(idParamSchema, 'params'),
    validateRequest(updateTransactionSchema),
    updateTransaction,
  )
  .delete(validateRequest(idParamSchema, 'params'), deleteTransaction);
