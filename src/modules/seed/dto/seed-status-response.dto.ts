import { ApiProperty } from '@nestjs/swagger';

export class SeedStatusResponseDto {
  @ApiProperty({
    description: 'Whether the database has been seeded',
    example: true,
  })
  seeded: boolean;
}

