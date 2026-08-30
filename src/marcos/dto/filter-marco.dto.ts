import { IsBoolean, IsOptional, IsString, IsNumber } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class FilterMarcoDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  categoriaId?: string;

  @IsOptional()
  @IsString()
  categoriaSlug?: string;

  @IsOptional()
  @IsString()
  tipoMadera?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  precioMin?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  precioMax?: number;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  @IsBoolean()
  disponible?: boolean;

  @IsOptional()
  @IsString()
  sortBy?: string; // 'precio_asc', 'precio_desc', 'nombre_asc', 'nombre_desc', 'recientes'
}
