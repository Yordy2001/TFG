import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateOwnProfileDto } from './dto/update-own-profile.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  findMe(@CurrentUser() user: AuthenticatedUser) {
    return this.usersService.findById(user.sub, user.centroId);
  }

  @Patch('me')
  updateMe(@Body() dto: UpdateOwnProfileDto, @CurrentUser() user: AuthenticatedUser) {
    return this.usersService.updateOwnProfile(user.sub, user.centroId, dto);
  }

  @Get()
  @Roles(Role.ADMINISTRADOR)
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.usersService.findAll(user.centroId);
  }

  @Get(':id')
  @Roles(Role.ADMINISTRADOR)
  findOne(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.usersService.findById(id, user.centroId);
  }

  @Post()
  @Roles(Role.ADMINISTRADOR)
  create(@Body() dto: CreateUserDto, @CurrentUser() user: AuthenticatedUser) {
    return this.usersService.create(dto, user.centroId);
  }

  @Patch(':id')
  @Roles(Role.ADMINISTRADOR)
  update(@Param('id') id: string, @Body() dto: UpdateUserDto, @CurrentUser() user: AuthenticatedUser) {
    return this.usersService.update(id, user.centroId, dto);
  }
}
