import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Categoria } from '../entities/categoria.entity';

@Injectable()
export class CategoriaRepository {
  constructor(
    @InjectRepository(Categoria)
    private readonly repo: Repository<Categoria>,
  ) {}

  async findAll(): Promise<Categoria[]> {
    return this.repo.find({
      relations: { marcos: true },
      order: { nombre: 'ASC' },
    });
  }

  async findById(id: string): Promise<Categoria | null> {
    return this.repo.findOne({
      where: { id },
      relations: { marcos: true },
    });
  }

  async findBySlug(slug: string): Promise<Categoria | null> {
    return this.repo.findOne({
      where: { slug },
      relations: { marcos: true },
    });
  }

  async findByNombre(nombre: string): Promise<Categoria | null> {
    return this.repo.findOne({ where: { nombre } });
  }

  async create(data: Partial<Categoria>): Promise<Categoria> {
    const categoria = this.repo.create(data);
    return this.repo.save(categoria);
  }

  async update(id: string, data: Partial<Categoria>): Promise<Categoria | null> {
    await this.repo.update(id, data);
    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repo.delete(id);
    return !!result.affected && result.affected > 0;
  }

  async count(): Promise<number> {
    return this.repo.count();
  }
}
