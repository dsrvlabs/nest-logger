import { Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { LoggerService } from './logger.service';

@Module({
  imports: [
    WinstonModule.forRoot({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            winston.format.colorize(),
            winston.format.printf(
              ({ timestamp, level, message, context, ...meta }) => {
                const contextStr = context ? `[${context}]` : '';
                const metaStr = Object.keys(meta).length
                  ? ` ${JSON.stringify(meta)}`
                  : '';
                const logLine = `${timestamp} ${level} ${contextStr} ${message}${metaStr}`;
                // HttpLogger는 줄바꿈 없이 출력
                return context === 'HttpLogger' ? logLine : `${logLine}\n`;
              },
            ),
          ),
        }),
      ],
    }),
  ],
  providers: [LoggerService],
  exports: [LoggerService, WinstonModule],
})
export class LoggerModule {
  static forRoot(options?: {
    transports?: winston.transport[];
    format?: winston.Logform.Format;
  }) {
    return {
      module: LoggerModule,
      imports: [
        WinstonModule.forRoot({
          transports: options?.transports || [
            new winston.transports.Console({
              format: winston.format.combine(
                winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                winston.format.colorize(),
                winston.format.printf(
                  ({ timestamp, level, message, context, ...meta }) => {
                    const contextStr = context ? `[${context}]` : '';
                    const metaStr = Object.keys(meta).length
                      ? ` ${JSON.stringify(meta)}`
                      : '';
                    const logLine = `${timestamp} ${level} ${contextStr} ${message}${metaStr}`;
                    // HttpLogger는 줄바꿈 없이 출력
                    return context === 'HttpLogger' ? logLine : `${logLine}\n`;
                  },
                ),
              ),
            }),
          ],
        }),
      ],
      providers: [LoggerService],
      exports: [LoggerService, WinstonModule],
    };
  }
}
