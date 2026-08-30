import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Marco } from '../entities/marco.entity';
import { FilterMarcoDto } from '../dto/filter-marco.dto';

@Injectable()
export class MarcoRepository {
  constructor(
    @InjectRepository(Marco)
    private readonly repo: Repository<Marco>,
  ) {}

  async findAll(filter?: FilterMarcoDto): Promise<Marco[]> {
    const qb = this.repo.createQueryBuilder('marco')
      .leftJoinAndSelect('marco.categoria', 'categoria');

    if (filter) {
      if (filter.search) {
        qb.andWhere(
          '(LOWER(marco.nombre) LIKE LOWER(:search) OR LOWER(marco.tipoMadera) LIKE LOWER(:search) OR LOWER(marco.dimensiones) LIKE LOWER(:search))',
          { search: `%${filter.search}%` },
        );
      }

      if (filter.categoriaId) {
        qb.andWhere('marco.categoriaId = :categoriaId', {
          categoriaId: filter.categoriaId,
        });
      }

      if (filter.categoriaSlug) {
        qb.andWhere('categoria.slug = :categoriaSlug', {
          categoriaSlug: filter.categoriaSlug,
        });
      }

      if (filter.tipoMadera) {
        qb.andWhere('LOWER(marco.tipoMadera) = LOWER(:tipoMadera)', {
          tipoMadera: filter.tipoMadera,
        });
      }

      if (filter.precioMin !== undefined) {
        qb.andWhere('marco.precio >= :precioMin', {
          precioMin: filter.precioMin,
        });
      }

      if (filter.precioMax !== undefined) {
        qb.andWhere('marco.precio <= :precioMax', {
          precioMax: filter.precioMax,
        });
      }

      if (filter.disponible !== undefined) {
        qb.andWhere('marco.disponible = :disponible', {
          disponible: filter.disponible,
        });
      }

      if (filter.sortBy) {
        switch (filter.sortBy) {
          case 'precio_asc':
            qb.orderBy('marco.precio', 'ASC');
            break;
          case 'precio_desc':
            qb.orderBy('marco.precio', 'DESC');
            break;
          case 'nombre_asc':
            qb.orderBy('marco.nombre', 'ASC');
            break;
          case 'nombre_desc':
            qb.orderBy('marco.nombre', 'DESC');
            break;
          case 'recientes':
          default:
            qb.orderBy('marco.createdAt', 'DESC');
            break;
        }
      } else {
        qb.orderBy('marco.createdAt', 'DESC');
      }
    } else {
      qb.orderBy('marco.createdAt', 'DESC');
    }

    return qb.getMany();
  }

  async findById(id: string): Promise<Marco | null> {
    return this.repo.findOne({
      where: { id },
      relations: { categoria: true },
    });
  }

  async create(data: Partial<Marco>): Promise<Marco> {
    const marco = this.repo.create(data);
    return this.repo.save(marco);
  }

  async update(id: string, data: Partial<Marco>): Promise<Marco | null> {
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

  async getWoodTypes(): Promise<string[]> {
    const result = await this.repo
      .createQueryBuilder('marco')
      .select('DISTINCT marco.tipoMadera', 'tipoMadera')
      .where('marco.tipoMadera IS NOT NULL')
      .getRawMany();
    return result.map((r) => r.tipoMadera).filter(Boolean);
  }
}
