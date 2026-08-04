import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { StudentsService } from './students.service';
import { CreateStudentDto, UpdateStudentDto } from './dto/student.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@ApiTags('students')
@ApiBearerAuth()
@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get()
  findAll(@CurrentUser() user: AuthenticatedUser, @Query('cursoId') cursoId?: string) {
    return this.studentsService.findAll(user.centroId, cursoId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.studentsService.findOne(id, user.centroId);
  }

  @Post()
  @Roles(Role.ADMINISTRADOR, Role.REGISTRO)
  create(@Body() dto: CreateStudentDto, @CurrentUser() user: AuthenticatedUser) {
    return this.studentsService.create(dto, user.centroId);
  }

  @Patch(':id')
  @Roles(Role.ADMINISTRADOR, Role.REGISTRO)
  update(@Param('id') id: string, @Body() dto: UpdateStudentDto, @CurrentUser() user: AuthenticatedUser) {
    return this.studentsService.update(id, user.centroId, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMINISTRADOR, Role.REGISTRO)
  deactivate(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.studentsService.deactivate(id, user.centroId);
  }
}
