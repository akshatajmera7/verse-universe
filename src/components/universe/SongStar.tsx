'use client';

import React, { useRef, useState, useMemo } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { Billboard, Text, Trail } from '@react-three/drei';
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

  // Deterministic starting orbital angle based on song id
  const initialAngle = useMemo(() => {
    let hash = 0;
    const str = song.id || song.cleanTitle || 'song';
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return ((Math.abs(hash) % 1000) / 1000) * Math.PI * 2;
  }, [song.id, song.cleanTitle]);

  const angleRef = useRef(initialAngle);

  const { selectedObject, selectObject, setFocusedTarget } = useUniverseStore();
  const isSelected = selectedObject?.type === 'song' && selectedObject.data.id === song.id;

  const starSize = Math.min(0.85, Math.max(0.35, Math.log10(song.totalPlays + 1) * 0.42));
  const activeColor = useMemo(() => new THREE.Color(starColor), [starColor]);

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

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
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

      {/* Orbiting Song Star (Lightweight GPU path, Trail active only on hover/select) */}
      {hovered || isSelected ? (
        <Trail
          width={1.4}
          length={reducedMotion ? 0 : 4}
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
            <sphereGeometry args={[starSize * 1.3, 16, 16]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive={activeColor}
              emissiveIntensity={2.5}
              roughness={0.15}
              metalness={0.8}
            />

            {/* Pulsing Outer Glow Aura */}
            <mesh ref={glowRef}>
              <sphereGeometry args={[starSize * 1.3, 12, 12]} />
              <meshBasicMaterial
                color={activeColor}
                transparent
                opacity={0.5}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
              />
            </mesh>

            {/* Floating 3D Billboard Label */}
            <Billboard position={[0, starSize + 0.65, 0]}>
              <Text
                fontSize={0.4}
                color={isSelected ? '#22d3ee' : '#ffffff'}
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.035}
                outlineColor="#030712"
              >
                {song.cleanTitle.length > 22 ? `${song.cleanTitle.slice(0, 20)}...` : song.cleanTitle}
              </Text>
            </Billboard>
          </mesh>
        </Trail>
      ) : (
        <mesh
          ref={meshRef}
          onClick={handleClick}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHovered(true);
          }}
          onPointerOut={() => setHovered(false)}
        >
          <sphereGeometry args={[starSize, 12, 12]} />
          <meshStandardMaterial
            color={starColor}
            emissive={activeColor}
            emissiveIntensity={1.2}
            roughness={0.2}
            metalness={0.7}
          />

          {/* Pulsing Outer Glow Aura */}
          <mesh ref={glowRef}>
            <sphereGeometry args={[starSize * 1.2, 10, 10]} />
            <meshBasicMaterial
              color={activeColor}
              transparent
              opacity={0.18}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>

          {/* Floating 3D Billboard Label (Only for notable stars) */}
          {showLabels && song.totalPlays >= 5 && (
            <Billboard position={[0, starSize + 0.65, 0]}>
              <Text
                fontSize={0.35}
                color="#94a3b8"
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.03}
                outlineColor="#030712"
              >
                {song.cleanTitle.length > 20 ? `${song.cleanTitle.slice(0, 18)}...` : song.cleanTitle}
              </Text>
            </Billboard>
          )}
        </mesh>
      )}
    </group>
  );
}
