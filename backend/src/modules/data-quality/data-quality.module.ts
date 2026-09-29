import { Module } from '@nestjs/common';
import { DataQualityController } from './data-quality.controller';
import { DataQualityService } from './data-quality.service';
import { DataQualityRepository } from './data-quality.repository';

@Module({
  controllers: [DataQualityController],
  providers: [DataQualityService, DataQualityRepository],
})
export class DataQualityModule {}
