import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { IsValidIban } from '../../../common/validators/iban.validator';

export class CreateBankAccountDto {
  @ApiProperty({
    example: 'DE89370400440532013000',
    description: 'International Bank Account Number (IBAN) in valid format',
  })
  @IsString()
  @IsNotEmpty()
  @IsValidIban()
  iban: string;

  @ApiProperty({
    example: 'Deutsche Bank',
    description: 'Bank name',
  })
  @IsString()
  @IsNotEmpty()
  bankName: string;

  @ApiProperty({
    example: '1f8e7a3c-9d4b-5c6a-8b2f-1e9d7f3a2c5b',
  })
  @IsUUID()
  personId: string;
}
