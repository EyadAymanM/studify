import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MetricsService } from './metrics.service.js';
import type { Request, Response } from 'express';

@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
  constructor(private readonly metricsService: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();

    const start = performance.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = performance.now() - start;
          const statusCode = response.statusCode || 200;

          try {
            response.setHeader(
              'Server-Timing',
              `app;dur=${Math.round(duration * 100) / 100}`,
            );
          } catch {
            // Header may have already been sent in streaming responses
          }

          this.metricsService.recordRequest(
            request.method,
            request.originalUrl || request.url,
            statusCode,
            duration,
          );
        },
        error: (err) => {
          const duration = performance.now() - start;
          const statusCode = err?.status || 500;

          this.metricsService.recordRequest(
            request.method,
            request.originalUrl || request.url,
            statusCode,
            duration,
          );
        },
      }),
    );
  }
}
