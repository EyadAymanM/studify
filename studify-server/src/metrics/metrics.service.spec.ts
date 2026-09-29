import { describe, it, expect, beforeEach } from 'vitest';
import { MetricsService } from './metrics.service.js';

describe('MetricsService', () => {
  let service: MetricsService;

  beforeEach(() => {
    service = new MetricsService();
  });

  it('should initialize with 0 requests and empty metrics', () => {
    const metrics = service.getMetrics();
    expect(metrics.status).toBe('ok');
    expect(metrics.http.totalRequests).toBe(0);
    expect(metrics.http.latencyMs.avg).toBe(0);
    expect(metrics.recentRequests.length).toBe(0);
  });

  it('should accurately record HTTP requests and calculate latency percentiles', () => {
    service.recordRequest('GET', '/notes', 200, 10);
    service.recordRequest('POST', '/notes', 201, 30);
    service.recordRequest('GET', '/notes/1', 404, 50);

    const metrics = service.getMetrics();
    expect(metrics.http.totalRequests).toBe(3);
    expect(metrics.http.statusCodes['2xx']).toBe(2);
    expect(metrics.http.statusCodes['4xx']).toBe(1);
    expect(metrics.http.latencyMs.avg).toBe(30);
    expect(metrics.http.latencyMs.p50).toBe(30);
    expect(metrics.recentRequests.length).toBe(3);
    expect(metrics.recentRequests[0].url).toBe('/notes/1');
  });

  it('should report system memory and uptime', () => {
    const metrics = service.getMetrics();
    expect(metrics.system.memoryMb.rss).toBeGreaterThan(0);
    expect(metrics.system.memoryMb.heapUsed).toBeGreaterThan(0);
    expect(metrics.uptimeSeconds).toBeGreaterThanOrEqual(0);
  });
});
