import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersRepository } from './users.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateOwnProfileDto } from './dto/update-own-profile.dto';
import { Usuario } from '../../common/interfaces/entities';

export type SafeUser = Omit<Usuario, 'passwordHash'>;

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  private toSafe(usuario: Usuario): SafeUser {
    const { passwordHash: _drop, ...safe } = usuario;
    return safe;
  }

  async findAll(centroId: string): Promise<SafeUser[]> {
    const usuarios = await this.usersRepository.findAllByCentro(centroId);
    return usuarios.map((u) => this.toSafe(u));
  }

  async findById(id: string, centroId: string): Promise<SafeUser> {
    const usuario = await this.usersRepository.findById(id);
    if (!usuario || usuario.centroId !== centroId) {
      throw new NotFoundException('User not found');
    }
    return this.toSafe(usuario);
  }

  async create(dto: CreateUserDto, centroId: string): Promise<SafeUser> {
    if (await this.usersRepository.findByEmail(dto.email)) {
      throw new BadRequestException('Email already registered');
    }
    const usuario = await this.usersRepository.create({
      centroId,
      rol: dto.rol,
      nombres: dto.nombres,
      apellidos: dto.apellidos,
      email: dto.email,
      passwordHash: bcrypt.hashSync(dto.password, 12),
      activo: true,
    });
    return this.toSafe(usuario);
  }

  async update(id: string, centroId: string, dto: UpdateUserDto): Promise<SafeUser> {
    const usuario = await this.usersRepository.update(id, centroId, dto);
    if (!usuario) {
      throw new NotFoundException('User not found');
    }
    return this.toSafe(usuario);
  }

  async updateOwnProfile(id: string, centroId: string, dto: UpdateOwnProfileDto): Promise<SafeUser> {
    const usuario = await this.usersRepository.update(id, centroId, dto);
    if (!usuario) {
      throw new NotFoundException('User not found');
    }
    return this.toSafe(usuario);
  }
}
