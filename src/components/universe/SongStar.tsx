'use client';

import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Trail } from '@react-three/drei';
import * as THREE from 'three';
import { SongEntity } from '@/types';
import { useUniverseStore } from '@/lib/store/useUniverseStore';

interface SongStarProps {
  song: SongEntity;
  orbitRadius: number;
  orbitSpeed: number;
  starColor: string;
  reducedMotion?: boolean;
  showLabels?: boolean;
}

export function SongStar({
  song,
  orbitRadius,
  orbitSpeed,
  starColor,
  reducedMotion = false,
  showLabels = true,
}: SongStarProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const angleRef = useRef(Math.random() * Math.PI * 2);

  const { selectedObject, selectObject, setFocusedTarget } = useUniverseStore();
  const isSelected = selectedObject?.type === 'song' && selectedObject.data.id === song.id;

  const starSize = Math.min(0.85, Math.max(0.35, Math.log10(song.totalPlays + 1) * 0.42));
  const activeColor = new THREE.Color(starColor);

  useFrame((state, delta) => {
    if (!reducedMotion) {
      angleRef.current += delta * orbitSpeed;
    }
    if (meshRef.current) {
      const x = Math.cos(angleRef.current) * orbitRadius;
      const z = Math.sin(angleRef.current) * orbitRadius;
      const y = Math.sin(angleRef.current * 2) * (orbitRadius * 0.18);
      meshRef.current.position.set(x, y, z);
      meshRef.current.rotation.y += delta * 1.8;

      if (glowRef.current) {
        const pulse = 1.3 + Math.sin(state.clock.getElapsedTime() * 4 + angleRef.current) * 0.2;
        glowRef.current.scale.set(pulse, pulse, pulse);
      }
    }
  });

  const handleClick = (e: any) => {
    e.stopPropagation();
    selectObject({ type: 'song', data: song });
    if (meshRef.current) {
      const worldPos = new THREE.Vector3();
      meshRef.current.getWorldPosition(worldPos);
      setFocusedTarget([worldPos.x, worldPos.y, worldPos.z]);
    }
  };

  return (
    <group>
      {/* Orbital Plane Ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[orbitRadius - 0.05, orbitRadius + 0.05, 64]} />
        <meshBasicMaterial
          color={starColor}
          transparent
          opacity={hovered || isSelected ? 0.4 : 0.09}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Orbiting Song Star with Luminous Trail */}
      <Trail
        width={hovered || isSelected ? 1.6 : 0.8}
        length={reducedMotion ? 0 : 5}
        color={starColor}
        attenuation={(t) => t * t}
      >
        <mesh
          ref={meshRef}
          onClick={handleClick}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHovered(true);
          }}
          onPointerOut={() => setHovered(false)}
        >
          <sphereGeometry args={[hovered || isSelected ? starSize * 1.35 : starSize, 24, 24]} />
          <meshStandardMaterial
            color={hovered || isSelected ? '#ffffff' : starColor}
            emissive={activeColor}
            emissiveIntensity={hovered || isSelected ? 2.8 : 1.2}
            roughness={0.15}
            metalness={0.85}
          />

          {/* Pulsing Outer Glow Aura */}
          <mesh ref={glowRef}>
            <sphereGeometry args={[starSize * 1.25, 16, 16]} />
            <meshBasicMaterial
              color={activeColor}
              transparent
              opacity={hovered || isSelected ? 0.5 : 0.2}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>

          {/* Floating Label */}
          {(hovered || isSelected || (showLabels && song.totalPlays >= 3)) && (
            <Html
              position={[0, starSize + 0.65, 0]}
              center
              distanceFactor={35}
              style={{ pointerEvents: 'none' }}
            >
              <div
                className={`px-2.5 py-1 rounded-full text-[11px] whitespace-nowrap transition-all duration-200 border flex items-center gap-1.5 shadow-xl backdrop-blur-md ${
                  isSelected
                    ? 'bg-cyan-400 text-black font-bold border-white scale-110 shadow-cyan-400/50'
                    : hovered
                    ? 'bg-slate-900/95 text-cyan-200 border-cyan-400/80 scale-105 shadow-cyan-500/30'
                    : 'bg-black/75 text-slate-200 border-white/15'
                }`}
              >
                <span className="text-amber-400">♫</span>
                <span className="font-medium truncate max-w-[150px]">{song.cleanTitle}</span>
                <span className="opacity-75 text-[10px] font-mono">({song.totalPlays})</span>
              </div>
            </Html>
          )}
        </mesh>
      </Trail>
    </group>
  );
}
