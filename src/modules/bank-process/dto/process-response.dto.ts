import { ApiProperty } from '@nestjs/swagger';

export class ProcessResponseDto {
  @ApiProperty({
    description: 'A message indicating the result of the process execution.',
    example: 'Processes up to 3 completed successfully.',
  })
  message: string;
}

