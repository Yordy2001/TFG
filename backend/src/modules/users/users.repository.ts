import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { Usuario } from '../../common/interfaces/entities';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string): Promise<Usuario | null> {
    return this.prisma.usuario.findFirst({ where: { email: { equals: email, mode: 'insensitive' } } });
  }

  findById(id: string): Promise<Usuario | null> {
    return this.prisma.usuario.findUnique({ where: { id } });
  }

  findAllByCentro(centroId: string): Promise<Usuario[]> {
    return this.prisma.usuario.findMany({ where: { centroId } });
  }

  create(data: Omit<Usuario, 'id' | 'createdAt' | 'updatedAt'>): Promise<Usuario> {
    // Local domain enums (e.g. Role) are structurally identical to, but nominally
    // distinct from, the Prisma-generated enums — safe to cast at this boundary.
    return this.prisma.usuario.create({ data: data as never });
  }

  async update(id: string, centroId: string, data: Partial<Usuario>): Promise<Usuario | undefined> {
    const result = await this.prisma.usuario.updateMany({ where: { id, centroId }, data: data as never });
    if (result.count === 0) return undefined;
    return (await this.findById(id)) ?? undefined;
  }

  async saveRefreshToken(usuarioId: string, token: string, expiresAt: Date) {
    await this.prisma.refreshTokenRecord.create({ data: { usuarioId, token, expiresAt, revoked: false } });
  }

  findRefreshToken(token: string) {
    return this.prisma.refreshTokenRecord.findFirst({ where: { token, revoked: false } });
  }

  async revokeRefreshToken(token: string) {
    await this.prisma.refreshTokenRecord.updateMany({ where: { token }, data: { revoked: true } });
  }
}
