import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { UsuarioRepository } from '../usuarios/repositories/usuario.repository';
import { CategoriaRepository } from '../categorias/repositories/categoria.repository';
import { MarcoRepository } from '../marcos/repositories/marco.repository';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    private readonly usuarioRepo: UsuarioRepository,
    private readonly categoriaRepo: CategoriaRepository,
    private readonly marcoRepo: MarcoRepository,
  ) {}

  async onApplicationBootstrap() {
    await this.seedUsers();
    await this.seedCategoriesAndFrames();
  }

  private async seedUsers() {
    const count = await this.usuarioRepo.count();
    if (count === 0) {
      this.logger.log('🌱 Inicializando usuario administrador por defecto...');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);

      await this.usuarioRepo.create({
        name: 'Administrador del Taller',
        email: 'admin@taller.com',
        password: hashedPassword,
      });

      this.logger.log('✅ Usuario admin creado: admin@taller.com / admin123');
    }
  }

  private async seedCategoriesAndFrames() {
    const catCount = await this.categoriaRepo.count();
    if (catCount === 0) {
      this.logger.log('🌱 Inicializando categorías por defecto...');

      await this.categoriaRepo.create({
        nombre: 'Marco Vacío para Dibujo',
        slug: 'marco-vacio-para-dibujo',
        descripcion: 'Estructuras y molduras de madera diseñadas para lienzos, láminas y dibujos sin soporte posterior.',
      });

      await this.categoriaRepo.create({
        nombre: 'Marco Dibujo',
        slug: 'marco-dibujo',
        descripcion: 'Marcos completos con paspartú y protección para dibujos artísticos, acuarelas y bocetos.',
      });

      await this.categoriaRepo.create({
        nombre: 'Marco Espejo',
        slug: 'marco-espejo',
        descripcion: 'Marcos robustos con perfil reforzado para espejos decorativos y de pared.',
      });

      this.logger.log('✅ Categorías inicializadas: Marco Vacío para Dibujo, Marco Dibujo, Marco Espejo.');
    }
  }
}

