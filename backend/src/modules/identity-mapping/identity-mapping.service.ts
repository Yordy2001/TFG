import { Injectable } from '@nestjs/common';
import { IdentityMappingRepository } from './identity-mapping.repository';
import { IdentityHashService } from '../../common/security/identity-hash.service';

@Injectable()
export class IdentityMappingService {
  constructor(
    private readonly repository: IdentityMappingRepository,
    private readonly identityHash: IdentityHashService,
  ) {}

  findByStudent(estudianteId: string) {
    return this.repository.findByStudent(estudianteId);
  }

  ensureHash(estudianteId: string, centroId: string) {
    const estudianteHash = this.identityHash.hash(estudianteId);
    return this.repository.upsert(estudianteId, centroId, estudianteHash);
  }
}
