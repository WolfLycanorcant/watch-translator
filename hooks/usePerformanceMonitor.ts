import { useEffect, useRef, useCallback } from 'react';

interface PerformanceMetrics {
  renderTime: number;
  memoryUsage?: number;
  componentName: string;
}

interface PerformanceMonitorOptions {
  enabled?: boolean;
  threshold?: number; // ms
  onSlowRender?: (metrics: PerformanceMetrics) => void;
}

export function usePerformanceMonitor(
  componentName: string,
  options: PerformanceMonitorOptions = {}
) {
  const {
    enabled = __DEV__,
    threshold = 16, // 60fps = 16.67ms per frame
    onSlowRender,
  } = options;

  const renderStartTime = useRef<number>(0);
  const renderCount = useRef<number>(0);
  const slowRenderCount = useRef<number>(0);

  const startRender = useCallback(() => {
    if (!enabled) return;
    renderStartTime.current = performance.now();
  }, [enabled]);

  const endRender = useCallback(() => {
    if (!enabled || renderStartTime.current === 0) return;

    const renderTime = performance.now() - renderStartTime.current;
    renderCount.current += 1;

    if (renderTime > threshold) {
      slowRenderCount.current += 1;
      
      const metrics: PerformanceMetrics = {
        renderTime,
        componentName,
      };

      // Add memory usage if available
      if ('memory' in performance) {
        metrics.memoryUsage = (performance as any).memory.usedJSHeapSize;
      }

      console.warn(
        `Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`
      );

      onSlowRender?.(metrics);
    }

    renderStartTime.current = 0;
  }, [enabled, threshold, componentName, onSlowRender]);

  const getStats = useCallback(() => {
    return {
      totalRenders: renderCount.current,
      slowRenders: slowRenderCount.current,
      slowRenderPercentage: renderCount.current > 0 
        ? (slowRenderCount.current / renderCount.current) * 100 
        : 0,
    };
  }, []);

  // Log stats periodically in development
  useEffect(() => {
    if (!enabled) return;

    const interval = setInterval(() => {
      const stats = getStats();
      if (stats.totalRenders > 0) {
        console.log(`Performance stats for ${componentName}:`, stats);
      }
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [enabled, componentName, getStats]);

  return {
    startRender,
    endRender,
    getStats,
  };
}

// Hook for monitoring memory usage
export function useMemoryMonitor(intervalMs: number = 5000) {
  const memoryUsage = useRef<number[]>([]);

  useEffect(() => {
    if (!__DEV__ || !('memory' in performance)) return;

    const interval = setInterval(() => {
      const memory = (performance as any).memory;
      const usedMB = memory.usedJSHeapSize / 1024 / 1024;
      
      memoryUsage.current.push(usedMB);
      
      // Keep only last 20 measurements
      if (memoryUsage.current.length > 20) {
        memoryUsage.current.shift();
      }

      // Warn if memory usage is growing consistently
      if (memoryUsage.current.length >= 5) {
        const recent = memoryUsage.current.slice(-5);
        const isGrowing = recent.every((val, i) => i === 0 || val > recent[i - 1]);
        
        if (isGrowing && usedMB > 50) { // 50MB threshold
          console.warn(`Memory usage growing: ${usedMB.toFixed(2)}MB`);
        }
      }
    }, intervalMs);

    return () => clearInterval(interval);
  }, [intervalMs]);

  return {
    getCurrentMemoryUsage: () => {
      if ('memory' in performance) {
        return (performance as any).memory.usedJSHeapSize / 1024 / 1024;
      }
      return null;
    },
    getMemoryHistory: () => [...memoryUsage.current],
  };
}
