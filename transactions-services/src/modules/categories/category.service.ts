import { CategoryRepository } from './category.repository';
import { CreateCategoryDto, UpdateCategoryDto } from './category.schema';
import { Category } from './category.types';
import { AppError } from '../../middlewares/errorHandler';

export class CategoryService {
  private readonly repository: CategoryRepository;

  constructor() {
    this.repository = new CategoryRepository();
  }

  async findAll(): Promise<Category[]> {
    return this.repository.findAll();
  }

  async findById(id: string): Promise<Category> {
    const category = await this.repository.findById(id);

    if (!category) {
      throw new AppError(404, `Categoría con ID "${id}" no encontrada`);
    }

    return category;
  }

  async create(dto: CreateCategoryDto): Promise<Category> {
    // Verificar unicidad del nombre
    const existing = await this.repository.findByName(dto.name);

    if (existing) {
      throw new AppError(409, `Ya existe una categoría con el nombre "${dto.name}"`);
    }

    return this.repository.create(dto);
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<Category> {
    // Verificar que existe
    await this.findById(id);

    // Si se cambia el nombre, verificar unicidad
    if (dto.name) {
      const existing = await this.repository.findByName(dto.name);

      if (existing && existing.id !== id) {
        throw new AppError(409, `Ya existe una categoría con el nombre "${dto.name}"`);
      }
    }

    return this.repository.update(id, dto);
  }

  async remove(id: string): Promise<void> {
    await this.findById(id); // Verifica que existe antes de borrar
    await this.repository.delete(id);
  }
}
