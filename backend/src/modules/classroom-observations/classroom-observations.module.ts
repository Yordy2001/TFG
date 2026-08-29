import { Module } from '@nestjs/common';
import { ClassroomObservationsController } from './classroom-observations.controller';
import { ClassroomObservationsService } from './classroom-observations.service';
import { ClassroomObservationsRepository } from './classroom-observations.repository';
import { StudentsModule } from '../students/students.module';
import { SubjectsModule } from '../subjects/subjects.module';

@Module({
  imports: [StudentsModule, SubjectsModule],
  controllers: [ClassroomObservationsController],
  providers: [ClassroomObservationsService, ClassroomObservationsRepository],
})
export class ClassroomObservationsModule {}
