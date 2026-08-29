import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';
import { CategoriaObservacion } from '../../../common/enums';

export class CreateClassroomObservationDto {
  @ApiProperty()
  @IsUUID()
  estudianteId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  asignaturaId?: string;

  @ApiProperty()
  @IsDateString()
  fecha: string;

  @ApiProperty({ enum: CategoriaObservacion })
  @IsEnum(CategoriaObservacion)
  categoria: CategoriaObservacion;

  @ApiProperty()
  @IsString()
  @MinLength(3)
  @MaxLength(2000)
  descripcion: string;
}

export class UpdateClassroomObservationDto {
  @ApiPropertyOptional({ enum: CategoriaObservacion })
  @IsOptional()
  @IsEnum(CategoriaObservacion)
  categoria?: CategoriaObservacion;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  fecha?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(2000)
  descripcion?: string;
}
