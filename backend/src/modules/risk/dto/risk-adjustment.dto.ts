import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsUUID, Max, Min } from 'class-validator';

export class RiskAdjustmentDto {
  @ApiProperty()
  @IsUUID()
  estudianteId: string;

  @ApiProperty({ minimum: -100, maximum: 100, description: 'Signed percentage points to add' })
  @IsNumber()
  @Min(-100)
  @Max(100)
  ajuste: number;
}
