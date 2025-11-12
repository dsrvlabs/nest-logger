import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { LoggerService } from './logger.service';
export declare class LoggerModule {
    static forRoot(options?: {
        transports?: winston.transport[];
        format?: winston.Logform.Format;
    }): {
        module: typeof LoggerModule;
        imports: import("@nestjs/common").DynamicModule[];
        providers: (typeof LoggerService)[];
        exports: (typeof LoggerService | typeof WinstonModule)[];
    };
}
