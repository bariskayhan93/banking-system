import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateFriendshipDto {
    @ApiProperty({
        description: 'ID of the friend to connect with',
        example: '3a5e7d9c-1b2e-4f6a-8c9d-7e5f3a1b2c4d'
    })
    @IsUUID()
    @IsNotEmpty()
    friendId: string;
}