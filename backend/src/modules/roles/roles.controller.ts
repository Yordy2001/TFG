import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Role } from '../../common/enums/role.enum';

@ApiTags('roles')
@Controller('roles')
export class RolesController {
  @Get()
  findAll() {
    return Object.values(Role);
  }
}
