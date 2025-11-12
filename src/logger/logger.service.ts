import {
  Injectable,
  LoggerService as NestLoggerService,
  Inject,
} from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class LoggerService implements NestLoggerService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly winstonLogger: Logger,
  ) {}

  log(message: string, context?: string) {
    this.winstonLogger.info(message, { context });
  }

  error(message: string, trace?: string, context?: string) {
    this.winstonLogger.error(message, { context, trace });
  }

  warn(message: string, context?: string) {
    this.winstonLogger.warn(message, { context });
  }

  debug(message: string, context?: string) {
    this.winstonLogger.debug(message, { context });
  }

  verbose(message: string, context?: string) {
    this.winstonLogger.verbose(message, { context });
  }

  getWinstonLogger(): Logger {
    return this.winstonLogger;
  }
}
