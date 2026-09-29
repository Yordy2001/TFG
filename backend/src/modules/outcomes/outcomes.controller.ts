import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { OutcomesService } from './outcomes.service';
import { CreateOutcomeDto, UpdateOutcomeDto } from './dto/outcome.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@ApiTags('outcomes')
@ApiBearerAuth()
@Controller('outcomes')
@Roles(Role.ADMINISTRADOR, Role.DIRECTOR)
export class OutcomesController {
  constructor(private readonly outcomesService: OutcomesService) {}

  @Get('students/:estudianteId')
  byStudent(@Param('estudianteId') estudianteId: string, @CurrentUser() user: AuthenticatedUser) {
    return this.outcomesService.findByStudent(estudianteId, user.centroId);
  }

  @Post()
  create(@Body() dto: CreateOutcomeDto, @CurrentUser() user: AuthenticatedUser) {
    return this.outcomesService.create(dto, user.centroId, user.sub);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateOutcomeDto, @CurrentUser() user: AuthenticatedUser) {
    return this.outcomesService.update(id, user.centroId, dto);
  }
}
