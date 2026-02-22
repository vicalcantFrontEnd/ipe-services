export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta?: {
    pagination?: {
      cursor: string | null;
      hasMore: boolean;
      total?: number;
    };
    requestId?: string;
    timestamp?: string;
  };
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown[];
    requestId?: string;
  };
}
