import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateCourseDto {
  @ApiProperty({ example: '3ro A' })
  @IsString()
  nombre: string;

  @ApiProperty({ example: '3ro' })
  @IsString()
  gradoNivel: string;

  @ApiProperty({ example: 'A' })
  @IsString()
  seccion: string;
}

export class UpdateCourseDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nombre?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  gradoNivel?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  seccion?: string;
}
