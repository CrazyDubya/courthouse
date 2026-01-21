import { describe, it, expect, beforeEach } from 'vitest';
import { performanceMonitor } from '../utils/performanceMonitor';

describe('Performance Profiling', () => {
  beforeEach(() => {
    performanceMonitor.clear();
    performanceMonitor.setEnabled(true);
  });

  describe('Performance Monitor', () => {
    it('should track async operations', async () => {
      await performanceMonitor.measureAsync(
        'test-async',
        'llm',
        async () => {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      );

      const metrics = performanceMonitor.getMetrics();
      expect(metrics).toHaveLength(1);
      expect(metrics[0].name).toBe('test-async');
      expect(metrics[0].duration).toBeGreaterThan(90);
      expect(metrics[0].category).toBe('llm');
    });

    it('should track sync operations', () => {
      performanceMonitor.measureSync(
        'test-sync',
        'render',
        () => {
          let sum = 0;
          for (let i = 0; i < 1000000; i++) {
            sum += i;
          }
          return sum;
        }
      );

      const metrics = performanceMonitor.getMetrics();
      expect(metrics).toHaveLength(1);
      expect(metrics[0].name).toBe('test-sync');
      expect(metrics[0].category).toBe('render');
    });

    it('should generate performance report', async () => {
      // Add multiple metrics
      await performanceMonitor.measureAsync('llm-call-1', 'llm', 
        async () => await new Promise(resolve => setTimeout(resolve, 50)));
      await performanceMonitor.measureAsync('llm-call-2', 'llm', 
        async () => await new Promise(resolve => setTimeout(resolve, 100)));
      await performanceMonitor.measureAsync('llm-call-3', 'llm', 
        async () => await new Promise(resolve => setTimeout(resolve, 150)));
      
      performanceMonitor.measureSync('render-1', 'render', () => {});
      performanceMonitor.measureSync('render-2', 'render', () => {});

      const report = performanceMonitor.generateReport();
      
      expect(report.totalMetrics).toBe(5);
      expect(report.categories.llm.count).toBe(3);
      expect(report.categories.render.count).toBe(2);
      expect(report.categories.llm.avgDuration).toBeGreaterThan(0);
      expect(Array.isArray(report.recommendations)).toBe(true);
    });

    it('should identify slow operations', async () => {
      // Add a slow operation
      await performanceMonitor.measureAsync('slow-operation', 'engine',
        async () => await new Promise(resolve => setTimeout(resolve, 1500)));
      
      const report = performanceMonitor.generateReport();
      
      expect(report.slowestOperations.length).toBeGreaterThan(0);
      expect(report.slowestOperations[0].duration).toBeGreaterThan(1000);
    });

    it('should calculate percentiles correctly', async () => {
      // Add metrics with known distribution
      for (let i = 1; i <= 100; i++) {
        performanceMonitor.measureSync(`op-${i}`, 'engine', () => {
          // Simulate work proportional to i
          const start = performance.now();
          while (performance.now() - start < i / 10) {
            // Busy wait
          }
        });
      }

      const report = performanceMonitor.generateReport();
      const engine = report.categories.engine;
      
      expect(engine.p50).toBeLessThan(engine.p95);
      expect(engine.p95).toBeLessThan(engine.p99);
      expect(engine.minDuration).toBeLessThanOrEqual(engine.p50);
      expect(engine.maxDuration).toBeGreaterThanOrEqual(engine.p99);
    });

    it('should export to JSON', async () => {
      await performanceMonitor.measureAsync('test', 'llm', 
        async () => await new Promise(resolve => setTimeout(resolve, 10)));
      
      const json = performanceMonitor.exportToJSON();
      const data = JSON.parse(json);
      
      expect(data).toHaveProperty('metrics');
      expect(data).toHaveProperty('report');
      expect(data).toHaveProperty('timestamp');
      expect(Array.isArray(data.metrics)).toBe(true);
    });
  });

  describe('Performance Benchmarks', () => {
    it('should benchmark component rendering', () => {
      const iterations = 100;
      
      for (let i = 0; i < iterations; i++) {
        performanceMonitor.measureSync(`render-${i}`, 'render', () => {
          // Simulate component render
          const data = { items: Array(1000).fill(0).map((_, j) => ({ id: j, value: Math.random() })) };
          const filtered = data.items.filter(item => item.value > 0.5);
          const mapped = filtered.map(item => ({ ...item, processed: true }));
          return mapped.length;
        });
      }

      const report = performanceMonitor.generateReport();
      const render = report.categories.render;
      
      console.log('\n📊 Render Performance:');
      console.log(`  Average: ${render.avgDuration.toFixed(2)}ms`);
      console.log(`  P50: ${render.p50.toFixed(2)}ms`);
      console.log(`  P95: ${render.p95.toFixed(2)}ms`);
      console.log(`  P99: ${render.p99.toFixed(2)}ms`);
      
      // Check that rendering is fast enough for 60fps (16.67ms)
      expect(render.avgDuration).toBeLessThan(16.67);
    });

    it('should benchmark state updates', () => {
      const iterations = 50;
      
      for (let i = 0; i < iterations; i++) {
        performanceMonitor.measureSync(`state-update-${i}`, 'engine', () => {
          // Simulate state update
          const state = {
            participants: Array(10).fill(0).map((_, j) => ({
              id: `p-${j}`,
              name: `Participant ${j}`,
              role: 'witness',
              data: { score: Math.random() }
            })),
            transcript: Array(100).fill(0).map((_, j) => ({
              id: `t-${j}`,
              content: `Entry ${j}`,
              timestamp: Date.now()
            }))
          };
          
          // Update operation
          const updatedState = {
            ...state,
            participants: state.participants.map(p => ({
              ...p,
              data: { ...p.data, updated: true }
            }))
          };
          
          return updatedState;
        });
      }

      const report = performanceMonitor.generateReport();
      const engine = report.categories.engine;
      
      console.log('\n⚙️  State Update Performance:');
      console.log(`  Average: ${engine.avgDuration.toFixed(2)}ms`);
      console.log(`  P95: ${engine.p95.toFixed(2)}ms`);
      
      // State updates should be fast
      expect(engine.avgDuration).toBeLessThan(5);
    });

    it('should benchmark data serialization', () => {
      const iterations = 20;
      const largeObject = {
        case: {
          id: 'case-1',
          title: 'Large Case',
          participants: Array(50).fill(0).map((_, i) => ({
            id: `p-${i}`,
            name: `Participant ${i}`,
            role: 'witness',
            background: {
              education: 'High School',
              experience: '10 years',
              specialization: 'Expert witness'
            }
          })),
          transcript: Array(500).fill(0).map((_, i) => ({
            id: `t-${i}`,
            speaker: `Speaker ${i % 10}`,
            content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
            timestamp: Date.now()
          })),
          evidence: Array(30).fill(0).map((_, i) => ({
            id: `e-${i}`,
            title: `Evidence ${i}`,
            description: 'Detailed description of evidence item',
            type: 'document'
          }))
        }
      };
      
      for (let i = 0; i < iterations; i++) {
        performanceMonitor.measureSync(`serialize-${i}`, 'network', () => {
          return JSON.stringify(largeObject);
        });
        
        performanceMonitor.measureSync(`deserialize-${i}`, 'network', () => {
          const str = JSON.stringify(largeObject);
          return JSON.parse(str);
        });
      }

      const report = performanceMonitor.generateReport();
      const network = report.categories.network;
      
      console.log('\n🌐 Serialization Performance:');
      console.log(`  Average: ${network.avgDuration.toFixed(2)}ms`);
      console.log(`  P95: ${network.p95.toFixed(2)}ms`);
      
      // Serialization should be reasonable
      expect(network.avgDuration).toBeLessThan(50);
    });
  });

  describe('Performance Recommendations', () => {
    it('should generate recommendations for slow LLM calls', async () => {
      // Simulate slow LLM calls
      for (let i = 0; i < 5; i++) {
        await performanceMonitor.measureAsync(`llm-slow-${i}`, 'llm',
          async () => await new Promise(resolve => setTimeout(resolve, 2500)));
      }

      const report = performanceMonitor.generateReport();
      
      expect(report.recommendations.length).toBeGreaterThan(0);
      const llmRecommendations = report.recommendations.filter(r => 
        r.toLowerCase().includes('llm')
      );
      expect(llmRecommendations.length).toBeGreaterThan(0);
    }, 15000); // Increase timeout to accommodate slow simulations

    it('should generate recommendations for slow rendering', () => {
      // Simulate slow renders
      for (let i = 0; i < 10; i++) {
        performanceMonitor.measureSync(`render-slow-${i}`, 'render', () => {
          const start = performance.now();
          while (performance.now() - start < 20) {
            // Busy wait to simulate slow render
          }
        });
      }

      const report = performanceMonitor.generateReport();
      
      const renderRecommendations = report.recommendations.filter(r => 
        r.toLowerCase().includes('render')
      );
      expect(renderRecommendations.length).toBeGreaterThan(0);
    });
  });
});
