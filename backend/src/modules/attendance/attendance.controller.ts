import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import { RegisterAttendanceDto } from './dto/attendance.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@ApiTags('attendance')
@ApiBearerAuth()
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post()
  @Roles(Role.DOCENTE, Role.ADMINISTRADOR)
  register(@Body() dto: RegisterAttendanceDto, @CurrentUser() user: AuthenticatedUser) {
    return this.attendanceService.register(dto, user.centroId);
  }

  @Get('students/:estudianteId')
  summary(@Param('estudianteId') estudianteId: string) {
    return this.attendanceService.summary(estudianteId);
  }
}
