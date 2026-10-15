'use client';

import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface CelestialBackgroundProps {
  reducedMotion?: boolean;
  particleCount?: number;
}

function createCircleTexture(): THREE.CanvasTexture | undefined {
  if (typeof document === 'undefined') return undefined;
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (!ctx) return undefined;

  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.35, 'rgba(255, 255, 255, 0.8)');
  gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.2)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export function CelestialBackground({
  reducedMotion = false,
  particleCount = 2800,
}: CelestialBackgroundProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const nebulaRef = useRef<THREE.Points>(null);
  const meteorsRef = useRef<THREE.LineSegments>(null);

  // Soft circle sprite texture for realistic spherical particles
  const circleTexture = useMemo(() => createCircleTexture(), []);

  // Background Starfield with Twinkle Sizes
  const [starPositions, starColors, starSizes] = useMemo(() => {
    const count = particleCount;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    const palette = [
      new THREE.Color('#38bdf8'), // sky
      new THREE.Color('#818cf8'), // indigo
      new THREE.Color('#f472b6'), // pink
      new THREE.Color('#ffffff'), // pure white
      new THREE.Color('#c084fc'), // purple
      new THREE.Color('#fbbf24'), // amber gold
    ];

    for (let i = 0; i < count; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 160 + Math.random() * 240;

      const sinPhi = Math.sin(phi);
      positions[i * 3] = r * sinPhi * Math.cos(theta);
      positions[i * 3 + 1] = r * sinPhi * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      const color = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      sizes[i] = 1.0 + Math.random() * 2.2;
    }

    return [positions, colors, sizes];
  }, [particleCount]);

  // Cosmic Dust / Swirling Nebula Clouds
  const [nebulaPositions, nebulaColors] = useMemo(() => {
    const count = Math.floor(particleCount * 0.45);
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const nebulaColorsList = [
      new THREE.Color('#06b6d4'), // cyan
      new THREE.Color('#8b5cf6'), // purple
      new THREE.Color('#ec4899'), // magenta
      new THREE.Color('#3b82f6'), // blue
    ];

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 35 + Math.random() * 140;
      const spread = (Math.random() - 0.5) * 45;

      positions[i * 3] = Math.cos(angle) * dist + spread;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 28;
      positions[i * 3 + 2] = Math.sin(angle) * dist + spread;

      const c = nebulaColorsList[Math.floor(Math.random() * nebulaColorsList.length)];
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    return [positions, colors];
  }, [particleCount]);

  // Shooting Stars / Meteors
  const meteorData = useMemo(() => {
    const meteorCount = 6;
    const meteors = [];
    for (let i = 0; i < meteorCount; i++) {
      meteors.push({
        pos: new THREE.Vector3(
          (Math.random() - 0.5) * 200,
          30 + Math.random() * 80,
          (Math.random() - 0.5) * 200
        ),
        dir: new THREE.Vector3(-1.2 - Math.random() * 0.8, -0.6 - Math.random() * 0.5, -0.8 - Math.random() * 0.5).normalize(),
        speed: 70 + Math.random() * 80,
        length: 12 + Math.random() * 15,
        life: Math.random(),
      });
    }
    return meteors;
  }, []);

  const meteorPositions = useMemo(() => new Float32Array(meteorData.length * 2 * 3), [meteorData.length]);

  useFrame((state, delta) => {
    if (!reducedMotion) {
      const time = state.clock.getElapsedTime();

      if (pointsRef.current) {
        pointsRef.current.rotation.y += delta * 0.015;
        pointsRef.current.rotation.x = Math.sin(time * 0.05) * 0.02;
      }
      if (nebulaRef.current) {
        nebulaRef.current.rotation.y -= delta * 0.01;
      }

      // Update meteors
      if (meteorsRef.current) {
        const attr = meteorsRef.current.geometry.attributes.position as THREE.BufferAttribute;
        if (attr) {
          meteorData.forEach((m, idx) => {
            m.life += delta * 0.4;
            if (m.life > 1) {
              m.life = 0;
              m.pos.set(
                (Math.random() - 0.5) * 200,
                40 + Math.random() * 60,
                (Math.random() - 0.5) * 200
              );
            }

            const head = m.pos.clone().addScaledVector(m.dir, m.speed * m.life);
            const tail = head.clone().addScaledVector(m.dir, -m.length);

            attr.setXYZ(idx * 2, head.x, head.y, head.z);
            attr.setXYZ(idx * 2 + 1, tail.x, tail.y, tail.z);
          });
          attr.needsUpdate = true;
        }
      }
    }
  });

  return (
    <group>
      {/* Distant Twinkling Stars */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[starPositions, 3]} />
          <bufferAttribute attach="attributes-color" args={[starColors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          map={circleTexture}
          size={1.6}
          vertexColors
          transparent
          opacity={0.9}
          depthWrite={false}
          sizeAttenuation
        />
      </points>

      {/* Volumetric Nebula Dust Clouds with Soft Radial Gradient */}
      <points ref={nebulaRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[nebulaPositions, 3]} />
          <bufferAttribute attach="attributes-color" args={[nebulaColors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          map={circleTexture}
          size={5.5}
          vertexColors
          transparent
          opacity={0.45}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          sizeAttenuation
        />
      </points>

      {/* Cosmic Shooting Star Streaks */}
      {!reducedMotion && (
        <lineSegments ref={meteorsRef}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[meteorPositions, 3]} />
          </bufferGeometry>
          <lineBasicMaterial
            color="#38bdf8"
            transparent
            opacity={0.7}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </lineSegments>
      )}
    </group>
  );
}
