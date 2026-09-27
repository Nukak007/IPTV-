import { Request, Response, NextFunction } from 'express';
import { CategoryService } from './category.service';

const service = new CategoryService();

// GET /api/v1/categories
export async function listCategories(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const categories = await service.findAll();
    res.json({ status: 'success', data: categories });
  } catch (error) {
    next(error);
  }
}

// POST /api/v1/categories
export async function createCategory(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const category = await service.create(req.body);
    res.status(201).json({ status: 'success', data: category });
  } catch (error) {
    next(error);
  }
}

// GET /api/v1/categories/:id
export async function getCategory(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const category = await service.findById(req.params['id'] as string);
    res.json({ status: 'success', data: category });
  } catch (error) {
    next(error);
  }
}

// PATCH /api/v1/categories/:id
export async function updateCategory(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const category = await service.update(req.params['id'] as string, req.body);
    res.json({ status: 'success', data: category });
  } catch (error) {
    next(error);
  }
}

// DELETE /api/v1/categories/:id
export async function deleteCategory(
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
