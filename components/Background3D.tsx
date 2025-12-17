import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as random from 'maath/random/dist/maath-random.esm';
import { Theme } from '../types';

interface Background3DProps {
  theme: Theme;
}

const ParticleWorld = ({ theme }: { theme: Theme }) => {
  const ref = useRef<any>();
  
  // Generate particles
  // We use 6000 floats for 2000 points (x, y, z for each)
  // Ensuring the length is divisible by 3 is critical to avoid NaN errors in Three.js geometry
  const [sphere] = useState(() => {
    const data = new Float32Array(6000);
    random.inSphere(data, { radius: 1.5 });
    
    // Safety check: scrub any NaNs that might have been generated
    // This prevents the "Computed radius is NaN" error
    for (let i = 0; i < data.length; i++) {
        if (isNaN(data[i])) {
            data[i] = 0;
        }
    }
    return data;
  });

  useFrame((state, delta) => {
    if (ref.current) {
      // Basic rotation
      ref.current.rotation.x -= delta / 10;
      ref.current.rotation.y -= delta / 15;
      
      // Interactive rotation based on mouse position
      // We use simple damping to make it smooth
      const x = state.pointer.x * 0.2;
      const y = state.pointer.y * 0.2;
      
      ref.current.rotation.x += (y - ref.current.rotation.x) * delta * 0.5;
      ref.current.rotation.y += (x - ref.current.rotation.y) * delta * 0.5;
    }
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={sphere} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color={theme.colors.accent}
          size={0.005}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={0.6}
        />
      </Points>
    </group>
  );
};

const Background3D: React.FC<Background3DProps> = ({ theme }) => {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none transition-opacity duration-1000 ease-in-out opacity-60">
      <Canvas camera={{ position: [0, 0, 1] }}>
        <ParticleWorld theme={theme} />
      </Canvas>
    </div>
  );
};

export default Background3D;