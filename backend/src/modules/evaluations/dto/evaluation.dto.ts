import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsInt, IsNumber, IsString, IsUUID, Max, Min } from 'class-validator';
import { Competencia, PeriodoEvaluativo } from '../../../common/enums';

export class CreateActivityDto {
  @ApiProperty()
  @IsUUID()
  asignacionDocenteId: string;

  @ApiProperty({ example: 'Examen' })
  @IsString()
  nombre: string;

  @ApiProperty({ enum: Competencia })
  @IsEnum(Competencia)
  competencia: Competencia;

  @ApiProperty({ minimum: 1, maximum: 100 })
  @IsInt()
  @Min(1)
  @Max(100)
  porcentaje: number;

  @ApiProperty({ enum: PeriodoEvaluativo })
  @IsEnum(PeriodoEvaluativo)
  periodoEvaluativo: PeriodoEvaluativo;

  @ApiProperty()
  @IsDateString()
  fecha: string;
}

export class RegisterGradeDto {
  @ApiProperty()
  @IsUUID()
  actividadId: string;

  @ApiProperty()
  @IsUUID()
  estudianteId: string;

  @ApiProperty({ minimum: 0, maximum: 100 })
  @IsNumber()
  @Min(0)
  @Max(100)
  nota: number;
}
