import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

/**
 * Wraps PrismaClient so the connection lifecycle is tied to Nest's module
 * lifecycle and the required DATABASE_URL is validated on startup.
 *
 * Ticket GDE-001: only the connection is wired up here. No repository uses
 * this service yet; the in-memory MockDataStore remains the data source
 * until tables/migrations are introduced in a future ticket.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor(config: ConfigService) {
    const databaseUrl = config.get<string>('DATABASE_URL');
    if (!databaseUrl) {
      throw new Error(
        'DATABASE_URL no está configurada. Define esta variable en el archivo .env antes de iniciar la aplicación.',
      );
    }
    super({ datasources: { db: { url: databaseUrl } } });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Conexión a PostgreSQL establecida correctamente.');
    } catch (error) {
      this.logger.error('No fue posible conectar a PostgreSQL.', error as Error);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
