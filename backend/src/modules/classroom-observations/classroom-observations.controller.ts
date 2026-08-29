import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ClassroomObservationsService } from './classroom-observations.service';
import { CreateClassroomObservationDto, UpdateClassroomObservationDto } from './dto/classroom-observation.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@ApiTags('classroom-observations')
@ApiBearerAuth()
@Controller('classroom-observations')
@Roles(Role.DOCENTE)
export class ClassroomObservationsController {
  constructor(private readonly observationsService: ClassroomObservationsService) {}

  @Get('students/:estudianteId')
  findByStudent(@Param('estudianteId') estudianteId: string, @CurrentUser() user: AuthenticatedUser) {
    return this.observationsService.findByStudent(estudianteId, user.centroId, user.sub);
  }

  @Post()
  create(@Body() dto: CreateClassroomObservationDto, @CurrentUser() user: AuthenticatedUser) {
    return this.observationsService.create(dto, user.centroId, user.sub);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateClassroomObservationDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.observationsService.update(id, user.centroId, user.sub, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.observationsService.remove(id, user.centroId, user.sub);
  }
}
