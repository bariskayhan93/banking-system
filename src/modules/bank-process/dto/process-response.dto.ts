import {ApiProperty} from '@nestjs/swagger';

export class ProcessResponseDto {
    @ApiProperty({
        example: 'Processes up to 3 completed successfully.',
    })
    message: string;
}
