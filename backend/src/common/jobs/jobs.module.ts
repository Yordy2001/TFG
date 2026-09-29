import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AttendanceAggregationJobService } from './attendance-aggregation.job';
import { DataQualityJobService } from './data-quality.job';
import { IdentityMappingModule } from '../../modules/identity-mapping/identity-mapping.module';

@Module({
  imports: [ScheduleModule.forRoot(), IdentityMappingModule],
  providers: [AttendanceAggregationJobService, DataQualityJobService],
})
export class JobsModule {}
