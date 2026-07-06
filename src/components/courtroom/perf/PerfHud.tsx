import { useEffect, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';

/**
 * In-Canvas performance HUD. Reads real renderer stats straight off
 * `gl.info` every frame (draw calls / triangles / geometries / textures)
 * plus an FPS estimate from the frame delta.
 *
 * Hidden by default — press 'P' to toggle. While hidden, the useFrame
 * sampling is skipped entirely (early return), and nothing is rendered.
 *
 * React state is only touched a few times a second (throttled flush) so
 * this never causes a 60fps re-render storm; the per-frame sampling
 * writes into a plain mutable ref instead.
 */

const FLUSH_INTERVAL_MS = 250; // ~4x/second

interface PerfStats {
  fps: number;
  calls: number;
  triangles: number;
  geometries: number;
  textures: number;
}

const ZERO_STATS: PerfStats = { fps: 0, calls: 0, triangles: 0, geometries: 0, textures: 0 };

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}m`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return `${n}`;
}

export function PerfHud() {
  const gl = useThree((s) => s.gl);
  const [visible, setVisible] = useState(false);
  const [stats, setStats] = useState<PerfStats>(ZERO_STATS);

  // Per-frame scratch space. Mutated in place inside useFrame so sampling
  // never allocates; only the throttled flush below creates a new object.
  const sampleRef = useRef<PerfStats>({ ...ZERO_STATS });
  const lastFlushRef = useRef(0);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'p' || e.key === 'P') && !e.metaKey && !e.ctrlKey && !e.altKey) {
        setVisible((v) => !v);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useFrame((_state, delta) => {
    if (!visible) return; // skip all sampling work while hidden

    const info = gl.info; // autoReset is true, so calls/triangles are this frame's
    const sample = sampleRef.current;
    sample.fps = delta > 0 ? 1 / delta : sample.fps;
    sample.calls = info.render.calls;
    sample.triangles = info.render.triangles;
    sample.geometries = info.memory.geometries;
    sample.textures = info.memory.textures;

    const now = performance.now();
    if (now - lastFlushRef.current >= FLUSH_INTERVAL_MS) {
      lastFlushRef.current = now;
      setStats({
        fps: sample.fps,
        calls: sample.calls,
        triangles: sample.triangles,
        geometries: sample.geometries,
        textures: sample.textures,
      });
    }
  });

  if (!visible) return null;

  return (
    <Html fullscreen zIndexRange={[1000, 0]} style={{ pointerEvents: 'none' }}>
      <div
        style={{
          position: 'absolute',
          top: 8,
          right: 8,
          padding: '6px 10px',
          background: 'rgba(0, 0, 0, 0.65)',
          color: '#e5e5e5',
          fontFamily: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace',
          fontSize: 11,
          lineHeight: 1.6,
          borderRadius: 4,
          whiteSpace: 'pre',
          userSelect: 'none',
        }}
      >
        {`FPS        ${stats.fps.toFixed(0)}
Calls      ${stats.calls}
Triangles  ${formatCount(stats.triangles)}
Geometries ${stats.geometries}
Textures   ${stats.textures}`}
      </div>
    </Html>
  );
}
