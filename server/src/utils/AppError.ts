export class AppError extends Error {
  status: number;
  errorCode: string;

  constructor(message: string, status = 400, errorCode = 'BAD_REQUEST') {
    super(message);
    this.status = status;
    this.errorCode = errorCode;
  }

  static badRequest(message: string, errorCode = 'BAD_REQUEST') {
    return new AppError(message, 400, errorCode);
  }
  static unauthorized(message = 'Authentication required', errorCode = 'UNAUTHORIZED') {
    return new AppError(message, 401, errorCode);
  }
  static forbidden(message = 'You do not have permission to perform this action', errorCode = 'FORBIDDEN') {
    return new AppError(message, 403, errorCode);
  }
  static notFound(message = 'Resource not found', errorCode = 'NOT_FOUND') {
    return new AppError(message, 404, errorCode);
  }
  static conflict(message: string, errorCode = 'CONFLICT') {
    return new AppError(message, 409, errorCode);
  }
}
