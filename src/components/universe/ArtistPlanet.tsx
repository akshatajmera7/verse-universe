'use client';

import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard, Text, Float, Sparkles, MeshDistortMaterial } from '@react-three/drei';
import type { ThreeEvent } from '@react-three/fiber';
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
  const planetColor = useMemo(() => new THREE.Color(baseColor), [baseColor]);

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

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
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
            count={hovered || isSelected ? 30 : 14}
            scale={planetSize * 3.0}
            size={hovered || isSelected ? 3.0 : 1.8}
            speed={0.4}
            color={baseColor}
            opacity={0.65}
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
          <sphereGeometry args={[planetSize, hovered || isSelected ? 32 : 22, hovered || isSelected ? 32 : 22]} />
          <MeshDistortMaterial
            color={planetColor}
            emissive={planetColor}
            emissiveIntensity={hovered || isSelected ? 1.4 : 0.5}
            roughness={0.25}
            metalness={0.7}
            distort={hovered || isSelected ? 0.32 : 0.08}
            speed={hovered || isSelected ? 2.5 : 0.8}
          />
        </mesh>

        {/* Volumetric Corona / Atmospheric Glow Shell */}
        <mesh ref={atmosphereRef} scale={[1.18, 1.18, 1.18]}>
          <sphereGeometry args={[planetSize, 16, 16]} />
          <meshBasicMaterial
            color={planetColor}
            transparent
            opacity={hovered || isSelected ? 0.4 : 0.2}
            side={THREE.BackSide}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        {/* Primary Planetary Ring */}
        {artist.totalPlays >= 3 && (
          <mesh ref={ring1Ref} rotation={[Math.PI / 3, 0.2, 0]}>
            <ringGeometry args={[planetSize * 1.4, planetSize * 1.85, 36]} />
            <meshBasicMaterial
              color={planetColor}
              transparent
              opacity={hovered || isSelected ? 0.55 : 0.3}
              side={THREE.DoubleSide}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        )}

        {/* Secondary Outer Thin Ring for High-Play Stars */}
        {artist.totalPlays >= 6 && (
          <mesh ref={ring2Ref} rotation={[Math.PI / 3.4, -0.15, 0]}>
            <ringGeometry args={[planetSize * 2.0, planetSize * 2.15, 36]} />
            <meshBasicMaterial
              color="#ffffff"
              transparent
              opacity={hovered || isSelected ? 0.4 : 0.18}
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

        {/* Planet Floating 3D Billboard Label */}
        {(showLabels || hovered || isSelected) && (
          <Billboard position={[0, planetSize + 1.2, 0]}>
            <Text
              position={[0, 0.4, 0]}
              fontSize={0.85}
              color={isSelected ? '#22d3ee' : hovered ? '#ffffff' : '#f1f5f9'}
              anchorX="center"
              anchorY="middle"
              outlineWidth={0.07}
              outlineColor="#030712"
              fontWeight={700}
            >
              {artist.name}
            </Text>
            <Text
              position={[0, -0.4, 0]}
              fontSize={0.52}
              color={isSelected ? '#67e8f9' : '#94a3b8'}
              anchorX="center"
              anchorY="middle"
              outlineWidth={0.04}
              outlineColor="#030712"
            >
              {metricMode === 'plays'
                ? `${artist.totalPlays} plays`
                : `~${Math.round(artist.estDurationSeconds / 60)}m`}
            </Text>
          </Billboard>
        )}
      </Float>
    </group>
  );
}
