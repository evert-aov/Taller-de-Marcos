import { Module } from '@nestjs/common';
import { MarcosModule } from '../marcos/marcos.module';
import { CategoriasModule } from '../categorias/categorias.module';
import { CatalogoService } from './services/catalogo.service';
import { CatalogoController } from './controllers/catalogo.controller';

@Module({
  imports: [MarcosModule, CategoriasModule],
  providers: [CatalogoService],
  controllers: [CatalogoController],
  exports: [CatalogoService],
})
export class CatalogoModule {}
