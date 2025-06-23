import { ApiProperty } from '@nestjs/swagger';

export class ApiErrorResponse {
  @ApiProperty({ example: 404 })
  statusCode: number;

  @ApiProperty({ example: '2025-06-23T18:00:00.000Z' })
  timestamp: string;

  @ApiProperty({ example: '/persons/some-invalid-id' })
  path: string;

  @ApiProperty({ example: 'Person with ID some-invalid-id not found' })
  message: string;

  constructor(statusCode: number, message: string, path: string) {
    this.statusCode = statusCode;
    this.message = message;
    this.path = path;
    this.timestamp = new Date().toISOString();
  }
}

