import {
  Catch,
  ExceptionFilter,
  HttpException,
  ArgumentsHost,
  Logger,
  HttpStatus,
} from '@nestjs/common';

@Catch()
export class HttpErrorFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();
    const status = exception.getStatus
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;
    const url = !request || request.url || 'Gql';
    const method = !request || request.method || 'Gql';

    const errorResponse = {
      code: status,
      timestamp: new Date().toLocaleDateString(),
      path: url,
      method: method,
      message:
        status !== HttpStatus.INTERNAL_SERVER_ERROR
          ? exception.message.error || exception.message || null
          : 'Internal server error',
    };

    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      console.log(exception);
    }

    Logger.error(
      `${method} ${url}`,
      JSON.stringify(errorResponse),
      'ExceptionFilter',
    );
    if (!response.status) {
      throw errorResponse;

    } else
      response.status(404).json(errorResponse);
  }
}
