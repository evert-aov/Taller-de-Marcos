import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class CreateMarcoDto {
  @IsNotEmpty({ message: 'El nombre del marco es obligatorio' })
  @IsString()
  nombre: string;

  @IsNotEmpty({ message: 'La categoría es obligatoria' })
  @IsUUID('all', { message: 'El categoriaId debe ser un UUID válido' })
  categoriaId: string;

  @IsNotEmpty({ message: 'Las dimensiones son obligatorias' })
  @IsString()
  dimensiones: string;

  @IsNotEmpty({ message: 'El tipo de madera es obligatorio' })
  @IsString()
  tipoMadera: string;

  @IsNotEmpty({ message: 'El precio es obligatorio' })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El precio debe ser un número válido' })
  @Min(0, { message: 'El precio no puede ser negativo' })
  precio: number;

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
