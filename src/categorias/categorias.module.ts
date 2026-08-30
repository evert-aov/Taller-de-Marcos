import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { Categoria } from './entities/categoria.entity';
import { CategoriaRepository } from './repositories/categoria.repository';
import { CategoriaService } from './services/categoria.service';
import { CategoriaController } from './controllers/categoria.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Categoria]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  providers: [CategoriaRepository, CategoriaService],
  controllers: [CategoriaController],
  exports: [CategoriaRepository, CategoriaService],
})
export class CategoriasModule {}
