import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsEnum, IsInt, IsNumber, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';
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

  @ApiPropertyOptional({ minimum: 1, maximum: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  situacionEconomicaFamiliar?: number;

  @ApiPropertyOptional({ minimum: 1, maximum: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  apoyoFamiliarPercibido?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  trabajaDurantePeriodoEscolar?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  distanciaHogarEscuelaKm?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  problemasFamiliaresReportados?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  senalesPreviasAbandono?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  factorAjusteOrientador?: number;
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

  @ApiPropertyOptional({ minimum: 1, maximum: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  situacionEconomicaFamiliar?: number;

  @ApiPropertyOptional({ minimum: 1, maximum: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  apoyoFamiliarPercibido?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  trabajaDurantePeriodoEscolar?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  distanciaHogarEscuelaKm?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  problemasFamiliaresReportados?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  senalesPreviasAbandono?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  factorAjusteOrientador?: number;
}
