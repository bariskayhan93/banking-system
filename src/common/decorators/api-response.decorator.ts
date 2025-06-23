import {applyDecorators, Type} from '@nestjs/common';
import {ApiExtraModels, ApiResponse, getSchemaPath} from '@nestjs/swagger';
import {ApiErrorResponse} from '../dto/api-error-response.dto';

export const ApiOkResponse = <DataDto extends Type<unknown>>(
    dataDto: DataDto,
    description: string,
    isArray = false,
) =>
    applyDecorators(
        ApiExtraModels(dataDto),
        ApiResponse({
            status: 200,
            description,
            schema: isArray
                ? {type: 'array', items: {$ref: getSchemaPath(dataDto)}}
                : {$ref: getSchemaPath(dataDto)},
        }),
    );

export const ApiCreatedResponse = <DataDto extends Type<unknown>>(
    dataDto: DataDto,
    description: string,
) =>
    applyDecorators(
        ApiExtraModels(dataDto),
        ApiResponse({
            status: 201,
            description,
            schema: {
                $ref: getSchemaPath(dataDto),
            },
        }),
    );

export const ApiNoContentResponse = (description: string) =>
    ApiResponse({
        status: 204,
        description,
    });

export const ApiConflictResponse = (description = 'Conflict') =>
    ApiResponse({
        status: 409,
        description,
        type: ApiErrorResponse,
    });

export const ApiNotFoundResponse = (description = 'Not Found') =>
    ApiResponse({
        status: 404,
        description,
        type: ApiErrorResponse,
    });

export const ApiBadRequestResponse = (description = 'Bad Request') =>
    ApiResponse({
        status: 400,
        description,
        type: ApiErrorResponse,
    });
