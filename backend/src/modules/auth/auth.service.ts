import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import { UsersRepository } from '../users/users.repository';
import { LoginDto } from './dto/login.dto';

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

  private buildPayload(usuario: ReturnType<UsersRepository['findByEmail']>): JwtPayload {
    return {
      sub: usuario!.id,
      email: usuario!.email,
      role: usuario!.rol,
      centroId: usuario!.centroId,
    };
  }

  private issueTokens(payload: JwtPayload) {
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = uuid();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    this.usersRepository.saveRefreshToken(payload.sub, refreshToken, expiresAt);
    return { accessToken, refreshToken };
  }

  login(dto: LoginDto) {
    const usuario = this.usersRepository.findByEmail(dto.email);
    if (!usuario || !usuario.activo) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const matches = bcrypt.compareSync(dto.password, usuario.passwordHash);
    if (!matches) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const tokens = this.issueTokens(this.buildPayload(usuario));
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

  refresh(refreshToken: string) {
    const record = this.usersRepository.findRefreshToken(refreshToken);
    if (!record || record.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    const usuario = this.usersRepository.findById(record.usuarioId);
    if (!usuario || !usuario.activo) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    this.usersRepository.revokeRefreshToken(refreshToken);
    const tokens = this.issueTokens(this.buildPayload(usuario));
    return tokens;
  }

  logout(refreshToken: string) {
    this.usersRepository.revokeRefreshToken(refreshToken);
    return { loggedOut: true };
  }
}
