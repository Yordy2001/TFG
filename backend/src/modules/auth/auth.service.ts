import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import { UsersRepository } from '../users/users.repository';
import { LoginDto } from './dto/login.dto';
import { Usuario } from '../../common/interfaces/entities';

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  centroId: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly jwtService: JwtService,
  ) {}

  private buildPayload(usuario: Usuario): JwtPayload {
    return {
      sub: usuario.id,
      email: usuario.email,
      role: usuario.rol,
      centroId: usuario.centroId,
    };
  }

  private async issueTokens(payload: JwtPayload) {
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = uuid();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await this.usersRepository.saveRefreshToken(payload.sub, refreshToken, expiresAt);
    return { accessToken, refreshToken };
  }

  async login(dto: LoginDto) {
    const usuario = await this.usersRepository.findByEmail(dto.email);
    if (!usuario || !usuario.activo) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const matches = bcrypt.compareSync(dto.password, usuario.passwordHash);
    if (!matches) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const tokens = await this.issueTokens(this.buildPayload(usuario));
    return {
      ...tokens,
      user: {
        id: usuario.id,
        nombres: usuario.nombres,
        apellidos: usuario.apellidos,
        email: usuario.email,
        role: usuario.rol,
        centroId: usuario.centroId,
      },
    };
  }

  async refresh(refreshToken: string) {
    const record = await this.usersRepository.findRefreshToken(refreshToken);
    if (!record || record.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    const usuario = await this.usersRepository.findById(record.usuarioId);
    if (!usuario || !usuario.activo) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    await this.usersRepository.revokeRefreshToken(refreshToken);
    return this.issueTokens(this.buildPayload(usuario));
  }

  async logout(refreshToken: string) {
    await this.usersRepository.revokeRefreshToken(refreshToken);
    return { loggedOut: true };
  }
}
