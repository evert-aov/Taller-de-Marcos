import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { existsSync } from 'fs';

import { Usuario } from './usuarios/entities/usuario.entity';
import { Categoria } from './categorias/entities/categoria.entity';
import { Marco } from './marcos/entities/marco.entity';

import { UsuariosModule } from './usuarios/usuarios.module';
import { AuthModule } from './auth/auth.module';
import { CategoriasModule } from './categorias/categorias.module';
import { MarcosModule } from './marcos/marcos.module';
import { CatalogoModule } from './catalogo/catalogo.module';
import { SeedModule } from './seed/seed.module';

const frontendDistPath = join(__dirname, '..', 'frontend', 'dist', 'frontend', 'browser');
const staticModules = [
  ServeStaticModule.forRoot({
    rootPath: join(__dirname, '..', 'uploads'),
    serveRoot: '/uploads',
  }),
];

if (existsSync(frontendDistPath)) {
  staticModules.push(
    ServeStaticModule.forRoot({
      rootPath: frontendDistPath,
      exclude: ['/api', '/api/*path', '/uploads', '/uploads/*path'],
    }),
  );
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: parseInt(configService.get<string>('DB_PORT', '5432'), 10),
        username: configService.get<string>('DB_USER', 'evert'),
        password: configService.get<string>('DB_PASS', 'nakroth'),
        database: configService.get<string>('DB_NAME', 'taller_1'),
        entities: [Usuario, Categoria, Marco],
        synchronize: configService.get<string>('DB_SYNCHRONIZE', 'true') === 'true',
        logging: configService.get<string>('DB_LOGGING', 'false') === 'true',
      }),
    }),
    ...staticModules,
    UsuariosModule,
    AuthModule,
    CategoriasModule,
    MarcosModule,
    CatalogoModule,
    SeedModule,
  ],
})
export class AppModule {}
