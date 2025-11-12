import {
  Injectable,
  LoggerService as NestLoggerService,
  Inject,
} from '@nestjs/common';
import { WinstonLogger, WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class LoggerService implements NestLoggerService {
  constructor(
    private readonly winston: WinstonLogger,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly winstonLogger: Logger,
  ) {}

  log(message: string, context?: string) {
    this.winston.log(message, context);
  }

  error(message: string, trace?: string, context?: string) {
    this.winston.error(message, trace, context);
  }

  warn(message: string, context?: string) {
    this.winston.warn(message, context);
  }

  debug(message: string, context?: string) {
    this.winston.debug?.(message, context);
  }

  verbose(message: string, context?: string) {
    this.winston.verbose?.(message, context);
  }

  getWinstonLogger(): Logger {
    return this.winstonLogger;
  }
}
