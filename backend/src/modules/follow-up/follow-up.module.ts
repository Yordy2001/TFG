import { Module } from '@nestjs/common';
import { FollowUpController } from './follow-up.controller';
import { FollowUpService } from './follow-up.service';
import { FollowUpRepository } from './follow-up.repository';

@Module({
  controllers: [FollowUpController],
  providers: [FollowUpService, FollowUpRepository],
})
export class FollowUpModule {}
