import { Test } from '@nestjs/testing';
import { GlobalExceptionFilter } from './global-exception.filter';
import { Logger, HttpException, HttpStatus } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { ArgumentsHost } from '@nestjs/common';

describe('GlobalExceptionFilter', () => {
  let filter: GlobalExceptionFilter;
  let httpAdapterHost: HttpAdapterHost;
  let mockResponse: any;
  let mockRequest: any;
  let mockHost: ArgumentsHost;
  let mockAdapter: any;

  beforeEach(async () => {
    mockResponse = {};
    mockRequest = { url: '/test' };
    mockAdapter = { reply: jest.fn() };

    mockHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
    } as any;

    const module = await Test.createTestingModule({
      providers: [
        GlobalExceptionFilter,
        {
          provide: HttpAdapterHost,
          useValue: { httpAdapter: mockAdapter },
        },
      ],
    }).compile();

    filter = module.get<GlobalExceptionFilter>(GlobalExceptionFilter);
    httpAdapterHost = module.get<HttpAdapterHost>(HttpAdapterHost);
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  it('should handle HttpException', () => {
    const exception = new HttpException('Test error', HttpStatus.BAD_REQUEST);

    filter.catch(exception, mockHost);

    expect(mockAdapter.reply).toHaveBeenCalledWith(
      mockResponse,
      expect.objectContaining({ statusCode: 400, message: 'Test error' }),
      400,
    );
  });

  it('should handle generic Error', () => {
    const exception = new Error('Generic error');

    filter.catch(exception, mockHost);

    expect(mockAdapter.reply).toHaveBeenCalledWith(
      mockResponse,
      expect.objectContaining({ statusCode: 500 }),
      500,
    );
  });
});
