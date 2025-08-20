import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode: number;
  isOperational: boolean;
}

export class CustomError extends Error implements AppError {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends CustomError {
  constructor(message: string, details?: string[]) {
    super(`Validation Error: ${message}`, 400);
    this.name = 'ValidationError';
    if (details) {
      this.message += ` Details: ${details.join(', ')}`;
    }
  }
}

export class LLMProviderError extends CustomError {
  constructor(provider: string, originalError: Error) {
    super(`LLM Provider Error (${provider}): ${originalError.message}`, 502);
    this.name = 'LLMProviderError';
  }
}

export class QueueError extends CustomError {
  constructor(message: string, operation: string) {
    super(`Queue Error during ${operation}: ${message}`, 500);
    this.name = 'QueueError';
  }
}

export class SessionError extends CustomError {
  constructor(message: string, sessionId?: string) {
    super(`Session Error${sessionId ? ` (${sessionId})` : ''}: ${message}`, 400);
    this.name = 'SessionError';
  }
}

export class RateLimitError extends CustomError {
  constructor(resource: string, limit: number) {
    super(`Rate limit exceeded for ${resource}. Limit: ${limit}`, 429);
    this.name = 'RateLimitError';
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let error = { ...err } as AppError;
  error.message = err.message;

  if (err.name === 'ValidationError') {
    error = new ValidationError(err.message);
  }

  if (err.name === 'CastError') {
    error = new CustomError('Invalid ID format', 400);
  }

  if (err.name === 'MulterError') {
    const multerErr = err as any;
    if (multerErr.code === 'LIMIT_FILE_SIZE') {
      error = new CustomError('File size too large', 413);
    } else if (multerErr.code === 'LIMIT_FILE_COUNT') {
      error = new CustomError('Too many files uploaded', 400);
    } else {
      error = new CustomError(`File upload error: ${multerErr.message}`, 400);
    }
  }

  if (err.message?.includes('ECONNREFUSED')) {
    error = new CustomError('Service temporarily unavailable', 503);
  }

  if (err.message?.includes('timeout')) {
    error = new CustomError('Request timeout', 504);
  }

  const statusCode = error.statusCode || 500;
  const isOperational = error.isOperational !== undefined ? error.isOperational : false;

  console.error({
    timestamp: new Date().toISOString(),
    error: {
      name: err.name,
      message: err.message,
      stack: err.stack,
      statusCode,
      isOperational,
      url: req.url,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    }
  });

  if (process.env.NODE_ENV === 'production' && !isOperational) {
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong',
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] || 'unknown'
    });
    return;
  }

  res.status(statusCode).json({
    status: 'error',
    message: error.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: error.stack }),
    timestamp: new Date().toISOString(),
    requestId: req.headers['x-request-id'] || 'unknown'
  });
};

export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  const error = new CustomError(`Route ${req.originalUrl} not found`, 404);
  next(error);
};

export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};