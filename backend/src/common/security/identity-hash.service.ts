import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac } from 'crypto';

// Derives an opaque, non-reversible identifier for a student from their internal
// UUID (never from `matricula`) so exports/reports can reference a student without
// carrying name/matricula. Rotating IDENTITY_HASH_SALT invalidates every hash.
@Injectable()
export class IdentityHashService {
  constructor(private readonly config: ConfigService) {}

  hash(estudianteId: string): string {
    const salt = this.config.get<string>('IDENTITY_HASH_SALT');
    if (!salt) {
      throw new Error('IDENTITY_HASH_SALT is not configured');
    }
    return createHmac('sha256', salt).update(estudianteId).digest('hex');
  }
}
