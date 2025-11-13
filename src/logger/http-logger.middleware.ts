import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { LoggerService } from './logger.service';

@Injectable()
export class HttpLoggerMiddleware implements NestMiddleware {
  constructor(private readonly logger: LoggerService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl } = req;
    const startTime = Date.now();

    // Request 로그
    const requestBody = this.sanitizeBody(req.body);
    const requestQuery =
      Object.keys(req.query).length > 0 ? req.query : undefined;
    const requestParams =
      Object.keys(req.params).length > 0 ? req.params : undefined;

    this.logger.getWinstonLogger().info('REQ', {
      context: 'HttpLogger',
      method,
      url: originalUrl,
      body: requestBody,
      query: requestQuery,
      params: requestParams,
    });

    // Response body 캡처를 위한 변수
    const chunks: Buffer[] = [];
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const originalWrite = res.write.bind(res);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const originalEnd = res.end.bind(res);

    res.write = function (chunk: any, ...args: any[]) {
      if (chunk) {
        if (Buffer.isBuffer(chunk)) {
          chunks.push(chunk);
        } else if (typeof chunk === 'string') {
          chunks.push(Buffer.from(chunk));
        }
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
      return originalWrite(chunk, ...args);
    };

    res.end = function (chunk: any, ...args: any[]) {
      if (chunk) {
        if (Buffer.isBuffer(chunk)) {
          chunks.push(chunk);
        } else if (typeof chunk === 'string') {
          chunks.push(Buffer.from(chunk));
        }
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
      return originalEnd(chunk, ...args);
    };

    // Response 완료 시 로그
    res.on('finish', () => {
      const endTime = Date.now();
      const responseTime = ((endTime - startTime) / 1000).toFixed(3); // sec 단위

      // Response body 파싱 시도
      let responseBody: unknown = undefined;
      try {
        if (chunks.length > 0) {
          const bodyString = Buffer.concat(chunks).toString('utf8');
          if (bodyString) {
            try {
              responseBody = JSON.parse(bodyString);
            } catch {
              // JSON이 아니면 문자열로 저장 (너무 길면 잘라냄)
              responseBody =
                bodyString.length > 500
                  ? bodyString.substring(0, 500) + '...'
                  : bodyString;
            }
          }
        }
      } catch {
        // 파싱 실패 시 무시
      }

      // Response 로그
      this.logger.getWinstonLogger().info('RES', {
        context: 'HttpLogger',
        method,
        url: originalUrl,
        statusCode: res.statusCode,
        responseTime: `${responseTime}s`,
        body: responseBody,
      });
    });

    // Error 발생 시 로그
    res.on('error', (error: unknown) => {
      const endTime = Date.now();
      const responseTime = ((endTime - startTime) / 1000).toFixed(3); // sec 단위

      const errorStatus =
        error && typeof error === 'object' && 'status' in error
          ? (error as { status?: number }).status
          : undefined;

      const errorMessage =
        error instanceof Error
          ? error.message
          : typeof error === 'object' && error !== null && 'message' in error
            ? String((error as { message?: unknown }).message)
            : 'Unknown error';

      // Error Response 로그
      this.logger.getWinstonLogger().error('RES', {
        context: 'HttpLogger',
        method,
        url: originalUrl,
        statusCode: errorStatus || 500,
        responseTime: `${responseTime}s`,
        error: errorMessage,
      });
    });

    next();
  }

  private sanitizeBody(body: unknown): unknown {
    if (!body) return body;

    if (typeof body !== 'object' || body === null) {
      return body;
    }

    const sensitiveFields = ['password', 'token', 'secret', 'authorization'];
    const sanitized = { ...(body as Record<string, unknown>) };

    for (const field of sensitiveFields) {
      if (field in sanitized) {
        sanitized[field] = '***REDACTED***';
      }
    }

    return sanitized;
  }
}
