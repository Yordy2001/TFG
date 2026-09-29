import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsString, IsUUID, ValidateIf } from 'class-validator';
import { EstadoFinalPeriodo, FuenteConfirmacion } from '../../../common/enums';

export class CreateOutcomeDto {
  @ApiProperty()
  @IsUUID()
  estudianteId: string;

  @ApiProperty()
  @IsUUID()
  periodoAcademicoId: string;

  @ApiProperty({ enum: EstadoFinalPeriodo })
  @IsEnum(EstadoFinalPeriodo)
  estadoFinalPeriodo: EstadoFinalPeriodo;

  @ApiPropertyOptional()
  @ValidateIf((dto: CreateOutcomeDto) => dto.estadoFinalPeriodo !== EstadoFinalPeriodo.ACTIVO)
  @IsDateString()
  fechaEvento?: string;

  @ApiPropertyOptional()
  @ValidateIf((dto: CreateOutcomeDto) => dto.estadoFinalPeriodo !== EstadoFinalPeriodo.ACTIVO)
  @IsString()
  motivoRegistradoSalida?: string;

  @ApiProperty({ enum: FuenteConfirmacion })
  @IsEnum(FuenteConfirmacion)
  fuenteConfirmacion: FuenteConfirmacion;
}

export class UpdateOutcomeDto {
  @ApiPropertyOptional({ enum: EstadoFinalPeriodo })
  @IsOptional()
  @IsEnum(EstadoFinalPeriodo)
  estadoFinalPeriodo?: EstadoFinalPeriodo;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  fechaEvento?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  motivoRegistradoSalida?: string;

  @ApiPropertyOptional({ enum: FuenteConfirmacion })
  @IsOptional()
  @IsEnum(FuenteConfirmacion)
  fuenteConfirmacion?: FuenteConfirmacion;
}
