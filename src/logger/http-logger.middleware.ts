import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { LoggerService } from './logger.service';

@Injectable()
export class HttpLoggerMiddleware implements NestMiddleware {
  constructor(private readonly logger: LoggerService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, ip, headers } = req;
    const userAgent = headers['user-agent'] || '';
    const startTime = Date.now();

    // Request 로그
    const requestLog: {
      type: string;
      method: string | undefined;
      url: string;
      ip: string | undefined;
      userAgent: string;
      body: unknown;
      query: unknown;
      params: unknown;
    } = {
      type: 'REQUEST',
      method,
      url: originalUrl,
      ip,
      userAgent,
      body: this.sanitizeBody(req.body),
      query: req.query,
      params: req.params,
    };

    this.logger.getWinstonLogger().info('HTTP Request', {
      context: 'HttpLogger',
      ...requestLog,
    });

    // Response 완료 시 로그
    res.on('finish', () => {
      const endTime = Date.now();
      const responseTime = ((endTime - startTime) / 1000).toFixed(3); // sec 단위

      // Response 로그
      const responseLog = {
        type: 'RESPONSE',
        method,
        url: originalUrl,
        statusCode: res.statusCode,
        responseTime: `${responseTime}s`,
        ip,
        userAgent,
      };

      this.logger.getWinstonLogger().info('HTTP Response', {
        context: 'HttpLogger',
        ...responseLog,
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

      const errorStack =
        error instanceof Error
          ? error.stack || ''
          : typeof error === 'object' && error !== null && 'stack' in error
            ? (() => {
                const stack = (error as { stack?: unknown }).stack;
                return typeof stack === 'string' ? stack : '';
              })()
            : '';

      // Error Response 로그
      const errorLog: {
        type: string;
        method: string | undefined;
        url: string;
        statusCode: number;
        responseTime: string;
        ip: string | undefined;
        userAgent: string;
        error: {
          message: string;
          stack: string;
        };
      } = {
        type: 'RESPONSE',
        method,
        url: originalUrl,
        statusCode: errorStatus || 500,
        responseTime: `${responseTime}s`,
        ip,
        userAgent,
        error: {
          message: errorMessage,
          stack: errorStack,
        },
      };

      this.logger.getWinstonLogger().error('HTTP Error Response', {
        context: 'HttpLogger',
        ...errorLog,
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
