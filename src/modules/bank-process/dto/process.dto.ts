import { IsIn, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class ProcessDto {
  @ApiProperty({
    enum: [1, 2, 3],
    example: 3,
  })
  @Type(() => Number)
  @IsNumber()
  @IsIn([1, 2, 3])
  processId: number;
}
