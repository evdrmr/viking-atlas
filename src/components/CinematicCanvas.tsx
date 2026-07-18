'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';

interface CinematicCanvasProps {
  mythMode: boolean;
  activeYear: number;
  selectedEntity: string | null;
  activeStoryLocation: string | null;
}

export default function CinematicCanvas({
  mythMode,
}: CinematicCanvasProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  // Refs for animation loops
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // 1. Scene setup
    const scene = new THREE.Scene();
    scene.background = null; // transparent to show the HTML background layouts
    sceneRef.current = scene;

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(60, width / height, 1, 1000);
    camera.position.z = 100;
    cameraRef.current = camera;

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Amber/Magic Embers Particle System
    const particleCount = 200;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    // Initial color values based on mythMode (Blue for Norse myth, Gold for history)
    const baseColor = mythMode ? new THREE.Color('#38bdf8') : new THREE.Color('#d4af37');

    for (let i = 0; i < particleCount; i++) {
      const idx = i * 3;
      // Spread across the screen space
      positions[idx] = (Math.random() - 0.5) * 160;
      positions[idx + 1] = (Math.random() - 0.5) * 120;
      positions[idx + 2] = (Math.random() - 0.5) * 80;

      // Slow upward drift velocities
      velocities[idx] = (Math.random() - 0.5) * 0.05; // slight horizontal drift
      velocities[idx + 1] = 0.08 + Math.random() * 0.12; // upward drift
      velocities[idx + 2] = (Math.random() - 0.5) * 0.05;

      // Color with slight randomness
      colors[idx] = baseColor.r * (0.8 + Math.random() * 0.2);
      colors[idx + 1] = baseColor.g * (0.8 + Math.random() * 0.2);
      colors[idx + 2] = baseColor.b * (0.8 + Math.random() * 0.2);
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Simple circle particle texture
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
      grad.addColorStop(0, 'rgba(255,255,255,1)');
      grad.addColorStop(0.3, 'rgba(255,255,255,0.8)');
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 16, 16);
    }
    const texture = new THREE.CanvasTexture(canvas);

    const material = new THREE.PointsMaterial({
      size: 1.8,
      map: texture,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);
    particlesRef.current = particles;

    // 5. Animation Loop
    let animationFrameId: number;
    const posArr = geometry.attributes.position.array as Float32Array;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Move embers upward and loop back
      for (let i = 0; i < particleCount; i++) {
        const idx = i * 3;
        posArr[idx] += velocities[idx];
        posArr[idx + 1] += velocities[idx + 1];
        posArr[idx + 2] += velocities[idx + 2];

        // Loop if drifts too high
        if (posArr[idx + 1] > 60) {
          posArr[idx + 1] = -60;
          posArr[idx] = (Math.random() - 0.5) * 160;
        }
      }
      geometry.attributes.position.needsUpdate = true;

      // Slow rotation for organic feel
      particles.rotation.y += 0.001;

      renderer.render(scene, camera);
    };
    animate();

    // 6. Resize handler
    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      scene.clear();
    };
  }, []);

  // Smooth color transitions when toggling mythMode
  useEffect(() => {
    if (!particlesRef.current) return;

    const colorObj = mythMode
      ? { r: 56/255, g: 189/255, b: 248/255 }  // #38bdf8 (rune blue)
      : { r: 212/255, g: 175/255, b: 55/255 }; // #d4af37 (gold)

    const geom = particlesRef.current.geometry;
    const colArr = geom.attributes.color.array as Float32Array;
    const count = colArr.length / 3;

    // Use GSAP to animate color transitions smoothly
    gsap.to(colArr, {
      endArray: Array.from({ length: count }, () => [
        colorObj.r * (0.8 + Math.random() * 0.2),
        colorObj.g * (0.8 + Math.random() * 0.2),
        colorObj.b * (0.8 + Math.random() * 0.2),
      ]).flat(),
      duration: 1.2,
      onUpdate: () => {
        geom.attributes.color.needsUpdate = true;
      },
    });
  }, [mythMode]);

  return <div ref={mountRef} className="absolute inset-0 z-0 overflow-hidden w-full h-full pointer-events-none" />;
}
