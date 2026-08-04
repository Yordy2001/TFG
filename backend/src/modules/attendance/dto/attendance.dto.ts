import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsUUID } from 'class-validator';
import { EstadoAsistencia } from '../../../common/enums';

export class RegisterAttendanceDto {
  @ApiProperty()
  @IsUUID()
  estudianteId: string;

  @ApiProperty()
  @IsUUID()
  asignacionDocenteId: string;

  @ApiProperty()
  @IsDateString()
  fecha: string;

  @ApiProperty({ enum: EstadoAsistencia })
  @IsEnum(EstadoAsistencia)
  estado: EstadoAsistencia;
}
