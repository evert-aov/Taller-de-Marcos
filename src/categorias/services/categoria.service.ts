import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CategoriaRepository } from '../repositories/categoria.repository';
import { Categoria } from '../entities/categoria.entity';
import { CreateCategoriaDto } from '../dto/create-categoria.dto';
import { UpdateCategoriaDto } from '../dto/update-categoria.dto';

@Injectable()
export class CategoriaService {
  constructor(private readonly categoriaRepo: CategoriaRepository) {}

  private generateSlug(text: string): string {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-');
  }

  async findAll(): Promise<Categoria[]> {
    return this.categoriaRepo.findAll();
  }

  async findById(id: string): Promise<Categoria> {
    const categoria = await this.categoriaRepo.findById(id);
    if (!categoria) {
      throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
    }
    return categoria;
  }

  async findBySlug(slug: string): Promise<Categoria> {
    const categoria = await this.categoriaRepo.findBySlug(slug);
    if (!categoria) {
      throw new NotFoundException(`Categoría con slug '${slug}' no encontrada`);
    }
    return categoria;
  }

  async create(createDto: CreateCategoriaDto): Promise<Categoria> {
    const slug = createDto.slug ? this.generateSlug(createDto.slug) : this.generateSlug(createDto.nombre);
    
    const existing = await this.categoriaRepo.findBySlug(slug);
    if (existing) {
      throw new ConflictException(`Ya existe una categoría con el slug '${slug}'`);
    }

    return this.categoriaRepo.create({
      nombre: createDto.nombre.trim(),
      slug,
      descripcion: createDto.descripcion?.trim() || '',
    });
  }

  async update(id: string, updateDto: UpdateCategoriaDto): Promise<Categoria> {
    await this.findById(id);

    const updateData: Partial<Categoria> = {};
    if (updateDto.nombre !== undefined) {
      updateData.nombre = updateDto.nombre.trim();
    }
    if (updateDto.descripcion !== undefined) {
      updateData.descripcion = updateDto.descripcion.trim();
    }
    if (updateDto.slug !== undefined) {
      updateData.slug = this.generateSlug(updateDto.slug);
    } else if (updateDto.nombre !== undefined) {
      updateData.slug = this.generateSlug(updateDto.nombre);
    }

    if (updateData.slug) {
      const existing = await this.categoriaRepo.findBySlug(updateData.slug);
      if (existing && existing.id !== id) {
        throw new ConflictException(`Ya existe otra categoría con el slug '${updateData.slug}'`);
      }
    }

    const updated = await this.categoriaRepo.update(id, updateData);
    if (!updated) {
      throw new NotFoundException(`Error actualizando categoría ${id}`);
    }
    return updated;
  }

  async delete(id: string): Promise<{ success: boolean; message: string }> {
    await this.findById(id);
    const deleted = await this.categoriaRepo.delete(id);
    return {
      success: deleted,
      message: deleted ? 'Categoría eliminada exitosamente' : 'No se pudo eliminar la categoría',
    };
  }

  async count(): Promise<number> {
    return this.categoriaRepo.count();
  }
}
