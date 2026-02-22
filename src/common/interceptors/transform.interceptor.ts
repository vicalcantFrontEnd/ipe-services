import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, map } from 'rxjs';

export interface SuccessResponse<T> {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, SuccessResponse<T>> {
  intercept(_context: ExecutionContext, next: CallHandler<T>): Observable<SuccessResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        // If the response already has a success property, pass through
        if (data && typeof data === 'object' && 'success' in data) {
          return data as unknown as SuccessResponse<T>;
        }
        return { success: true as const, data };
      }),
    );
  }
}
