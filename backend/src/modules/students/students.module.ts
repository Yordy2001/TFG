import { Module } from '@nestjs/common';
import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';
import { StudentsRepository } from './students.repository';
import { StudentsImportService } from './import/students-import.service';
import { StudentsPhotoService } from './photo/students-photo.service';
import { CoursesModule } from '../courses/courses.module';

@Module({
  imports: [CoursesModule],
  controllers: [StudentsController],
  providers: [StudentsService, StudentsRepository, StudentsImportService, StudentsPhotoService],
  exports: [StudentsRepository],
})
export class StudentsModule {}
