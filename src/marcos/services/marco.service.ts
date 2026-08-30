import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { MarcoRepository } from '../repositories/marco.repository';
import { CategoriaRepository } from '../../categorias/repositories/categoria.repository';
import { Marco } from '../entities/marco.entity';
import { CreateMarcoDto } from '../dto/create-marco.dto';
import { UpdateMarcoDto } from '../dto/update-marco.dto';
import { FilterMarcoDto } from '../dto/filter-marco.dto';

@Injectable()
export class MarcoService {
  constructor(
    private readonly marcoRepo: MarcoRepository,
    private readonly categoriaRepo: CategoriaRepository,
  ) {}

  async findAll(filter?: FilterMarcoDto): Promise<Marco[]> {
    return this.marcoRepo.findAll(filter);
  }

  async findById(id: string): Promise<Marco> {
    const marco = await this.marcoRepo.findById(id);
    if (!marco) {
      throw new NotFoundException(`Marco con ID ${id} no encontrado`);
    }
    return marco;
  }

  async create(createDto: CreateMarcoDto): Promise<Marco> {
    const categoria = await this.categoriaRepo.findById(createDto.categoriaId);
    if (!categoria) {
      throw new BadRequestException(
        `La categoría con ID ${createDto.categoriaId} no existe`,
      );
    }

    return this.marcoRepo.create({
      nombre: createDto.nombre.trim(),
      categoriaId: createDto.categoriaId,
      dimensiones: createDto.dimensiones.trim(),
      tipoMadera: createDto.tipoMadera.trim(),
      precio: Number(createDto.precio),
      precioCarton: createDto.precioCarton !== undefined ? Number(createDto.precioCarton) : 0,
      imagenUrl: createDto.imagenUrl || '',
      disponible: createDto.disponible !== undefined ? createDto.disponible : true,
    });
  }

  async update(id: string, updateDto: UpdateMarcoDto): Promise<Marco> {
    await this.findById(id);

    if (updateDto.categoriaId) {
      const categoria = await this.categoriaRepo.findById(updateDto.categoriaId);
      if (!categoria) {
        throw new BadRequestException(
          `La categoría con ID ${updateDto.categoriaId} no existe`,
        );
      }
    }

    const updateData: Partial<Marco> = {};
    if (updateDto.nombre !== undefined) updateData.nombre = updateDto.nombre.trim();
    if (updateDto.categoriaId !== undefined) updateData.categoriaId = updateDto.categoriaId;
    if (updateDto.dimensiones !== undefined) updateData.dimensiones = updateDto.dimensiones.trim();
    if (updateDto.tipoMadera !== undefined) updateData.tipoMadera = updateDto.tipoMadera.trim();
    if (updateDto.precio !== undefined) updateData.precio = Number(updateDto.precio);
    if (updateDto.precioCarton !== undefined) updateData.precioCarton = Number(updateDto.precioCarton);
    if (updateDto.imagenUrl !== undefined) updateData.imagenUrl = updateDto.imagenUrl;
    if (updateDto.disponible !== undefined) updateData.disponible = updateDto.disponible;

    const updated = await this.marcoRepo.update(id, updateData);
    if (!updated) {
      throw new NotFoundException(`Error al actualizar el marco ${id}`);
    }
    return updated;
  }

  async toggleDisponible(id: string): Promise<Marco> {
    const marco = await this.findById(id);
    const updated = await this.marcoRepo.update(id, { disponible: !marco.disponible });
    return updated!;
  }

  async delete(id: string): Promise<{ success: boolean; message: string }> {
    await this.findById(id);
    const deleted = await this.marcoRepo.delete(id);
    return {
      success: deleted,
      message: deleted ? 'Marco eliminado exitosamente' : 'No se pudo eliminar el marco',
    };
  }

  async count(): Promise<number> {
    return this.marcoRepo.count();
  }

  async getWoodTypes(): Promise<string[]> {
    return this.marcoRepo.getWoodTypes();
  }
}
