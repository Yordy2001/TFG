import { Injectable } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { MockDataStore } from '../../common/mock-data/mock-data.store';
import { Usuario } from '../../common/interfaces/entities';

@Injectable()
export class UsersRepository {
  constructor(private readonly store: MockDataStore) {}

  findByEmail(email: string): Usuario | undefined {
    return this.store.usuarios.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  findById(id: string): Usuario | undefined {
    return this.store.usuarios.find((u) => u.id === id);
  }

  findAllByCentro(centroId: string): Usuario[] {
    return this.store.usuarios.filter((u) => u.centroId === centroId);
  }

  create(data: Omit<Usuario, 'id' | 'createdAt' | 'updatedAt'>): Usuario {
    const now = new Date();
    const usuario: Usuario = { ...data, id: uuid(), createdAt: now, updatedAt: now };
    this.store.usuarios.push(usuario);
    return usuario;
  }

  update(id: string, centroId: string, data: Partial<Usuario>): Usuario | undefined {
    const usuario = this.store.usuarios.find((u) => u.id === id && u.centroId === centroId);
    if (!usuario) return undefined;
    Object.assign(usuario, data, { updatedAt: new Date() });
    return usuario;
  }

  saveRefreshToken(usuarioId: string, token: string, expiresAt: Date) {
    this.store.refreshTokens.push({ id: uuid(), usuarioId, token, expiresAt, revoked: false });
  }

  findRefreshToken(token: string) {
    return this.store.refreshTokens.find((t) => t.token === token && !t.revoked);
  }

  revokeRefreshToken(token: string) {
    const record = this.store.refreshTokens.find((t) => t.token === token);
    if (record) record.revoked = true;
  }
}
