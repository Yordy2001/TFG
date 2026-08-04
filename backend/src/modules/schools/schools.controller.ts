import { Controller, Get, NotFoundException } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SchoolsRepository } from './schools.repository';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@ApiTags('schools')
@ApiBearerAuth()
@Controller('schools')
export class SchoolsController {
  constructor(private readonly schoolsRepository: SchoolsRepository) {}

  @Get('me')
  findMine(@CurrentUser() user: AuthenticatedUser) {
    const centro = this.schoolsRepository.findById(user.centroId);
    if (!centro) throw new NotFoundException('School not found');
    return centro;
  }
}
