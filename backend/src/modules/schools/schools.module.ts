import { Module } from '@nestjs/common';
import { SchoolsController } from './schools.controller';
import { SchoolsRepository } from './schools.repository';

@Module({
  controllers: [SchoolsController],
  providers: [SchoolsRepository],
  exports: [SchoolsRepository],
})
export class SchoolsModule {}
