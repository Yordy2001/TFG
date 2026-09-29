import { Module } from '@nestjs/common';
import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';
import { StudentsRepository } from './students.repository';
import { StudentsImportService } from './import/students-import.service';
import { CoursesModule } from '../courses/courses.module';
import { IdentityMappingModule } from '../identity-mapping/identity-mapping.module';

@Module({
  imports: [CoursesModule, IdentityMappingModule],
  controllers: [StudentsController],
  providers: [StudentsService, StudentsRepository, StudentsImportService],
  exports: [StudentsRepository],
})
export class StudentsModule {}
