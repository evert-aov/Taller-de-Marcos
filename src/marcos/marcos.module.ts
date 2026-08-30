import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { Marco } from './entities/marco.entity';
import { MarcoRepository } from './repositories/marco.repository';
import { MarcoService } from './services/marco.service';
import { MarcoController } from './controllers/marco.controller';
import { CategoriasModule } from '../categorias/categorias.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Marco]),
    CategoriasModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  providers: [MarcoRepository, MarcoService],
  controllers: [MarcoController],
  exports: [MarcoRepository, MarcoService],
})
export class MarcosModule {}
