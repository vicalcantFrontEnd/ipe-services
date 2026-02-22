import { HttpException, HttpStatus } from '@nestjs/common';

export const ErrorCodes = {
  // Validation
  V_INVALID_INPUT: 'V_INVALID_INPUT',

  // Authentication
  A_INVALID_CREDENTIALS: 'A_INVALID_CREDENTIALS',
  A_TOKEN_EXPIRED: 'A_TOKEN_EXPIRED',
  A_INSUFFICIENT_PERMISSIONS: 'A_INSUFFICIENT_PERMISSIONS',
  A_ACCOUNT_DISABLED: 'A_ACCOUNT_DISABLED',

  // Business
  B_RESOURCE_NOT_FOUND: 'B_RESOURCE_NOT_FOUND',
  B_DUPLICATE_RESOURCE: 'B_DUPLICATE_RESOURCE',
  B_INVALID_STATE_TRANSITION: 'B_INVALID_STATE_TRANSITION',
  B_QUOTA_EXCEEDED: 'B_QUOTA_EXCEEDED',
  B_APPOINTMENT_CONFLICT: 'B_APPOINTMENT_CONFLICT',

  // System
  S_INTERNAL_ERROR: 'S_INTERNAL_ERROR',
  S_RATE_LIMITED: 'S_RATE_LIMITED',
  S_SERVICE_UNAVAILABLE: 'S_SERVICE_UNAVAILABLE',
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];

export class BusinessException extends HttpException {
  constructor(
    public readonly errorCode: ErrorCode,
    message: string,
    statusCode: number = HttpStatus.BAD_REQUEST,
  ) {
    super({ errorCode, message }, statusCode);
  }
}

export class ResourceNotFoundException extends BusinessException {
  constructor(resource: string, id: string) {
    super(ErrorCodes.B_RESOURCE_NOT_FOUND, `${resource} '${id}' not found`, HttpStatus.NOT_FOUND);
  }
}

export class DuplicateResourceException extends BusinessException {
  constructor(resource: string, field: string) {
    super(ErrorCodes.B_DUPLICATE_RESOURCE, `${resource} with this ${field} already exists`, HttpStatus.CONFLICT);
  }
}

export class InvalidStateTransitionException extends BusinessException {
  constructor(resource: string, from: string, to: string) {
    super(
      ErrorCodes.B_INVALID_STATE_TRANSITION,
      `Cannot transition ${resource} from '${from}' to '${to}'`,
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
  }
}
