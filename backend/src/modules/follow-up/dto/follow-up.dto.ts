import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { EstadoSeguimiento } from '../../../common/enums';

export class CreateFollowUpDto {
  @ApiProperty()
  @IsUUID()
  estudianteId: string;

  @ApiProperty()
  @IsDateString()
  fecha: string;

  @ApiProperty()
  @IsString()
  motivo: string;

  @ApiProperty()
  @IsString()
  observaciones: string;

  @ApiProperty()
  @IsString()
  acciones: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  proximaCita?: string;
}

export class UpdateFollowUpDto {
  @ApiPropertyOptional({ enum: EstadoSeguimiento })
  @IsOptional()
  @IsEnum(EstadoSeguimiento)
  estado?: EstadoSeguimiento;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  proximaCita?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  observaciones?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  acciones?: string;
}
