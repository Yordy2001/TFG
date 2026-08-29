import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { MockDataModule } from './common/mock-data/mock-data.store';
import { PrismaModule } from './common/prisma/prisma.module';
import { EnginesModule } from './common/engines/engines.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { RolesModule } from './modules/roles/roles.module';
import { SchoolsModule } from './modules/schools/schools.module';
import { CoursesModule } from './modules/courses/courses.module';
import { StudentsModule } from './modules/students/students.module';
import { SubjectsModule } from './modules/subjects/subjects.module';
import { EvaluationsModule } from './modules/evaluations/evaluations.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { FollowUpModule } from './modules/follow-up/follow-up.module';
import { ClassroomObservationsModule } from './modules/classroom-observations/classroom-observations.module';
import { RiskModule } from './modules/risk/risk.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    MockDataModule,
    EnginesModule,
    AuthModule,
    UsersModule,
    RolesModule,
    SchoolsModule,
    CoursesModule,
    StudentsModule,
    SubjectsModule,
    EvaluationsModule,
    AttendanceModule,
    FollowUpModule,
    ClassroomObservationsModule,
    RiskModule,
    DashboardModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
