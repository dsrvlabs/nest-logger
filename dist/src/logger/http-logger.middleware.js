"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpLoggerMiddleware = void 0;
const common_1 = require("@nestjs/common");
const logger_service_1 = require("./logger.service");
let HttpLoggerMiddleware = class HttpLoggerMiddleware {
    logger;
    constructor(logger) {
        this.logger = logger;
    }
    use(req, res, next) {
        const { method, originalUrl, ip, headers } = req;
        const userAgent = headers['user-agent'] || '';
        const startTime = Date.now();
        const requestLog = {
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
        res.on('finish', () => {
            const endTime = Date.now();
            const responseTime = ((endTime - startTime) / 1000).toFixed(3);
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
        res.on('error', (error) => {
            const endTime = Date.now();
            const responseTime = ((endTime - startTime) / 1000).toFixed(3);
            const errorStatus = error && typeof error === 'object' && 'status' in error
                ? error.status
                : undefined;
            const errorMessage = error instanceof Error
                ? error.message
                : typeof error === 'object' &&
                    error !== null &&
                    'message' in error
                    ? String(error.message)
                    : 'Unknown error';
            const errorStack = error instanceof Error
                ? error.stack || ''
                : typeof error === 'object' && error !== null && 'stack' in error
                    ? (() => {
                        const stack = error.stack;
                        return typeof stack === 'string' ? stack : '';
                    })()
                    : '';
            const errorLog = {
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
    sanitizeBody(body) {
        if (!body)
            return body;
        if (typeof body !== 'object' || body === null) {
            return body;
        }
        const sensitiveFields = ['password', 'token', 'secret', 'authorization'];
        const sanitized = { ...body };
        for (const field of sensitiveFields) {
            if (field in sanitized) {
                sanitized[field] = '***REDACTED***';
            }
        }
        return sanitized;
    }
};
exports.HttpLoggerMiddleware = HttpLoggerMiddleware;
exports.HttpLoggerMiddleware = HttpLoggerMiddleware = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [logger_service_1.LoggerService])
], HttpLoggerMiddleware);
//# sourceMappingURL=http-logger.middleware.js.map