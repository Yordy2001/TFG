import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { EvaluationsService } from './evaluations.service';
import { CreateActivityDto, RegisterGradeDto } from './dto/evaluation.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@ApiTags('evaluations')
@ApiBearerAuth()
@Controller('evaluations')
export class EvaluationsController {
  constructor(private readonly evaluationsService: EvaluationsService) {}

  @Get('activities')
  activities(@Query('asignacionDocenteId') asignacionDocenteId: string) {
    return this.evaluationsService.activitiesByAssignment(asignacionDocenteId);
  }

  @Post('activities')
  @Roles(Role.DOCENTE, Role.ADMINISTRADOR)
  createActivity(@Body() dto: CreateActivityDto, @CurrentUser() user: AuthenticatedUser) {
    return this.evaluationsService.createActivity(dto, user.centroId);
  }

  @Post('grades')
  @Roles(Role.DOCENTE, Role.ADMINISTRADOR)
  registerGrade(@Body() dto: RegisterGradeDto, @CurrentUser() user: AuthenticatedUser) {
    return this.evaluationsService.registerGrade(dto, user.centroId);
  }

  @Get('students/:estudianteId/results')
  resultados(@Param('estudianteId') estudianteId: string, @Query('cursoId') cursoId: string) {
    return this.evaluationsService.resultadosEstudiante(estudianteId, cursoId);
  }
}
