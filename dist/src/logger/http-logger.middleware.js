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
        const { method, originalUrl } = req;
        const startTime = Date.now();
        const requestId = req.headers['x-request-id'];
        const requestBody = this.sanitizeBody(req.body);
        const requestQuery = Object.keys(req.query).length > 0 ? req.query : undefined;
        const requestParams = Object.keys(req.params).length > 0 ? req.params : undefined;
        const requestLogData = {
            context: 'HttpLogger',
            method,
            url: originalUrl,
            body: requestBody,
            query: requestQuery,
            params: requestParams,
        };
        if (requestId) {
            requestLogData.requestId = requestId;
        }
        this.logger.getWinstonLogger().info('REQ', requestLogData);
        const chunks = [];
        const originalWrite = res.write.bind(res);
        const originalEnd = res.end.bind(res);
        res.write = function (chunk, ...args) {
            if (chunk) {
                if (Buffer.isBuffer(chunk)) {
                    chunks.push(chunk);
                }
                else if (typeof chunk === 'string') {
                    chunks.push(Buffer.from(chunk));
                }
            }
            return originalWrite(chunk, ...args);
        };
        res.end = function (chunk, ...args) {
            if (chunk) {
                if (Buffer.isBuffer(chunk)) {
                    chunks.push(chunk);
                }
                else if (typeof chunk === 'string') {
                    chunks.push(Buffer.from(chunk));
                }
            }
            return originalEnd(chunk, ...args);
        };
        res.on('finish', () => {
            const endTime = Date.now();
            const responseTime = ((endTime - startTime) / 1000).toFixed(3);
            let responseBody = undefined;
            try {
                if (chunks.length > 0) {
                    const bodyString = Buffer.concat(chunks).toString('utf8');
                    if (bodyString) {
                        try {
                            responseBody = JSON.parse(bodyString);
                        }
                        catch {
                            responseBody =
                                bodyString.length > 500
                                    ? bodyString.substring(0, 500) + '...'
                                    : bodyString;
                        }
                    }
                }
            }
            catch {
            }
            const responseLogData = {
                context: 'HttpLogger',
                method,
                url: originalUrl,
                statusCode: res.statusCode,
                responseTime: `${responseTime}s`,
                body: responseBody,
            };
            if (requestId) {
                responseLogData.requestId = requestId;
            }
            this.logger.getWinstonLogger().info('RES', responseLogData);
        });
        res.on('error', (error) => {
            const endTime = Date.now();
            const responseTime = ((endTime - startTime) / 1000).toFixed(3);
            const errorStatus = error && typeof error === 'object' && 'status' in error
                ? error.status
                : undefined;
            const errorMessage = error instanceof Error
                ? error.message
                : typeof error === 'object' && error !== null && 'message' in error
                    ? String(error.message)
                    : 'Unknown error';
            const errorLogData = {
                context: 'HttpLogger',
                method,
                url: originalUrl,
                statusCode: errorStatus || 500,
                responseTime: `${responseTime}s`,
                error: errorMessage,
            };
            if (requestId) {
                errorLogData.requestId = requestId;
            }
            this.logger.getWinstonLogger().error('RES', errorLogData);
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