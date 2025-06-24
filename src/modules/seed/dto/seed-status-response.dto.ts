import {ApiProperty} from '@nestjs/swagger';

export class SeedStatusResponseDto {
    @ApiProperty({
        example: true
    })
    seeded: boolean;
}
