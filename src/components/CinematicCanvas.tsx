'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';

interface CinematicCanvasProps {
  mythMode: boolean;
  activeYear: number;
  selectedEntity: string | null;
  activeStoryLocation: string | null;
}

// Static definition of the Nine Worlds for Yggdrasil 3D Space
const MYTHICAL_WORLDS = [
  { name: 'Asgard', type: 'Sky Citadel', color: 0xf59e0b, rune: 'ᚫ', pos: new THREE.Vector3(0, 110, 0) },
  { name: 'Vanaheim', type: 'Verdant Realm', color: 0x10b981, rune: 'ᚹ', pos: new THREE.Vector3(-70, 80, 40) },
  { name: 'Alfheim', type: 'Light Palace', color: 0x06b6d4, rune: 'ᛚ', pos: new THREE.Vector3(70, 80, -40) },
  { name: 'Midgard', type: 'Mortal World', color: 0x3b82f6, rune: 'ᛗ', pos: new THREE.Vector3(0, 0, 0) },
  { name: 'Jotunheim', type: 'Giant Peaks', color: 0xec4899, rune: 'ᚦ', pos: new THREE.Vector3(90, 10, 30) },
  { name: 'Svartalfheim', type: 'Subterranean Forge', color: 0xa855f7, rune: 'ᛞ', pos: new THREE.Vector3(-90, -10, -30) },
  { name: 'Helheim', type: 'Ice Underworld', color: 0x6b7280, rune: 'ᚻ', pos: new THREE.Vector3(0, -110, 0) },
  { name: 'Niflheim', type: 'Mist & Frost', color: 0x38bdf8, rune: 'ᛁ', pos: new THREE.Vector3(-70, -80, -40) },
  { name: 'Muspelheim', type: 'Primordial Fire', color: 0xf43f5e, rune: 'ᛏ', pos: new THREE.Vector3(70, -80, 40) },
  { name: 'Urðarbrunnr', type: 'Well of Fate', color: 0xeab308, rune: 'ᚢ', pos: new THREE.Vector3(0, -140, 15) }
];

const MAP_BOUNDS = {
  minLon: -48,
  maxLon: 22,
  minLat: 50,
  maxLat: 66,
};

