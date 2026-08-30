import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class UpdateMarcoDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsUUID('all', { message: 'El categoriaId debe ser un UUID válido' })
  categoriaId?: string;

  @IsOptional()
  @IsString()
  dimensiones?: string;

  @IsOptional()
  @IsString()
  tipoMadera?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El precio debe ser un número válido' })
  @Min(0, { message: 'El precio no puede ser negativo' })
  precio?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El precio con cartón debe ser un número válido' })
  @Min(0, { message: 'El precio con cartón no puede ser negativo' })
  precioCarton?: number;

  @IsOptional()
  @IsString()
  imagenUrl?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  @IsBoolean()
  disponible?: boolean;
}
