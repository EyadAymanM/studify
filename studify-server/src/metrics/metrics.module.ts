import { Module, Global } from '@nestjs/common';
import { MetricsService } from './metrics.service.js';
import { MetricsController } from './metrics.controller.js';
import { PerformanceInterceptor } from './performance.interceptor.js';

@Global()
@Module({
  controllers: [MetricsController],
  providers: [MetricsService, PerformanceInterceptor],
  exports: [MetricsService, PerformanceInterceptor],
})
export class MetricsModule {}
