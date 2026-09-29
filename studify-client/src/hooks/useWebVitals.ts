import { useState, useEffect } from 'react';
import { onCLS, onINP, onLCP, onFCP, onTTFB, type Metric } from 'web-vitals';

export interface VitalsState {
  lcp?: number;
  inp?: number;
  cls?: number;
  fcp?: number;
  ttfb?: number;
}

export function useWebVitals() {
  const [vitals, setVitals] = useState<VitalsState>({});

  useEffect(() => {
    const handleMetric = (metric: Metric) => {
      setVitals((prev) => ({
        ...prev,
        [metric.name.toLowerCase()]: Math.round(metric.value * 100) / 100,
      }));
    };

    onCLS(handleMetric);
    onINP(handleMetric);
    onLCP(handleMetric);
    onFCP(handleMetric);
    onTTFB(handleMetric);
  }, []);

  return vitals;
}
