import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { UsuarioRepository } from '../repositories/usuario.repository';
import { Usuario } from '../entities/usuario.entity';
import { CreateUsuarioDto } from '../dto/create-usuario.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsuarioService {
  constructor(private readonly usuarioRepo: UsuarioRepository) {}

  async findAll(): Promise<Omit<Usuario, 'password'>[]> {
    const usuarios = await this.usuarioRepo.findAll();
    return usuarios.map(({ password, ...rest }) => rest as Usuario);
  }

  async findById(id: string): Promise<Usuario> {
    const user = await this.usuarioRepo.findById(id);
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<Usuario | null> {
    return this.usuarioRepo.findByEmail(email);
  }

  async create(createUsuarioDto: CreateUsuarioDto): Promise<Omit<Usuario, 'password'>> {
    const existing = await this.usuarioRepo.findByEmail(createUsuarioDto.email);
    if (existing) {
      throw new ConflictException('El correo ya se encuentra registrado');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(createUsuarioDto.password, salt);

    const created = await this.usuarioRepo.create({
      name: createUsuarioDto.name,
      email: createUsuarioDto.email.toLowerCase().trim(),
      password: hashedPassword,
    });

    const { password, ...result } = created;
    return result as Usuario;
  }

  async count(): Promise<number> {
    return this.usuarioRepo.count();
  }
}
