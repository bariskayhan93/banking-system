import { ApiProperty } from '@nestjs/swagger';

export class SeedResponseDto {
  @ApiProperty({
    description: 'A message indicating the result of the seed operation.',
    example: 'Database reset and reseeded successfully',
  })
  message: string;
}

