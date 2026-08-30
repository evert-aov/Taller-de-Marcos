import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { CategoriasModule } from '../categorias/categorias.module';
import { MarcosModule } from '../marcos/marcos.module';

@Module({
  imports: [UsuariosModule, CategoriasModule, MarcosModule],
  providers: [SeedService],
})
export class SeedModule {}
