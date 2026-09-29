import { Module } from '@nestjs/common';
import { IdentityMappingController } from './identity-mapping.controller';
import { IdentityMappingService } from './identity-mapping.service';
import { IdentityMappingRepository } from './identity-mapping.repository';
import { IdentityHashService } from '../../common/security/identity-hash.service';

@Module({
  controllers: [IdentityMappingController],
  providers: [IdentityMappingService, IdentityMappingRepository, IdentityHashService],
  exports: [IdentityMappingService, IdentityHashService],
})
export class IdentityMappingModule {}
