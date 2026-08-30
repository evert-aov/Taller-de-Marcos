import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { Marco } from './entities/marco.entity';
import { MarcoRepository } from './repositories/marco.repository';
import { MarcoService } from './services/marco.service';
import { R2StorageService } from './services/r2-storage.service';
import { MarcoController } from './controllers/marco.controller';
import { CategoriasModule } from '../categorias/categorias.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Marco]),
    CategoriasModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  providers: [MarcoRepository, MarcoService, R2StorageService],
  controllers: [MarcoController],
  exports: [MarcoRepository, MarcoService, R2StorageService],
})
export class MarcosModule {}
