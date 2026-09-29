# 05 — Performance Engineering: Backend Metrics & Frontend Web Vitals

Welcome to part 5 of our study series! In this guide, we explore how professional engineering teams measure and optimize performance across both backend servers and frontend browsers.

---

## 1. Why Averages Lie: The Importance of Percentiles

When measuring API response times, looking only at the **average (mean)** is dangerous:
- Imagine 99 requests take 10ms, but 1 request gets blocked for 5,000ms.
- The average is ~60ms. It looks acceptable, but 1 in 100 users suffered a terrible 5-second freeze!

### The Solution: Latency Percentiles
- **p50 (Median)**: The middle value. 50% of your users experience this speed or faster.
- **p95**: 95% of requests completed faster than this threshold. Represents standard user experience.
- **p99 (The Tail)**: 99% of requests were faster. Catches edge-case slowdowns (e.g. database locks, cold starts, garbage collection pauses).

In Studify's `MetricsService`, we compute `p50`, `p95`, and `p99` dynamically on rolling request windows.

---

## 2. Server-Timing: Bridging Backend to Frontend

Browsers have a powerful, built-in W3C standard header called `Server-Timing`:
```http
Server-Timing: app;dur=4.25
```
By emitting this header in our NestJS `PerformanceInterceptor`:
1. Open Chrome/Firefox DevTools -> Network tab.
2. Click any request to `/notes`.
3. In the "Timing" sub-tab, you will see a dedicated row showing exactly how many milliseconds the NestJS server spent processing the request!

---

## 3. Core Web Vitals (Frontend Observability)

Google established **Core Web Vitals** as the industry standard to quantify user experience on the web:

| Metric | What It Measures | Target |
| :--- | :--- | :--- |
| **LCP** (Largest Contentful Paint) | How long until the main content is visible on screen | < 2.5s |
| **INP** (Interaction to Next Paint) | How quickly the interface responds after clicking/typing | < 200ms |
| **CLS** (Cumulative Layout Shift) | Visual stability (whether elements jump around while loading) | < 0.1 |
| **FCP** (First Contentful Paint) | Time until the browser renders any text/image | < 1.8s |
| **TTFB** (Time to First Byte) | Time waiting for the server to send the first byte of HTML | < 800ms |

### The In-App Performance HUD
In Studify, we integrate the official `web-vitals` library and display an interactive Developer HUD in the corner of the screen so you can observe your real-time vital scores while you study.
