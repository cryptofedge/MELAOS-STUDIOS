'use client';
import { useEffect, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';

// Real waveform rendering via WaveSurfer.js (BSD-3-Clause, github.com/katspaugh/wavesurfer.js,
// 10k+ stars) — the standard open-source library for this, used instead of
// hand-rolling waveform math. Binds to our *existing* <audio> element via the
// `media` option, so playback, seeking, the analyser-driven level meters, and
// the watermarking pipeline are untouched — WaveSurfer only renders the real
// decoded waveform and provides a synced, click-to-seek playhead.
export default function StudioWaveform({
  audioEl,
  audioUrl,
  color,
  height = 64,
  onReady,
}: {
  audioEl: HTMLAudioElement | null;
  audioUrl: string | null;
  color: string;
  height?: number;
  onReady?: (ws: WaveSurfer | null) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WaveSurfer | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !audioEl || !audioUrl) return;

    let ws: WaveSurfer | null = null;
    let created = false;

    const create = () => {
      if (created || !containerRef.current) return;
      created = true;
      ws = WaveSurfer.create({
        container: containerRef.current,
        media: audioEl,
        url: audioUrl,
        waveColor: `${color}66`,
        progressColor: color,
        cursorColor: '#FF2D78',
        cursorWidth: 2,
        height,
        barWidth: 2,
        barGap: 1,
        barRadius: 2,
        normalize: true,
        interact: true,
      });
      wsRef.current = ws;
      onReady?.(ws);
    };

    // WaveSurfer measures the container's width at creation time and won't
    // pick up a later layout pass on its own — inside conditionally-mounted
    // or CSS-hidden tab content, the container can be zero-width on the
    // frame it's attached. A ResizeObserver defers creation until it
    // genuinely has a non-zero size, self-healing regardless of when that
    // happens (immediately, or after a tab switch makes it visible).
    if (container.clientWidth > 0) {
      create();
    } else {
      const ro = new ResizeObserver(entries => {
        if (entries[0]?.contentRect.width > 0) {
          create();
          ro.disconnect();
        }
      });
      ro.observe(container);
      return () => { ro.disconnect(); ws?.destroy(); wsRef.current = null; onReady?.(null); };
    }

    return () => { ws?.destroy(); wsRef.current = null; onReady?.(null); };
  }, [audioEl, audioUrl, color, height]);

  if (!audioEl || !audioUrl) {
    return (
      <div className="w-full flex items-center justify-center text-[10px] font-mono tracking-widest uppercase"
        style={{ height, color: '#333355' }}>
        Generate a track to see its real waveform
      </div>
    );
  }

  return <div ref={containerRef} className="w-full" />;
}