export default function CinematicCanvas({
  mythMode,
  activeYear,
  selectedEntity,
  activeStoryLocation,
}: CinematicCanvasProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [locations, setLocations] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);

  // Refs for animation loops
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const mythGroupRef = useRef<THREE.Group | null>(null);
  const historyGroupRef = useRef<THREE.Group | null>(null);
  const particleGroupRef = useRef<THREE.Group | null>(null);
  const targetCamPos = useRef<THREE.Vector3>(new THREE.Vector3(0, 150, 300));
  const targetLookAt = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));

  // Fetch geographic points
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/geography');
        const data = await res.json();
        setLocations(data.locations || []);
        setRoutes(data.routes || []);
      } catch (err) {
        console.error('Error fetching geography data:', err);
      }
    }
    fetchData();
  }, []);

  // Initialize Three.js WebGL Scene
  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // 1. Scene setup
    const scene = new THREE.Scene();
    scene.background = null; // transparent, let CSS fjord background show behind
    scene.fog = new THREE.FogExp2(0x06080c, 0.002);
    sceneRef.current = scene;

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(50, width / height, 1, 2000);
    camera.position.set(0, 180, 320);
    cameraRef.current = camera;

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.35);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.85);
    dirLight.position.set(100, 300, 100);
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0x38bdf8, 1.5, 300);
    pointLight.position.set(0, 0, 0);
    scene.add(pointLight);

    // 5. Build Mythological Group (Yggdrasil Tree & Nine Worlds)
    const mythGroup = new THREE.Group();
    mythGroupRef.current = mythGroup;
    scene.add(mythGroup);

    // --- Yggdrasil Trunk & Branches ---
    const trunkMaterial = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      wireframe: true,
      transparent: true,
      opacity: 0.15,
    });
    const trunkGeo = new THREE.CylinderGeometry(5, 12, 300, 12, 12);
    const trunk = new THREE.Mesh(trunkGeo, trunkMaterial);
    mythGroup.add(trunk);

    // Dynamic glowing tree roots/branches using lines
    const lineMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.45 });
    MYTHICAL_WORLDS.forEach((world) => {
      // Draw a curve from trunk center (0, y, 0) to world pos
      const points = [];
      points.push(new THREE.Vector3(0, world.pos.y * 0.5, 0));
      points.push(new THREE.Vector3(world.pos.x * 0.4, world.pos.y * 0.7, world.pos.z * 0.4));
      points.push(world.pos);
      const curve = new THREE.CatmullRomCurve3(points);
      const curvePoints = curve.getPoints(20);
      const lineGeo = new THREE.BufferGeometry().setFromPoints(curvePoints);
      const branchLine = new THREE.Line(lineGeo, lineMat);
      mythGroup.add(branchLine);
    });

    // --- Nine Worlds Spheres ---
    const sphereGeo = new THREE.SphereGeometry(10, 32, 32);
    MYTHICAL_WORLDS.forEach((world) => {
      const worldGroup = new THREE.Group();
      worldGroup.position.copy(world.pos);
      worldGroup.name = `world-${world.name}`;

      // Glowing Sphere
      const sphereMat = new THREE.MeshStandardMaterial({
        color: world.color,
        emissive: world.color,
        emissiveIntensity: 0.4,
        roughness: 0.2,
        metalness: 0.8,
      });
      const mesh = new THREE.Mesh(sphereGeo, sphereMat);
      worldGroup.add(mesh);

      // Outer Runic Ring
      const ringGeo = new THREE.RingGeometry(14, 15, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: world.color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.55,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      worldGroup.add(ring);

      mythGroup.add(worldGroup);
    });

    // 6. Build Historical Group (3D Flat Region Map)
    const historyGroup = new THREE.Group();
    historyGroupRef.current = historyGroup;
    scene.add(historyGroup);

    // Map base grid plane
    const gridHelper = new THREE.GridHelper(500, 30, 0xd4af37, 0x1e293b);
    gridHelper.position.y = -5;
    gridHelper.material.opacity = 0.08;
    gridHelper.material.transparent = true;
    historyGroup.add(gridHelper);

    // Create 3D Landmass block meshes from simplified coordinates
    const landMat = new THREE.MeshStandardMaterial({
      color: 0x0a0f18,
      roughness: 0.8,
      metalness: 0.3,
      transparent: true,
      opacity: 0.9,
    });

    const createLandMesh = (pts: THREE.Vector2[], name: string) => {
      const shape = new THREE.Shape(pts);
      const extrudeSettings = { depth: 4, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.5, bevelThickness: 0.5 };
      const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
      const mesh = new THREE.Mesh(geo, landMat);
      mesh.rotation.x = -Math.PI / 2; // Flat on XZ plane
      mesh.position.y = -3;
      mesh.name = `land-${name}`;
      historyGroup.add(mesh);

      // Glowing outline border path
      const borderMat = new THREE.LineBasicMaterial({ color: 0xd4af37, transparent: true, opacity: 0.35 });
      const edgeGeo = new THREE.EdgesGeometry(geo);
      const line = new THREE.LineSegments(edgeGeo, borderMat);
      line.rotation.x = -Math.PI / 2;
      line.position.y = -3;
      historyGroup.add(line);
    };

    // Projection factors for 3D layout (maps bounds to [-200, 200] in 3D XZ coordinates)
    const map3D = (lat: number, lon: number) => {
      const x = ((lon - MAP_BOUNDS.minLon) / (MAP_BOUNDS.maxLon - MAP_BOUNDS.minLon)) * 400 - 200;
      const z = -(((lat - MAP_BOUNDS.minLat) / (MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat)) * 300 - 150);
      return new THREE.Vector2(x, z);
    };

    // Core land coordinates projections
    const glCoords = [
      map3D(66.0, -48.0), map3D(66.0, -42.0), map3D(61.0, -43.0),
      map3D(60.0, -45.0), map3D(61.5, -48.0)
    ];
    const icCoords = [
      map3D(66.2, -24.0), map3D(66.5, -16.0), map3D(65.0, -13.5),
      map3D(63.3, -19.0), map3D(64.0, -24.5)
    ];
    const scCoords = [
      map3D(66.0, 5.0), map3D(66.0, 22.0), map3D(60.0, 22.0),
      map3D(59.0, 18.0), map3D(58.0, 11.0), map3D(58.0, 5.0),
      map3D(62.0, 5.0)
    ];
    const ukCoords = [
      map3D(58.5, -6.0), map3D(58.0, -3.0), map3D(56.0, -2.0),
      map3D(51.0, 1.5), map3D(50.0, -5.0), map3D(53.0, -4.5),
      map3D(55.0, -6.5)
    ];

    createLandMesh(glCoords, 'greenland');
    createLandMesh(icCoords, 'iceland');
    createLandMesh(scCoords, 'scandinavia');
    createLandMesh(ukCoords, 'uk');

    // 7. Space Particle System for cosmic feeling
    const particleCount = 400;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      // Distributed in a sphere
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 250 + Math.random() * 150;
      positions[i] = r * Math.sin(phi) * Math.cos(theta);
      positions[i + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i + 2] = r * Math.cos(phi);

      colors[i] = 0.2 + Math.random() * 0.4;
      colors[i + 1] = 0.5 + Math.random() * 0.5;
      colors[i + 2] = 0.8 + Math.random() * 0.2;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const pTexture = new THREE.TextureLoader().load(
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><circle cx="5" cy="5" r="4" fill="white"/></svg>'
    );
    const pMaterial = new THREE.PointsMaterial({
      size: 3,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, pMaterial);
    scene.add(particles);

    // 8. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsed = clock.getElapsedTime();

      // Slow orbits for rings and tree branches
      mythGroup.rotation.y = elapsed * 0.03;
      mythGroup.children.forEach((child) => {
        if (child.name.startsWith('world-')) {
          // Spin the outer ring
          const ring = child.children[1];
          if (ring) {
            ring.rotation.z = elapsed * 0.15;
          }
        }
      });

      // Smooth Camera movement using lerp
      camera.position.lerp(targetCamPos.current, 0.04);
      const currentLookAt = new THREE.Vector3(0, 0, 0);
      currentLookAt.lerp(targetLookAt.current, 0.04);
      camera.lookAt(currentLookAt);

      renderer.render(scene, camera);
    };
    animate();

    // 9. Resize handler
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
  }, [locations]);

  // Handle Dynamic Camera and Visibility Transitions (GSAP & Lerp targets)
  useEffect(() => {
    if (!mythGroupRef.current || !historyGroupRef.current) return;

    if (mythMode) {
      // Fade out history, Fade in myth
      gsap.to(historyGroupRef.current.position, { y: -200, duration: 1, ease: 'power2.inOut' });
      gsap.to(mythGroupRef.current.position, { y: 0, duration: 1, ease: 'power2.inOut' });

      // Position camera in cosmic orbit of Yggdrasil
      targetCamPos.current.set(0, 80, 280);
      targetLookAt.current.set(0, 20, 0);
    } else {
      // Fade out myth, Fade in history
      gsap.to(mythGroupRef.current.position, { y: 200, duration: 1, ease: 'power2.inOut' });
      gsap.to(historyGroupRef.current.position, { y: 0, duration: 1, ease: 'power2.inOut' });

      // Position camera at an angled perspective of the 3D map
      targetCamPos.current.set(0, 190, 240);
      targetLookAt.current.set(0, -10, 0);
    }
  }, [mythMode]);

  // Adjust camera to focus on active story selection
  useEffect(() => {
    if (mythMode) {
      // Focus camera on mythological realm if activeStoryLocation is matched
      if (activeStoryLocation) {
        const matchedWorld = MYTHICAL_WORLDS.find(
          (w) => w.name.toLowerCase().includes(activeStoryLocation.toLowerCase())
        );
        if (matchedWorld) {
          // Move camera close to world pos
          targetCamPos.current.copy(matchedWorld.pos).add(new THREE.Vector3(0, 20, 60));
          targetLookAt.current.copy(matchedWorld.pos);
        }
      } else {
        // Reset to global tree view
        targetCamPos.current.set(0, 80, 280);
        targetLookAt.current.set(0, 20, 0);
      }
    } else {
      // Historical Focus: Move camera to active location
      if (activeStoryLocation && locations.length > 0) {
        const matchedLoc = locations.find((l) =>
          l.name.toLowerCase().includes(activeStoryLocation.toLowerCase())
        );
        if (matchedLoc && matchedLoc.latitude !== null && matchedLoc.longitude !== null) {
          // Convert lat/lon to 3D coords
          const map3D = (lat: number, lon: number) => {
            const x = ((lon - MAP_BOUNDS.minLon) / (MAP_BOUNDS.maxLon - MAP_BOUNDS.minLon)) * 400 - 200;
            const z = -(((lat - MAP_BOUNDS.minLat) / (MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat)) * 300 - 150);
            return new THREE.Vector3(x, 2, z);
          };
          const locPos = map3D(matchedLoc.latitude, matchedLoc.longitude);
          targetCamPos.current.copy(locPos).add(new THREE.Vector3(0, 45, 60));
          targetLookAt.current.copy(locPos);
        }
      } else {
        // Reset to global map view
        targetCamPos.current.set(0, 190, 240);
        targetLookAt.current.set(0, -10, 0);
      }
    }
  }, [activeStoryLocation, mythMode, locations]);

  return <div ref={mountRef} className="absolute inset-0 z-0 overflow-hidden w-full h-full pointer-events-none" />;
}
