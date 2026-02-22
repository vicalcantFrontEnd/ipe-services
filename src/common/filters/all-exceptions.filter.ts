import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { BusinessException } from '../exceptions';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<FastifyRequest>();
    const correlationId = request.headers['x-correlation-id'] as string;

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorCode = 'S_INTERNAL_ERROR';
    let message = 'Internal server error';
    let details: unknown[] | undefined;

    if (exception instanceof BusinessException) {
      status = exception.getStatus();
      errorCode = exception.errorCode;
      message = exception.message;
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const resp = exceptionResponse as Record<string, unknown>;
        message = (resp['message'] as string) ?? exception.message;
        if (Array.isArray(resp['message'])) {
          details = resp['message'] as unknown[];
          message = 'Validation failed';
          errorCode = 'V_INVALID_INPUT';
        }
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    // Log error (never log stack traces for client errors)
    if (status >= 500) {
      this.logger.error(
        `[${correlationId}] ${request.method} ${request.url} ${status} - ${message}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    } else {
      this.logger.warn(`[${correlationId}] ${request.method} ${request.url} ${status} - ${message}`);
    }

    const errorResponse = {
      success: false,
      error: {
        code: errorCode,
        message,
        ...(details && { details }),
        requestId: correlationId,
      },
    };

    void response.status(status).send(errorResponse);
  }
}
