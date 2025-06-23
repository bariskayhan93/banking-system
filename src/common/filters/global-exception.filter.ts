import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import {HttpAdapterHost} from '@nestjs/core';
import {QueryFailedError} from 'typeorm';
import {ApiErrorResponse} from '../dto/api-error-response.dto';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(GlobalExceptionFilter.name);

    constructor(private readonly httpAdapterHost: HttpAdapterHost) {
    }

    catch(exception: unknown, host: ArgumentsHost): void {
        const {httpAdapter} = this.httpAdapterHost;
        const ctx = host.switchToHttp();
        const request = ctx.getRequest();
        const response = ctx.getResponse();

        let statusCode: number;
        let message: string;

        if (exception instanceof HttpException) {
            statusCode = exception.getStatus();
            const errorResponse = exception.getResponse();
            message = (errorResponse as any).message || exception.message;
        } else if (exception instanceof QueryFailedError) {
            statusCode = HttpStatus.CONFLICT; // 409
            message =
                'Database constraint violation. The request could not be completed due to a conflict with the current state of the resource.';
            // Log the specific database error for debugging
            this.logger.error(
                `QueryFailedError: ${exception.message}`,
                exception.stack,
            );
        } else {
            statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
            message = 'An unexpected error occurred.';
        }

        const apiError = new ApiErrorResponse(statusCode, message, request.url);

        this.logger.error(
            `[${GlobalExceptionFilter.name}] ${JSON.stringify(apiError)}`,
            (exception as any).stack,
        );

        httpAdapter.reply(response, apiError, statusCode);
    }
}
