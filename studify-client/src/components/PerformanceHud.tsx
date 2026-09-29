import { useState, useEffect, type FC } from 'react';
import { Activity, ChevronDown, ChevronUp, Server } from 'lucide-react';
import { useWebVitals } from '../hooks/useWebVitals';

export const PerformanceHud: FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const vitals = useWebVitals();
  const [backendLatency, setBackendLatency] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;
    const checkBackend = async () => {
      try {
        const start = performance.now();
        const res = await fetch('http://localhost:3000/metrics');
        if (res.ok) {
          const duration = Math.round((performance.now() - start) * 10) / 10;
          if (isMounted) setBackendLatency(duration);
        }
      } catch {
        if (isMounted) setBackendLatency(null);
      }
    };

    checkBackend();
    const interval = setInterval(checkBackend, 10000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const getStatusClass = (metric: string, val?: number) => {
    if (val === undefined) return '';
    if (metric === 'lcp') {
      return val <= 2500 ? 'vital-good' : val <= 4000 ? 'vital-needs-improvement' : 'vital-poor';
    }
    if (metric === 'inp') {
      return val <= 200 ? 'vital-good' : val <= 500 ? 'vital-needs-improvement' : 'vital-poor';
    }
    if (metric === 'cls') {
      return val <= 0.1 ? 'vital-good' : val <= 0.25 ? 'vital-needs-improvement' : 'vital-poor';
    }
    if (metric === 'fcp') {
      return val <= 1800 ? 'vital-good' : val <= 3000 ? 'vital-needs-improvement' : 'vital-poor';
    }
    if (metric === 'ttfb') {
      return val <= 800 ? 'vital-good' : val <= 1800 ? 'vital-needs-improvement' : 'vital-poor';
    }
    return 'vital-good';
  };

  return (
    <div className="perf-hud" data-testid="perf-hud">
      <div className="perf-hud-header" onClick={() => setIsOpen(!isOpen)}>
        <div className="perf-hud-title">
          <Activity size={15} />
          <span>Dev HUD: Web Vitals</span>
        </div>
        {isOpen ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
      </div>

      {isOpen && (
        <div className="perf-hud-content">
          <div className="vital-item">
            <span className="vital-name">LCP:</span>
            <span className={`vital-value ${getStatusClass('lcp', vitals.lcp)}`}>
              {vitals.lcp !== undefined ? `${vitals.lcp}ms` : 'waiting...'}
            </span>
          </div>

          <div className="vital-item">
            <span className="vital-name">INP:</span>
            <span className={`vital-value ${getStatusClass('inp', vitals.inp)}`}>
              {vitals.inp !== undefined ? `${vitals.inp}ms` : 'waiting...'}
            </span>
          </div>

          <div className="vital-item">
            <span className="vital-name">CLS:</span>
            <span className={`vital-value ${getStatusClass('cls', vitals.cls)}`}>
              {vitals.cls !== undefined ? vitals.cls : '0'}
            </span>
          </div>

          <div className="vital-item">
            <span className="vital-name">FCP:</span>
            <span className={`vital-value ${getStatusClass('fcp', vitals.fcp)}`}>
              {vitals.fcp !== undefined ? `${vitals.fcp}ms` : 'measuring'}
            </span>
          </div>

          <div className="vital-item">
            <span className="vital-name">TTFB:</span>
            <span className={`vital-value ${getStatusClass('ttfb', vitals.ttfb)}`}>
              {vitals.ttfb !== undefined ? `${vitals.ttfb}ms` : 'measuring'}
            </span>
          </div>

          <div className="vital-item">
            <span className="vital-name" style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <Server size={11} /> API:
            </span>
            <span className={`vital-value ${backendLatency ? 'vital-good' : 'vital-needs-improvement'}`}>
              {backendLatency !== null ? `${backendLatency}ms` : 'offline'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
