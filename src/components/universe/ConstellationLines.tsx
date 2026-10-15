'use client';

import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ArtistEntity } from '@/types';

interface ConstellationLinesProps {
  artists: ArtistEntity[];
  reducedMotion?: boolean;
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
  gradient.addColorStop(0.35, 'rgba(255, 255, 255, 0.9)');
  gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.3)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export function ConstellationLines({ artists, reducedMotion = false }: ConstellationLinesProps) {
  const linesRef = useRef<THREE.LineSegments>(null);
  const pulsesRef = useRef<THREE.Points>(null);
  const circleTexture = useMemo(() => createCircleTexture(), []);

  // Generate constellation links between nearby artists
  const { linePositions, lineColors, pulseData } = useMemo(() => {
    if (!artists || artists.length < 2) {
      return { linePositions: new Float32Array(0), lineColors: new Float32Array(0), pulseData: [] };
    }

    const posArray: number[] = [];
    const colorArray: number[] = [];
    const pulses: { start: THREE.Vector3; end: THREE.Vector3; progress: number; speed: number; color: THREE.Color }[] = [];

    // Max distance to connect two artist stars
    const maxDistance = 45;

    for (let i = 0; i < artists.length; i++) {
      const a1 = artists[i];
      if (!a1.position) continue;
      const p1 = new THREE.Vector3(...a1.position);
      const c1 = new THREE.Color(a1.color || '#06b6d4');

      // Connect to closest 2-3 neighbors
      let connections = 0;
      for (let j = i + 1; j < artists.length; j++) {
        const a2 = artists[j];
        if (!a2.position) continue;
        const p2 = new THREE.Vector3(...a2.position);
        const dist = p1.distanceTo(p2);

        if (dist < maxDistance && connections < 3) {
          connections++;

          // Line segment (p1 to p2)
          posArray.push(p1.x, p1.y, p1.z);
          posArray.push(p2.x, p2.y, p2.z);

          const c2 = new THREE.Color(a2.color || '#38bdf8');
          colorArray.push(c1.r, c1.g, c1.b);
          colorArray.push(c2.r, c2.g, c2.b);

          // Energy pulse packet
          pulses.push({
            start: p1.clone(),
            end: p2.clone(),
            progress: Math.random(),
            speed: 0.15 + Math.random() * 0.2,
            color: c1.clone().lerp(c2, 0.5),
          });
        }
      }
    }

    return {
      linePositions: new Float32Array(posArray),
      lineColors: new Float32Array(colorArray),
      pulseData: pulses,
    };
  }, [artists]);

  // Pulse particles positions
  const pulsePositions = useMemo(() => {
    return new Float32Array(pulseData.length * 3);
  }, [pulseData.length]);

  const pulseColors = useMemo(() => {
    const colors = new Float32Array(pulseData.length * 3);
    pulseData.forEach((p, idx) => {
      colors[idx * 3] = p.color.r;
      colors[idx * 3 + 1] = p.color.g;
      colors[idx * 3 + 2] = p.color.b;
    });
    return colors;
  }, [pulseData]);

  useFrame((_, delta) => {
    if (reducedMotion || pulseData.length === 0 || !pulsesRef.current) return;

    const posAttr = pulsesRef.current.geometry.attributes.position as THREE.BufferAttribute;
    if (!posAttr) return;

    for (let i = 0; i < pulseData.length; i++) {
      const p = pulseData[i];
      p.progress += delta * p.speed;
      if (p.progress > 1) {
        p.progress = 0;
      }

      // Interpolate along the constellation line
      const currentPos = new THREE.Vector3().lerpVectors(p.start, p.end, p.progress);
      posAttr.setXYZ(i, currentPos.x, currentPos.y, currentPos.z);
    }

    posAttr.needsUpdate = true;
  });

  if (linePositions.length === 0) return null;

  return (
    <group>
      {/* Static Constellation Web Lines */}
      <lineSegments ref={linesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[linePositions, 3]} />
          <bufferAttribute attach="attributes-color" args={[lineColors, 3]} />
        </bufferGeometry>
        <lineBasicMaterial
          vertexColors
          transparent
          opacity={0.2}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>

      {/* Travelling Cosmic Energy Packets */}
      {!reducedMotion && pulseData.length > 0 && (
        <points ref={pulsesRef}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[pulsePositions, 3]} />
            <bufferAttribute attach="attributes-color" args={[pulseColors, 3]} />
          </bufferGeometry>
          <pointsMaterial
            map={circleTexture}
            size={3.2}
            vertexColors
            transparent
            opacity={0.9}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </points>
      )}
    </group>
  );
}
