import { ApiResponse, ErrorCode } from '@/types/api';

export function createApiResponse<T>(data: T, message?: string): ApiResponse<T> {
  const response: ApiResponse<T> = {
    success: true,
    data
  };
  
  if (message) {
    response.message = message;
  }
  
  return response;
}

export function createErrorResponse(
  message: string,
  code: ErrorCode,
  details?: unknown
): ApiResponse {
  const response: ApiResponse = {
    success: false,
    error: {
      message,
      code
    }
  };
  
  if (details) {
    response.error!.details = details;
  }
  
  return response;
}

export function createValidationErrorResponse(details: unknown): ApiResponse {
  return createErrorResponse('Validation error', 'VALIDATION_ERROR', details);
}

export function createForbiddenResponse(message = 'Forbidden'): ApiResponse {
  return createErrorResponse(message, 'FORBIDDEN');
}

export function createUnauthorizedResponse(message = 'Unauthorized'): ApiResponse {
  return createErrorResponse(message, 'UNAUTHORIZED');
}

export function createNotFoundResponse(message = 'Not found'): ApiResponse {
  return createErrorResponse(message, 'NOT_FOUND');
}

export function createInternalErrorResponse(message = 'Internal server error'): ApiResponse {
  return createErrorResponse(message, 'INTERNAL_SERVER_ERROR');
}

export function createMethodNotAllowedResponse(method: string): ApiResponse {
  return createErrorResponse(`Method ${method} Not Allowed`, 'METHOD_NOT_ALLOWED');
} 