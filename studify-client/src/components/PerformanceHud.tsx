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
    let status: 'good' | 'needs-improvement' | 'poor' = 'good';
    if (metric === 'lcp') {
      status = val <= 2500 ? 'good' : val <= 4000 ? 'needs-improvement' : 'poor';
    } else if (metric === 'inp') {
      status = val <= 200 ? 'good' : val <= 500 ? 'needs-improvement' : 'poor';
    } else if (metric === 'cls') {
      status = val <= 0.1 ? 'good' : val <= 0.25 ? 'needs-improvement' : 'poor';
    } else if (metric === 'fcp') {
      status = val <= 1800 ? 'good' : val <= 3000 ? 'needs-improvement' : 'poor';
    } else if (metric === 'ttfb') {
      status = val <= 800 ? 'good' : val <= 1800 ? 'needs-improvement' : 'poor';
    }

    if (status === 'good') return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60';
    if (status === 'needs-improvement') return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60';
    return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/60';
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 font-mono text-xs shadow-xl rounded-xl border border-sky-300 dark:border-sky-800 bg-[var(--bg-surface-elevated)] overflow-hidden transition-all" data-testid="perf-hud">
      <div
        className="flex items-center justify-between px-3.5 py-2 bg-[var(--bg-surface-subtle)] border-b border-[var(--border-subtle)] cursor-pointer gap-3 hover:bg-sky-50 dark:hover:bg-sky-950/40 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-1.5 font-bold text-sky-600 dark:text-sky-400">
          <Activity size={14} />
          <span>Dev HUD: Web Vitals</span>
        </div>
        {isOpen ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
      </div>

      {isOpen && (
        <div className="p-3.5 grid grid-cols-2 gap-x-5 gap-y-2">
          <div className="flex justify-between items-center gap-2">
            <span className="text-[var(--text-muted)]">LCP:</span>
            <span className={`font-bold px-1.5 py-0.5 rounded ${getStatusClass('lcp', vitals.lcp)}`}>
              {vitals.lcp !== undefined ? `${vitals.lcp}ms` : 'waiting...'}
            </span>
          </div>

          <div className="flex justify-between items-center gap-2">
            <span className="text-[var(--text-muted)]">INP:</span>
            <span className={`font-bold px-1.5 py-0.5 rounded ${getStatusClass('inp', vitals.inp)}`}>
              {vitals.inp !== undefined ? `${vitals.inp}ms` : 'waiting...'}
            </span>
          </div>

          <div className="flex justify-between items-center gap-2">
            <span className="text-[var(--text-muted)]">CLS:</span>
            <span className={`font-bold px-1.5 py-0.5 rounded ${getStatusClass('cls', vitals.cls)}`}>
              {vitals.cls !== undefined ? vitals.cls : '0'}
            </span>
          </div>

          <div className="flex justify-between items-center gap-2">
            <span className="text-[var(--text-muted)]">FCP:</span>
            <span className={`font-bold px-1.5 py-0.5 rounded ${getStatusClass('fcp', vitals.fcp)}`}>
              {vitals.fcp !== undefined ? `${vitals.fcp}ms` : 'measuring'}
            </span>
          </div>

          <div className="flex justify-between items-center gap-2">
            <span className="text-[var(--text-muted)]">TTFB:</span>
            <span className={`font-bold px-1.5 py-0.5 rounded ${getStatusClass('ttfb', vitals.ttfb)}`}>
              {vitals.ttfb !== undefined ? `${vitals.ttfb}ms` : 'measuring'}
            </span>
          </div>

          <div className="flex justify-between items-center gap-2">
            <span className="text-[var(--text-muted)] flex items-center gap-1">
              <Server size={11} /> API:
            </span>
            <span className={`font-bold px-1.5 py-0.5 rounded ${backendLatency ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60' : 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60'}`}>
              {backendLatency !== null ? `${backendLatency}ms` : 'offline'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
