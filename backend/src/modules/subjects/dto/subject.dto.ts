import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';

export class CreateSubjectDto {
  @ApiProperty({ example: 'Matemática' })
  @IsString()
  nombre: string;
}

export class CreateAssignmentDto {
  @ApiProperty()
  @IsUUID()
  docenteId: string;

  @ApiProperty()
  @IsUUID()
  cursoId: string;

  @ApiProperty()
  @IsUUID()
  asignaturaId: string;

  @ApiProperty()
  @IsUUID()
  periodoAcademicoId: string;
}
