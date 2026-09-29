import { Injectable } from '@nestjs/common';

export interface RequestRecord {
  method: string;
  url: string;
  statusCode: number;
  durationMs: number;
  timestamp: string;
}

@Injectable()
export class MetricsService {
  private startTime = Date.now();
  private totalRequests = 0;
  private statusCodes: Record<string, number> = {};
  private durations: number[] = [];
  private recentRequests: RequestRecord[] = [];
  private readonly maxRecent = 50;

  recordRequest(
    method: string,
    url: string,
    statusCode: number,
    durationMs: number,
  ) {
    this.totalRequests++;

    const statusGroup = `${Math.floor(statusCode / 100)}xx`;
    this.statusCodes[statusGroup] = (this.statusCodes[statusGroup] || 0) + 1;

    this.durations.push(durationMs);
    if (this.durations.length > 500) {
      this.durations.shift();
    }

    this.recentRequests.unshift({
      method,
      url,
      statusCode,
      durationMs: Math.round(durationMs * 100) / 100,
      timestamp: new Date().toISOString(),
    });

    if (this.recentRequests.length > this.maxRecent) {
      this.recentRequests.pop();
    }
  }

  getMetrics() {
    const memory = process.memoryUsage();
    const uptimeSeconds = Math.floor((Date.now() - this.startTime) / 1000);

    const sortedDurations = [...this.durations].sort((a, b) => a - b);
    const count = sortedDurations.length;
    const avg =
      count > 0
        ? Math.round(
            (sortedDurations.reduce((acc, v) => acc + v, 0) / count) * 100,
          ) / 100
        : 0;
    const p50 =
      count > 0
        ? Math.round(sortedDurations[Math.floor(count * 0.5)] * 100) / 100
        : 0;
    const p95 =
      count > 0
        ? Math.round(sortedDurations[Math.floor(count * 0.95)] * 100) / 100
        : 0;
    const p99 =
      count > 0
        ? Math.round(sortedDurations[Math.floor(count * 0.99)] * 100) / 100
        : 0;

    return {
      status: 'ok',
      uptimeSeconds,
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        memoryMb: {
          rss: Math.round((memory.rss / 1024 / 1024) * 100) / 100,
          heapTotal: Math.round((memory.heapTotal / 1024 / 1024) * 100) / 100,
          heapUsed: Math.round((memory.heapUsed / 1024 / 1024) * 100) / 100,
          external: Math.round((memory.external / 1024 / 1024) * 100) / 100,
        },
      },
      http: {
        totalRequests: this.totalRequests,
        statusCodes: this.statusCodes,
        latencyMs: {
          avg,
          p50,
          p95,
          p99,
          samples: count,
        },
      },
      recentRequests: this.recentRequests.slice(0, 10),
    };
  }
}
