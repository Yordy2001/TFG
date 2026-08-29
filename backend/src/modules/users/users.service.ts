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

  findAll(centroId: string): SafeUser[] {
    return this.usersRepository.findAllByCentro(centroId).map((u) => this.toSafe(u));
  }

  findById(id: string, centroId: string): SafeUser {
    const usuario = this.usersRepository.findById(id);
    if (!usuario || usuario.centroId !== centroId) {
      throw new NotFoundException('User not found');
    }
    return this.toSafe(usuario);
  }

  create(dto: CreateUserDto, centroId: string): SafeUser {
    if (this.usersRepository.findByEmail(dto.email)) {
      throw new BadRequestException('Email already registered');
    }
    const usuario = this.usersRepository.create({
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

  update(id: string, centroId: string, dto: UpdateUserDto): SafeUser {
    const usuario = this.usersRepository.update(id, centroId, dto);
    if (!usuario) {
      throw new NotFoundException('User not found');
    }
    return this.toSafe(usuario);
  }

  updateOwnProfile(id: string, centroId: string, dto: UpdateOwnProfileDto): SafeUser {
    const usuario = this.usersRepository.update(id, centroId, dto);
    if (!usuario) {
      throw new NotFoundException('User not found');
    }
    return this.toSafe(usuario);
  }
}
