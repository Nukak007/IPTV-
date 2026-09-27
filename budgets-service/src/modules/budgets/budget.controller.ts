import { Request, Response, NextFunction } from 'express';
import { BudgetService } from './budget.service';

const service = new BudgetService();

// GET /api/v1/budgets
export async function listBudgets(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await service.findAll(req.query as any);
    res.json({
      status: 'success',
      data: result.items,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/v1/budgets
export async function createBudget(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const budget = await service.create(req.body);
    res.status(201).json({ status: 'success', data: budget });
  } catch (error) {
    next(error);
  }
}

// GET /api/v1/budgets/:id
export async function getBudget(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const budget = await service.findById(req.params['id'] as string);
    res.json({ status: 'success', data: budget });
  } catch (error) {
    next(error);
  }
}

// PATCH /api/v1/budgets/:id
export async function updateBudget(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const budget = await service.update(req.params['id'] as string, req.body);
    res.json({ status: 'success', data: budget });
  } catch (error) {
    next(error);
  }
}

// DELETE /api/v1/budgets/:id
export async function deleteBudget(
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
