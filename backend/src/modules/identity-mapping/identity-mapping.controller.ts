import { Controller, Get, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IdentityMappingService } from './identity-mapping.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@ApiTags('identity-mapping')
@ApiBearerAuth()
@Controller('identity-mapping')
@Roles(Role.ADMINISTRADOR)
export class IdentityMappingController {
  constructor(private readonly identityMappingService: IdentityMappingService) {}

  @Get('students/:estudianteId')
  byStudent(@Param('estudianteId') estudianteId: string) {
    return this.identityMappingService.findByStudent(estudianteId);
  }
}
