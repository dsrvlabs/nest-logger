"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WINSTON_MODULE_PROVIDER = exports.HttpLoggerMiddleware = exports.LoggerService = exports.LoggerModule = void 0;
var logger_module_1 = require("./logger.module");
Object.defineProperty(exports, "LoggerModule", { enumerable: true, get: function () { return logger_module_1.LoggerModule; } });
var logger_service_1 = require("./logger.service");
Object.defineProperty(exports, "LoggerService", { enumerable: true, get: function () { return logger_service_1.LoggerService; } });
var http_logger_middleware_1 = require("./http-logger.middleware");
Object.defineProperty(exports, "HttpLoggerMiddleware", { enumerable: true, get: function () { return http_logger_middleware_1.HttpLoggerMiddleware; } });
var nest_winston_1 = require("nest-winston");
Object.defineProperty(exports, "WINSTON_MODULE_PROVIDER", { enumerable: true, get: function () { return nest_winston_1.WINSTON_MODULE_PROVIDER; } });
//# sourceMappingURL=index.js.map