import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RiskService } from './risk.service';
import { RiskAdjustmentDto } from './dto/risk-adjustment.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@ApiTags('risk')
@ApiBearerAuth()
@Controller('risk')
export class RiskController {
  constructor(private readonly riskService: RiskService) {}

  @Get()
  list(@CurrentUser() user: AuthenticatedUser) {
    return this.riskService.listByCentro(user.centroId);
  }

  @Get('students/:estudianteId')
  current(@Param('estudianteId') estudianteId: string, @CurrentUser() user: AuthenticatedUser) {
    return this.riskService.current(estudianteId, user.centroId);
  }

  @Get('students/:estudianteId/history')
  history(@Param('estudianteId') estudianteId: string, @CurrentUser() user: AuthenticatedUser) {
    return this.riskService.history(estudianteId, user.centroId);
  }

  @Post('adjustment')
  @Roles(Role.ORIENTADOR)
  applyAdjustment(@Body() dto: RiskAdjustmentDto, @CurrentUser() user: AuthenticatedUser) {
    return this.riskService.applyAdjustment(dto, user.centroId, user.sub);
  }
}
