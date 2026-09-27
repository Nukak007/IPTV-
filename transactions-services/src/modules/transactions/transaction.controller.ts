import { Request, Response, NextFunction } from 'express';
import { TransactionService } from './transaction.service';

const service = new TransactionService();

// POST /api/v1/transactions
export async function createTransaction(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const transaction = await service.create(req.body);
    res.status(201).json({ status: 'success', data: transaction });
  } catch (error) {
    next(error);
  }
}

// GET /api/v1/transactions
export async function listTransactions(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await service.findMany(req.query as any);
    res.json({ status: 'success', ...result });
  } catch (error) {
    next(error);
  }
}

// GET /api/v1/transactions/:id
export async function getTransaction(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const transaction = await service.findById(req.params['id'] as string);
    res.json({ status: 'success', data: transaction });
  } catch (error) {
    next(error);
  }
}

// PATCH /api/v1/transactions/:id
export async function updateTransaction(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const transaction = await service.update(req.params['id'] as string, req.body);
    res.json({ status: 'success', data: transaction });
  } catch (error) {
    next(error);
  }
}

// DELETE /api/v1/transactions/:id
export async function deleteTransaction(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await service.remove(req.params['id'] as string);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

