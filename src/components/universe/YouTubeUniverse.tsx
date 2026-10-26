'use client';

import React, { useRef, useState } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { Billboard, Text, Float, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { ChannelEntity } from '@/types';
import { useUniverseStore } from '@/lib/store/useUniverseStore';
import { getCelestialColor } from '@/lib/parser/heuristics';

interface ChannelPlanetProps {
  channel: ChannelEntity;
  reducedMotion?: boolean;
  showLabels?: boolean;
}

function ChannelPlanet({
  channel,
  reducedMotion = false,
  showLabels = true,
}: ChannelPlanetProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const { selectedObject, selectObject, setFocusedTarget } = useUniverseStore();
  const isSelected = selectedObject?.type === 'channel' && selectedObject.data.id === channel.id;

  const pos = channel.position || [0, 0, 0];
  const channelColor = getCelestialColor(channel.name);
  const color = React.useMemo(() => new THREE.Color(channelColor), [channelColor]);
  const size = Math.min(4.5, Math.max(1.2, Math.log10(channel.totalViews + 1) * 1.8));

  useFrame((state, delta) => {
    if (!reducedMotion) {
      if (meshRef.current) {
        meshRef.current.rotation.y += delta * 0.45;
        meshRef.current.rotation.x += delta * 0.2;
      }
      if (ring1Ref.current) {
        ring1Ref.current.rotation.z -= delta * 0.35;
      }
      if (ring2Ref.current) {
        ring2Ref.current.rotation.x += delta * 0.25;
      }
    }
  });

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    selectObject({ type: 'channel', data: channel });
    setFocusedTarget([pos[0], pos[1], pos[2]]);
  };

  return (
    <group position={pos}>
      <Float
        speed={reducedMotion ? 0 : 1.6}
        rotationIntensity={reducedMotion ? 0 : 0.5}
        floatIntensity={reducedMotion ? 0 : 0.9}
        floatingRange={[-0.3, 0.3]}
      >
        {/* Shimmering Halo Particles */}
        {!reducedMotion && (
          <Sparkles
            count={hovered || isSelected ? 30 : 16}
            scale={size * 3.0}
            size={hovered || isSelected ? 3.0 : 1.8}
            speed={0.4}
            color={channelColor}
            opacity={0.65}
          />
        )}

        {/* Quantum Crystalline Channel Core */}
        <mesh
          ref={meshRef}
          onClick={handleClick}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHovered(true);
          }}
          onPointerOut={() => setHovered(false)}
        >
          <icosahedronGeometry args={[hovered || isSelected ? size * 1.25 : size, 1]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={hovered || isSelected ? 1.6 : 0.65}
            roughness={0.2}
            metalness={0.8}
            wireframe={false}
          />
        </mesh>

        {/* Hexagonal Inner Gyro Ring */}
        <mesh ref={ring1Ref} rotation={[Math.PI / 4, 0, 0]}>
          <ringGeometry args={[size * 1.45, size * 1.65, 6]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={hovered || isSelected ? 0.6 : 0.35}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        {/* Circular Outer Gyro Ring */}
        <mesh ref={ring2Ref} rotation={[-Math.PI / 3, Math.PI / 6, 0]}>
          <ringGeometry args={[size * 1.8, size * 1.95, 32]} />
          <meshBasicMaterial
            color="#fbbf24"
            transparent
            opacity={hovered || isSelected ? 0.5 : 0.22}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        {/* Floating 3D Billboard Label */}
        {(showLabels || hovered || isSelected) && (
          <Billboard position={[0, size + 1.2, 0]}>
            <Text
              position={[0, 0.4, 0]}
              fontSize={0.85}
              color={isSelected ? '#fbbf24' : hovered ? '#ffffff' : '#fef08a'}
              anchorX="center"
              anchorY="middle"
              outlineWidth={0.07}
              outlineColor="#030712"
              fontWeight={700}
            >
              {channel.name}
            </Text>
            <Text
              position={[0, -0.4, 0]}
              fontSize={0.52}
              color="#cbd5e1"
              anchorX="center"
              anchorY="middle"
              outlineWidth={0.04}
              outlineColor="#030712"
            >
              {`${channel.totalViews} views`}
            </Text>
          </Billboard>
        )}
      </Float>
    </group>
  );
}

export function YouTubeUniverse() {
  const { channels, reducedMotion, showLabels } = useUniverseStore();

  return (
    <group>
      {channels.map((channel) => (
        <ChannelPlanet
          key={channel.id}
          channel={channel}
          reducedMotion={reducedMotion}
          showLabels={showLabels}
        />
      ))}
    </group>
  );
}
