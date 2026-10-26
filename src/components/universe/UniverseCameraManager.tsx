'use client';

import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { useUniverseStore } from '@/lib/store/useUniverseStore';

export function UniverseCameraManager() {
  const { camera } = useThree();
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const { focusedTarget, reducedMotion } = useUniverseStore();

  const targetVec = useRef(new THREE.Vector3(0, 0, 0));
  const cameraTargetPos = useRef<THREE.Vector3 | null>(null);
  const isTransitioning = useRef(false);

  useEffect(() => {
    if (focusedTarget && controlsRef.current) {
      const [tx, ty, tz] = focusedTarget;
      targetVec.current.set(tx, ty, tz);

      // Cinematic angled camera offset
      cameraTargetPos.current = new THREE.Vector3(tx + 4, ty + 10, tz + 24);
      isTransitioning.current = true;
    }
  }, [focusedTarget]);

  useFrame((_, delta) => {
    if (isTransitioning.current && cameraTargetPos.current && controlsRef.current) {
      // Smooth cinematic ease damping
      const t = Math.min(1, delta * 3.8);
      camera.position.lerp(cameraTargetPos.current, t);
      controlsRef.current.target.lerp(targetVec.current, t);
      controlsRef.current.update();

      if (camera.position.distanceTo(cameraTargetPos.current) < 0.25) {
        isTransitioning.current = false;
        cameraTargetPos.current = null;
      }
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.06}
      minDistance={5}
      maxDistance={320}
      rotateSpeed={0.75}
      zoomSpeed={1.1}
      panSpeed={0.75}
      autoRotate={!reducedMotion && !focusedTarget}
      autoRotateSpeed={0.35}
      makeDefault
    />
  );
}
