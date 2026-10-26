'use client';

import React, { useEffect, useState, Component, ErrorInfo, ReactNode } from 'react';
import { Canvas } from '@react-three/fiber';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { AdaptiveDpr, AdaptiveEvents } from '@react-three/drei';
import { useUniverseStore } from '@/lib/store/useUniverseStore';
import { CelestialBackground } from './CelestialBackground';
import { ArtistPlanet } from './ArtistPlanet';
import { YouTubeUniverse } from './YouTubeUniverse';
import { UniverseCameraManager } from './UniverseCameraManager';
import { ConstellationLines } from './ConstellationLines';

class WebGLErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('WebGL/Three.js render error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-2xl mb-4 text-red-400">
            ⚠
          </div>
          <h3 className="text-xl font-bold text-white mb-2">3D Acceleration Unavailable</h3>
          <p className="text-sm text-slate-400 max-w-md mb-4">
            Your browser or device was unable to initialize WebGL hardware acceleration.
            You can still explore your listening history and stats on the Analytics page.
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-sm transition-all"
          >
            Retry WebGL Engine
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Filter benign internal R3F THREE.Clock deprecation warning emitted in Three.js r183+
if (typeof window !== 'undefined') {
  const originalWarn = console.warn;
  console.warn = (...args: unknown[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('THREE.Clock: This module has been deprecated')
    ) {
      return;
    }
    originalWarn.apply(console, args);
  };
}

export function UniverseCanvas() {
  const {
    artists,
    mode,
    metricMode,
    graphicsQuality,
    reducedMotion,
    showLabels,
    clearSelection,
  } = useUniverseStore();

  const mounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        clearSelection();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [clearSelection]);

  if (!mounted) {
    return (
      <div className="w-full h-full bg-[#030712] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin" />
          <span className="text-xs text-slate-400 font-mono tracking-wider uppercase">
            Igniting Cosmic Engines...
          </span>
        </div>
      </div>
    );
  }

  // Artists dynamically filtered and scaled for the active time window
  const filteredArtists = artists.filter((artist) => artist.totalPlays > 0);

  const particleCount =
    graphicsQuality === 'ultra' ? 3600 : graphicsQuality === 'high' ? 2600 : graphicsQuality === 'medium' ? 1600 : 800;

  return (
    <div className="w-full h-full relative overflow-hidden bg-[#030712]">
      <WebGLErrorBoundary>
        <Canvas
          camera={{ position: [0, 45, 95], fov: 50, near: 0.1, far: 1000 }}
          dpr={graphicsQuality === 'ultra' ? [1, 2] : graphicsQuality === 'low' ? [1, 1] : [1, 1.5]}
          performance={{ min: 0.6 }}
          gl={{
            antialias: graphicsQuality === 'low',
            alpha: false,
            powerPreference: 'high-performance',
            stencil: false,
            depth: true,
          }}
          className="w-full h-full cursor-grab active:cursor-grabbing"
        >
          {/* Adaptive Performance Monitors */}
          <AdaptiveDpr pixelated={false} />
          <AdaptiveEvents />

          {/* Cosmic Illumination */}
          <ambientLight intensity={0.5} />
          <directionalLight position={[60, 80, 50]} intensity={1.8} color="#e0e7ff" />
          <pointLight position={[-40, -30, -50]} intensity={1.2} color="#06b6d4" />
          <pointLight position={[50, -20, 60]} intensity={1.2} color="#ec4899" />
          <pointLight position={[0, 40, 0]} intensity={0.6} color="#818cf8" />

          {/* Dynamic Celestial Environment */}
          <CelestialBackground
            reducedMotion={reducedMotion}
            particleCount={particleCount}
          />

          {/* Interactive Universe Modes */}
          {mode === 'music' ? (
            <group>
              {/* Constellation Network */}
              <ConstellationLines
                artists={filteredArtists}
                reducedMotion={reducedMotion}
              />

              {/* Artist Celestial Bodies */}
              {filteredArtists.map((artist) => (
                <ArtistPlanet
                  key={artist.id}
                  artist={artist}
                  metricMode={metricMode}
                  reducedMotion={reducedMotion}
                  showLabels={showLabels}
                />
              ))}
            </group>
          ) : (
            <YouTubeUniverse />
          )}

          {/* Camera Navigator with Smooth Inertia */}
          <UniverseCameraManager />

          {/* Cinematic Bloom & Glow Postprocessing */}
          {graphicsQuality !== 'low' && (
            <EffectComposer multisampling={graphicsQuality === 'ultra' ? 4 : 2}>
              <Bloom
                luminanceThreshold={0.25}
                luminanceSmoothing={0.9}
                intensity={1.2}
                mipmapBlur
              />
              <Vignette
                eskil={false}
                offset={0.15}
                darkness={1.1}
              />
            </EffectComposer>
          )}
        </Canvas>
      </WebGLErrorBoundary>
    </div>
  );
}
