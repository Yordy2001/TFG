import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SubjectsService } from './subjects.service';
import { CreateAssignmentDto, CreateSubjectDto } from './dto/subject.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@ApiTags('subjects')
@ApiBearerAuth()
@Controller('subjects')
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  @Get()
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.subjectsService.findAll(user.centroId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.subjectsService.findOne(id, user.centroId);
  }

  @Post()
  @Roles(Role.ADMINISTRADOR)
  create(@Body() dto: CreateSubjectDto, @CurrentUser() user: AuthenticatedUser) {
    return this.subjectsService.create(dto, user.centroId);
  }

  @Get('assignments/all')
  findAssignments(@CurrentUser() user: AuthenticatedUser, @Query('docenteId') docenteId?: string) {
    return this.subjectsService.findAssignments(user.centroId, docenteId);
  }

  @Post('assignments')
  @Roles(Role.ADMINISTRADOR)
  createAssignment(@Body() dto: CreateAssignmentDto, @CurrentUser() user: AuthenticatedUser) {
    return this.subjectsService.createAssignment(dto, user.centroId);
  }
}
