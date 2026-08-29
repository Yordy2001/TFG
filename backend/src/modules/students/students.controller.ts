import { Body, Controller, Delete, Get, Header, Param, Patch, Post, Query, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import type { Response } from 'express';
import { StudentsService } from './students.service';
import { StudentsImportService } from './import/students-import.service';
import { StudentsPhotoService } from './photo/students-photo.service';
import { CreateStudentDto, UpdateStudentDto } from './dto/student.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';

const importFileInterceptor = FileInterceptor('file', {
  storage: memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

const photoFileInterceptor = FileInterceptor('file', {
  storage: memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
});

@ApiTags('students')
@ApiBearerAuth()
@Controller('students')
export class StudentsController {
  constructor(
    private readonly studentsService: StudentsService,
    private readonly studentsImportService: StudentsImportService,
    private readonly studentsPhotoService: StudentsPhotoService,
  ) {}

  @Get('import/template')
  @Roles(Role.ADMINISTRADOR, Role.REGISTRO)
  @Header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  @Header('Content-Disposition', 'attachment; filename="plantilla-estudiantes.xlsx"')
  async downloadTemplate(@Res() res: Response) {
    const buffer = await this.studentsImportService.buildTemplate();
    res.send(buffer);
  }

  @Post('import/preview')
  @Roles(Role.ADMINISTRADOR, Role.REGISTRO)
  @UseInterceptors(importFileInterceptor)
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  preview(@UploadedFile() file: Express.Multer.File, @CurrentUser() user: AuthenticatedUser) {
    return this.studentsImportService.preview(file, user.centroId);
  }

  @Post('import/confirm')
  @Roles(Role.ADMINISTRADOR, Role.REGISTRO)
  @UseInterceptors(importFileInterceptor)
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  confirmImport(@UploadedFile() file: Express.Multer.File, @CurrentUser() user: AuthenticatedUser) {
    return this.studentsImportService.confirm(file, user.centroId);
  }

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

  @Post(':id/photo')
  @Roles(Role.ADMINISTRADOR, Role.REGISTRO)
  @UseInterceptors(photoFileInterceptor)
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  uploadPhoto(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.studentsPhotoService.upload(id, user.centroId, file);
  }

  @Get(':id/photo')
  async getPhoto(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser, @Res() res: Response) {
    const { absolutePath, mimetype } = await this.studentsPhotoService.resolveFile(id, user.centroId);
    res.setHeader('Content-Type', mimetype);
    res.sendFile(absolutePath);
  }
}
