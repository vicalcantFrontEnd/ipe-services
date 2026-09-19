import { Injectable, NestInterceptor, ExecutionContext, CallHandler, RequestTimeoutException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, throwError, TimeoutError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { REQUEST_TIMEOUT_KEY } from '../decorators';

const DEFAULT_TIMEOUT_MS = 15000;

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler<unknown>): Observable<unknown> {
    // Los handlers pueden sobrescribir el timeout con @RequestTimeout(ms).
    const override = this.reflector.getAllAndOverride<number>(REQUEST_TIMEOUT_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const timeoutMs = override ?? DEFAULT_TIMEOUT_MS;

    // 0 (o negativo) → sin timeout del interceptor.
    if (timeoutMs <= 0) {
      return next.handle();
    }

    return next.handle().pipe(
      timeout(timeoutMs),
      catchError((err: unknown) =>
        err instanceof TimeoutError
          ? throwError(() => new RequestTimeoutException('Request timed out'))
          : throwError(() => err),
      ),
    );
  }
}
