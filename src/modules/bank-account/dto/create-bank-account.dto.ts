import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, Length, Matches } from 'class-validator';

export class CreateBankAccountDto {
  @ApiProperty({
    example: 'DE89370400440532013000',
    description: 'International Bank Account Number (IBAN) in valid format',
  })
  @IsString()
  @IsNotEmpty()
  @Length(15, 34, { message: 'IBAN must be between 15 and 34 characters' })
  @Matches(/^[A-Z]{2}[0-9]{2}[A-Z0-9]+$/, {message: 'IBAN must start with 2 letters, 2 digits, followed by alphanumeric characters'})
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
