import { SetMetadata } from '@nestjs/common';

/**
 * Sobrescribe el timeout global (TimeoutInterceptor) para un handler concreto.
 *  - `@RequestTimeout(120000)` → 2 minutos (p. ej. generaciones con LLM).
 *  - `@RequestTimeout(0)`      → desactiva el timeout del interceptor.
 */
export const REQUEST_TIMEOUT_KEY = 'requestTimeoutMs';
export const RequestTimeout = (ms: number) => SetMetadata(REQUEST_TIMEOUT_KEY, ms);
