import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { DataQualityService } from './data-quality.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@ApiTags('data-quality')
@ApiBearerAuth()
@Controller('data-quality')
@Roles(Role.ADMINISTRADOR, Role.DIRECTOR)
export class DataQualityController {
  constructor(private readonly dataQualityService: DataQualityService) {}

  @Get('reports')
  reports(@CurrentUser() user: AuthenticatedUser) {
    return this.dataQualityService.findRecent(user.centroId);
  }

  @Get('reports/export')
  export(@CurrentUser() user: AuthenticatedUser) {
    return this.dataQualityService.findRecent(user.centroId);
  }
}
