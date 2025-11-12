# nest-logger

NestJS Winston Logger Module with HTTP Request/Response Logging

## Features

- 🎯 Winston 기반 로깅 모듈
- 📝 HTTP 요청/응답 자동 로깅
- ⏱️ 응답 시간 측정 (초 단위)
- 🔒 민감한 정보 자동 마스킹 (password, token, secret, authorization)

## Installation

```bash
npm install nest-logger
# or
pnpm add nest-logger
# or
yarn add nest-logger
```

## Usage

### 1. Module Import

```typescript
import { Module } from '@nestjs/common';
import { LoggerModule } from 'nest-logger';

@Module({
  imports: [LoggerModule],
  // ...
})
export class AppModule {}
```

### 2. HTTP 로깅 Middleware 설정

```typescript
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { LoggerModule, HttpLoggerMiddleware } from 'nest-logger';

@Module({
  imports: [LoggerModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HttpLoggerMiddleware).forRoutes('*');
  }
}
```

또는 특정 경로에만 적용:

```typescript
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { LoggerModule, HttpLoggerMiddleware } from 'nest-logger';

@Module({
  imports: [LoggerModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HttpLoggerMiddleware).forRoutes('api/*'); // 특정 경로에만 적용
  }
}
```

### 3. Logger Service 사용

```typescript
import { Injectable } from '@nestjs/common';
import { LoggerService } from 'nest-logger';

@Injectable()
export class YourService {
  constructor(private readonly logger: LoggerService) {}

  someMethod() {
    this.logger.log('Info message', 'YourService');
    this.logger.error('Error message', 'stack trace', 'YourService');
    this.logger.warn('Warning message', 'YourService');
    this.logger.debug('Debug message', 'YourService');
    this.logger.verbose('Verbose message', 'YourService');
  }
}
```

### 4. Winston Logger 직접 사용

winston Logger 인스턴스를 직접 주입받아 사용할 수 있습니다:

```typescript
import { Injectable, Inject } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-logger';
import type { Logger } from 'winston';

@Injectable()
export class YourService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  someMethod() {
    // winston Logger의 모든 메서드 사용 가능
    this.logger.info('Info message', { context: 'YourService', userId: 123 });
    j;
    this.logger.error('Error message', {
      error: new Error('Something went wrong'),
    });
    this.logger.warn('Warning message', { data: { key: 'value' } });
    this.logger.debug('Debug message', { metadata: 'some data' });

    // winston의 고급 기능 사용
    this.logger.log({
      level: 'info',
      message: 'Custom log',
      timestamp: new Date().toISOString(),
      metadata: { custom: 'data' },
    });
  }
}
```

또는 LoggerService를 통해 winston Logger 인스턴스 가져오기:

```typescript
import { Injectable } from '@nestjs/common';
import { LoggerService } from 'nest-logger';

@Injectable()
export class YourService {
  constructor(private readonly loggerService: LoggerService) {}

  someMethod() {
    const winstonLogger = this.loggerService.getWinstonLogger();

    // winston Logger 직접 사용
    winstonLogger.info('Info message', { context: 'YourService' });
    winstonLogger.error('Error message', { error: new Error('Error') });
  }
}
```

## Log Output

HTTP 요청/응답 로그는 줄바꿈 없이 한 줄로 출력됩니다.

### Request Log

```
2024-01-01 12:00:00 info [HttpLogger] HTTP Request {"type":"REQUEST","method":"GET","url":"/api/users","ip":"127.0.0.1","userAgent":"Mozilla/5.0...","body":{},"query":{},"params":{}}
```

### Response Log

```
2024-01-01 12:00:00 info [HttpLogger] HTTP Response {"type":"RESPONSE","method":"GET","url":"/api/users","statusCode":200,"responseTime":"0.123s","ip":"127.0.0.1","userAgent":"Mozilla/5.0..."}
```

## Custom Configuration

```typescript
import { LoggerModule } from 'nest-logger';
import * as winston from 'winston';

@Module({
  imports: [
    LoggerModule.forRoot({
      transports: [
        new winston.transports.File({
          filename: 'error.log',
          level: 'error',
        }),
        new winston.transports.Console(),
      ],
    }),
  ],
})
export class AppModule {}
```

## Development

프로젝트를 수정한 후 GitHub에 푸시하기 전에 반드시 빌드를 실행해야 합니다:

```bash
# 빌드 실행
pnpm build

# 또는 prepush 스크립트 사용 (빌드 + git add dist/)
pnpm run prepush

# 커밋 및 푸시
git commit -m "Your changes"
git push
```

**중요:** 소스 코드(`src/`)를 수정한 경우 반드시 빌드 후 푸시해야 합니다. 그렇지 않으면 다른 프로젝트에서 오래된 빌드 파일을 사용하게 됩니다.

### Git Hook 사용 (선택사항)

자동으로 빌드하려면 `.git/hooks/pre-push` hook을 설정할 수 있습니다:

```bash
chmod +x .git/hooks/pre-push
```

이렇게 하면 `git push` 시 자동으로 빌드가 실행됩니다.

## License

MIT
