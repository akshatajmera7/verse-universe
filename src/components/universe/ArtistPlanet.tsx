'use client';

import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Float, Sparkles, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { ArtistEntity } from '@/types';
import { useUniverseStore } from '@/lib/store/useUniverseStore';
import { SongStar } from './SongStar';

interface ArtistPlanetProps {
  artist: ArtistEntity;
  metricMode: 'plays' | 'duration';
  reducedMotion?: boolean;
  showLabels?: boolean;
}

export function ArtistPlanet({
  artist,
  metricMode,
  reducedMotion = false,
  showLabels = true,
}: ArtistPlanetProps) {
  const planetRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const { selectedObject, selectObject, setFocusedTarget } = useUniverseStore();
  const isSelected = selectedObject?.type === 'artist' && selectedObject.data.id === artist.id;

  // Position
  const pos = artist.position || [0, 0, 0];

  // Dynamic Size calculation based on metric
  const calculatedSize =
    metricMode === 'plays'
      ? Math.min(4.8, Math.max(1.1, Math.log10(artist.totalPlays + 1) * 1.8))
      : Math.min(5.0, Math.max(1.1, Math.log10((artist.estDurationSeconds / 60) + 1) * 1.5));

  const planetSize = hovered || isSelected ? calculatedSize * 1.2 : calculatedSize;

  // Planet color
  const baseColor = artist.color || '#06b6d4';
  const planetColor = new THREE.Color(baseColor);

  useFrame((state, delta) => {
    if (!reducedMotion) {
      const time = state.clock.getElapsedTime();

      // Smooth rotation
      if (planetRef.current) {
        planetRef.current.rotation.y += delta * 0.35;
      }

      // Breathing corona aura
      if (atmosphereRef.current) {
        const pulse = 1.15 + Math.sin(time * 2.5 + (pos[0] || 0)) * 0.06;
        atmosphereRef.current.scale.set(pulse, pulse, pulse);
        atmosphereRef.current.rotation.y -= delta * 0.15;
      }

      // Concentric rings counter-rotation
      if (ring1Ref.current) {
        ring1Ref.current.rotation.z += delta * 0.2;
      }
      if (ring2Ref.current) {
        ring2Ref.current.rotation.z -= delta * 0.12;
      }
    }
  });

  const handleClick = (e: any) => {
    e.stopPropagation();
    selectObject({ type: 'artist', data: artist });
    setFocusedTarget([pos[0], pos[1], pos[2]]);
  };

  // Top tracks to render as orbiting stars (up to 5 for clean aesthetics)
  const tracksToRender = (artist.topTracks || []).slice(0, 5);

  return (
    <group position={pos}>
      <Float
        speed={reducedMotion ? 0 : 1.5}
        rotationIntensity={reducedMotion ? 0 : 0.4}
        floatIntensity={reducedMotion ? 0 : 0.8}
        floatingRange={[-0.3, 0.3]}
      >
        {/* Shimmering Stardust Cloud around the Artist */}
        {!reducedMotion && (
          <Sparkles
            count={hovered || isSelected ? 35 : 18}
            scale={planetSize * 3.2}
            size={hovered || isSelected ? 3.5 : 2.0}
            speed={0.4}
            color={baseColor}
            opacity={0.7}
          />
        )}

        {/* Central Planet Core with Living Audio-Reactive Distortion */}
        <mesh
          ref={planetRef}
          onClick={handleClick}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHovered(true);
          }}
          onPointerOut={() => setHovered(false)}
        >
          <sphereGeometry args={[planetSize, 48, 48]} />
          <MeshDistortMaterial
            color={planetColor}
            emissive={planetColor}
            emissiveIntensity={hovered || isSelected ? 1.4 : 0.55}
            roughness={0.25}
            metalness={0.7}
            distort={hovered || isSelected ? 0.35 : 0.18}
            speed={hovered || isSelected ? 3.0 : 1.5}
          />
        </mesh>

        {/* Volumetric Corona / Atmospheric Glow Shell */}
        <mesh ref={atmosphereRef} scale={[1.18, 1.18, 1.18]}>
          <sphereGeometry args={[planetSize, 32, 32]} />
          <meshBasicMaterial
            color={planetColor}
            transparent
            opacity={hovered || isSelected ? 0.4 : 0.22}
            side={THREE.BackSide}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        {/* Primary Planetary Ring */}
        {artist.totalPlays >= 3 && (
          <mesh ref={ring1Ref} rotation={[Math.PI / 3, 0.2, 0]}>
            <ringGeometry args={[planetSize * 1.4, planetSize * 1.85, 64]} />
            <meshBasicMaterial
              color={planetColor}
              transparent
              opacity={hovered || isSelected ? 0.55 : 0.35}
              side={THREE.DoubleSide}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        )}

        {/* Secondary Outer Thin Ring for High-Play Stars */}
        {artist.totalPlays >= 6 && (
          <mesh ref={ring2Ref} rotation={[Math.PI / 3.4, -0.15, 0]}>
            <ringGeometry args={[planetSize * 2.0, planetSize * 2.15, 64]} />
            <meshBasicMaterial
              color="#ffffff"
              transparent
              opacity={hovered || isSelected ? 0.4 : 0.2}
              side={THREE.DoubleSide}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        )}

        {/* Orbiting Song Stars */}
        {tracksToRender.map((song, idx) => {
          const orbitRadius = planetSize * 2.4 + idx * 1.5;
          const orbitSpeed = 0.4 / (1 + idx * 0.25);
          return (
            <SongStar
              key={song.id || idx}
              song={song}
              orbitRadius={orbitRadius}
              orbitSpeed={orbitSpeed}
              starColor={baseColor}
              reducedMotion={reducedMotion}
              showLabels={showLabels}
            />
          );
        })}

        {/* Planet Floating Label */}
        {(showLabels || hovered || isSelected) && (
          <Html
            position={[0, planetSize + 1.3, 0]}
            center
            distanceFactor={45}
            style={{ pointerEvents: 'none' }}
          >
            <div
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-300 border flex items-center gap-1.5 shadow-2xl backdrop-blur-md ${
                isSelected
                  ? 'bg-cyan-400 text-black font-bold border-white scale-110 shadow-cyan-500/50'
                  : hovered
                  ? 'bg-slate-900/95 text-cyan-200 border-cyan-400/80 scale-105 shadow-cyan-500/30'
                  : 'bg-slate-950/80 text-slate-200 border-white/20'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full inline-block animate-pulse"
                style={{ backgroundColor: baseColor }}
              />
              <span className="font-semibold tracking-wide">{artist.name}</span>
              <span className="opacity-70 text-[10px] font-mono">
                {metricMode === 'plays'
                  ? `${artist.totalPlays} plays`
                  : `~${Math.round(artist.estDurationSeconds / 60)}m`}
              </span>
            </div>
          </Html>
        )}
      </Float>
    </group>
  );
}
