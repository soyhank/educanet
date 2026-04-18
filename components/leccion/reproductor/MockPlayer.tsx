"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Maximize,
} from "lucide-react";
import { cn } from "@/lib/utils";

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function MockPlayer({
  duracionSegundos,
  porcentajeInicial,
  onProgreso,
  onCompletar,
}: {
  duracionSegundos: number;
  porcentajeInicial: number;
  onProgreso: (porcentaje: number) => void;
  onCompletar: () => void;
}) {
  const dur = Math.max(duracionSegundos, 30);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(
    (porcentajeInicial / 100) * dur
  );
  const [speed, setSpeed] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const completedRef = useRef(false);

  const pct = Math.min(100, (currentTime / dur) * 100);

  // Playback simulation
  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          const next = prev + speed;
          if (next >= dur) {
            setPlaying(false);
            if (!completedRef.current) {
              completedRef.current = true;
              onCompletar();
            }
            return dur;
          }
          return next;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [playing, speed, dur, onCompletar]);

  // Report progress every 5s
  useEffect(() => {
    const timer = setInterval(() => {
      if (playing) {
        onProgreso(pct);
      }
    }, 5000);
    return () => clearInterval(timer);
  }, [playing, pct, onProgreso]);

  // Auto-hide controls
  const resetHideTimer = useCallback(() => {
    setShowControls(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    if (playing) {
      hideTimer.current = setTimeout(() => setShowControls(false), 3000);
    }
  }, [playing]);

  const togglePlay = () => {
    setPlaying((p) => !p);
    resetHideTimer();
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const newTime = x * dur;
    setCurrentTime(newTime);
    onProgreso((newTime / dur) * 100);
  };

  const skip = (delta: number) => {
    setCurrentTime((prev) => Math.max(0, Math.min(dur, prev + delta)));
    resetHideTimer();
  };

  const speeds = [0.5, 1, 1.25, 1.5, 2];
  const nextSpeed = () => {
    const idx = speeds.indexOf(speed);
    setSpeed(speeds[(idx + 1) % speeds.length]);
  };

  return (
    <div
      className="relative aspect-video overflow-hidden rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 select-none"
      onMouseMove={resetHideTimer}
      onClick={togglePlay}
    >
      {/* Center play/pause */}
      {!playing && (
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/90 text-white shadow-lg transition-transform hover:scale-110"
            onClick={(e) => { e.stopPropagation(); togglePlay(); }}
          >
            <Play className="h-8 w-8 ml-1" />
          </button>
        </div>
      )}

      {/* Demo text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <p className="text-white/30 text-sm text-center px-8">
          Video de demostracion — Bunny Stream se conectara con tus credenciales
        </p>
      </div>

      {/* Controls overlay */}
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-4 pb-3 pt-8 transition-opacity",
          showControls || !playing ? "opacity-100" : "opacity-0"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress bar */}
        <div
          className="group mb-3 h-1 cursor-pointer rounded-full bg-white/20 transition-all hover:h-2"
          onClick={seek}
        >
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>

        {/* Control buttons */}
        <div className="flex items-center gap-3 text-white">
          <button onClick={togglePlay} aria-label={playing ? "Pausar" : "Reproducir"}>
            {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </button>
          <button onClick={() => skip(-10)} aria-label="Retroceder 10s">
            <SkipBack className="h-4 w-4" />
          </button>
          <button onClick={() => skip(10)} aria-label="Avanzar 10s">
            <SkipForward className="h-4 w-4" />
          </button>

          <span className="text-xs tabular-nums">
            {formatTime(currentTime)} / {formatTime(dur)}
          </span>

          <div className="flex-1" />

          <button onClick={nextSpeed} className="text-xs font-medium px-1.5 py-0.5 rounded bg-white/10">
            {speed}x
          </button>
          <Volume2 className="h-4 w-4 opacity-60" />
          <Maximize className="h-4 w-4 opacity-60" />
        </div>
      </div>
    </div>
  );
}
