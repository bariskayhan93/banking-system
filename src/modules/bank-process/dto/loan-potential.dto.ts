import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsUUID, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class FriendLoanContribution {
  @ApiProperty({
    example: '456e7890-f12b-34c5-d678-901234567890',
  })
  @IsUUID()
  friendId: string;

  @ApiProperty({
    example: 'Alice Johnson',
  })
  friendName: string;

  @ApiProperty({
    example: 5000.0,
  })
  @IsNumber({
    allowNaN: false,
    allowInfinity: false,
    maxDecimalPlaces: 2,
  })
  friendNetWorth: number;

  @ApiProperty({
    example: 1250.0,
  })
  @IsNumber({
    allowNaN: false,
    allowInfinity: false,
    maxDecimalPlaces: 2,
  })
  maxLoanFromFriend: number;

  @ApiProperty({
    example: 25,
  })
  @IsNumber({
    allowNaN: false,
    allowInfinity: false,
    maxDecimalPlaces: 2,
  })
  lendingPercentage: number;
}

export class LoanPotentialDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  personId: string;

  @ApiProperty({
    example: 2500.5,
  })
  @IsNumber({
    allowNaN: false,
    allowInfinity: false,
    maxDecimalPlaces: 2,
  })
  personNetWorth: number;

  @ApiProperty({
    example: 1500.75,
  })
  @IsNumber({
    allowNaN: false,
    allowInfinity: false,
    maxDecimalPlaces: 2,
  })
  maxLoanAmount: number;

  @ApiProperty({
    type: [FriendLoanContribution],
    description: 'Breakdown of loan potential from each friend',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FriendLoanContribution)
  friendContributions: FriendLoanContribution[];

  @ApiProperty({
    example: 'PERCENTAGE_BASED',
    enum: ['PERCENTAGE_BASED', 'DIFFERENCE_BASED'],
    description: 'Calculation method used for loan potential',
  })
  calculationMethod: 'PERCENTAGE_BASED' | 'DIFFERENCE_BASED';
}
