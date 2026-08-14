import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { FollowUpService } from './follow-up.service';
import { CreateFollowUpDto, UpdateFollowUpDto } from './dto/follow-up.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@ApiTags('follow-up')
@ApiBearerAuth()
@Controller('follow-up')
@Roles(Role.ORIENTADOR)
export class FollowUpController {
  constructor(private readonly followUpService: FollowUpService) {}

  @Get('recent')
  recent(@CurrentUser() user: AuthenticatedUser) {
    return this.followUpService.findRecent(user.centroId);
  }

  @Get('students/:estudianteId')
  byStudent(@Param('estudianteId') estudianteId: string, @CurrentUser() user: AuthenticatedUser) {
    return this.followUpService.findByStudent(estudianteId, user.centroId);
  }

  @Post()
  create(@Body() dto: CreateFollowUpDto, @CurrentUser() user: AuthenticatedUser) {
    return this.followUpService.create(dto, user.centroId, user.sub);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateFollowUpDto, @CurrentUser() user: AuthenticatedUser) {
    return this.followUpService.update(id, user.centroId, dto);
  }
}
