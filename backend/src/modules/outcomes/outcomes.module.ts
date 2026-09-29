import { Module } from '@nestjs/common';
import { OutcomesController } from './outcomes.controller';
import { OutcomesService } from './outcomes.service';
import { OutcomesRepository } from './outcomes.repository';

@Module({
  controllers: [OutcomesController],
  providers: [OutcomesService, OutcomesRepository],
})
export class OutcomesModule {}
