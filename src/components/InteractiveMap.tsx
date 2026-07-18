'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Compass, Sparkles, Navigation } from 'lucide-react';
import gsap from 'gsap';

interface Location {
  id: number;
  name: string;
  type: string;
  description: string | null;
  latitude: number | null;
  longitude: number | null;
  isMythological: boolean;
}

interface Route {
  id: number;
  name: string;
  explorerId: number | null;
  explorer: { name: string } | null;
  startYear: number | null;
  endYear: number | null;
  isMythological: boolean;
  description: string | null;
  path: { lat: number; lon: number }[];
}

interface InteractiveMapProps {
  mythMode: boolean;
  activeYear: number;
  selectedEntity: string | null;
  onSelectLocation?: (locName: string) => void;
}

// Static definition of the Nine Worlds aligned to yggdrasil_cosmology.jpg coordinates
const MYTHICAL_WORLDS = [
  { name: 'Asgard', type: 'Sky Citadel', desc: 'Home of the Æsir gods, ruled by Odin. Houses Valhalla.', x: 50, y: 23, color: '#f59e0b', rune: 'ᚫ' },
  { name: 'Vanaheim', type: 'Verdant Realm', desc: 'Home of the fertility and wisdom-controlling Vanir gods.', x: 22, y: 35, color: '#10b981', rune: 'ᚹ' },
  { name: 'Alfheim', type: 'Light Palace', desc: 'Homeland of the Light Elves, ruled by Freyr.', x: 79, y: 35, color: '#06b6d4', rune: 'ᛚ' },
  { name: 'Midgard', type: 'Mortal World', desc: 'Human realm, surrounded by the ocean and encircled by Jörmungandr.', x: 50, y: 55, color: '#3b82f6', rune: 'ᛗ' },
  { name: 'Jotunheim', type: 'Giant Peaks', desc: 'Wild realm of rocks and frost giants, containing Utgard.', x: 16, y: 53, color: '#ec4899', rune: 'ᚦ' },
  { name: 'Svartalfheim', type: 'Subterranean Forge', desc: 'Dark caverns where the Dwarves forge legendary masterworks.', x: 83, y: 53, color: '#a855f7', rune: 'ᛞ' },
  { name: 'Muspelheim', type: 'Primordial Fire', desc: 'Realm of heat and flame, ruled by the fire giant Surtr.', x: 20, y: 71, color: '#f43f5e', rune: 'ᛏ' },
  { name: 'Niflheim', type: 'Mist & Frost', desc: 'Primordial land of ice, snow, and freezing fog.', x: 80, y: 71, color: '#38bdf8', rune: 'ᛁ' },
  { name: 'Urðarbrunnr', type: 'Well of Fate', desc: 'The Well of Urd at Yggdrasil’s roots, where the Norns weave fates.', x: 35, y: 71, color: '#eab308', rune: 'ᚢ' }
];

export default function InteractiveMap({
  mythMode,
  activeYear,
  selectedEntity,
  onSelectLocation,
}: InteractiveMapProps) {
  const [locations, setLocations] = useState<Location[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [hoveredWorld, setHoveredWorld] = useState<typeof MYTHICAL_WORLDS[0] | null>(null);
  const [hoveredLoc, setHoveredLoc] = useState<Location | null>(null);
  const [selectedWorld, setSelectedWorld] = useState<typeof MYTHICAL_WORLDS[0] | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

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

  // Soft transitions on mode toggle
  useEffect(() => {
    if (mapContainerRef.current) {
      gsap.fromTo(
        mapContainerRef.current,
        { opacity: 0.5, scale: 0.98 },
        { opacity: 1, scale: 1, duration: 0.5, ease: 'power2.out' }
      );
    }
    setSelectedLocation(null);
    setSelectedWorld(null);
  }, [mythMode]);

  // Project lat/lon coordinates into percentage values aligned with viking_parchment_map.jpg
  const projectToParchment = (lat: number, lon: number) => {
    let x = 50;
    let y = 50;

    // Greenland
    if (lon < -30) {
      x = 22 + ((lon + 45.4) / 10) * 5;
      y = 11 - ((lat - 61.15) / 5) * 3;
    }
    // Iceland
    else if (lon < -12) {
      x = 20 + ((lon + 21.82) / 10) * 6;
      y = 31 - ((lat - 64.12) / 5) * 4;
    }
    // Ireland
    else if (lon < -6 && lat < 55) {
      x = 22 + ((lon + 8) / 4) * 3;
      y = 76 - ((lat - 53) / 4) * 4;
    }
    // Britain
    else if (lon < 2 && lat < 59) {
      x = 34 + ((lon + 1.8) / 4) * 4;
      y = 81 - ((lat - 54) / 5) * 6;
    }
    // Norway / Sweden / Denmark
    else {
      if (lat < 57) { // Denmark
        x = 66 + ((lon - 10) / 5) * 3;
        y = 73 - ((lat - 55) / 2) * 2;
      } else { // Norway & Sweden
        x = 72 + ((lon - 10.4) / 12) * 8;
        y = 40 - ((lat - 63.43) / 8) * 15;
      }
    }

    return { x, y };
  };

  const visibleLocations = locations.filter((loc) => !loc.isMythological);
  const visibleRoutes = routes.filter((r) => !r.isMythological);

  return (
    <div className={`relative w-full h-[580px] flex flex-col p-5 rounded-xl border transition-all duration-300 ${
      mythMode ? 'norsk-panel-rune' : 'norsk-panel'
    }`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-3 z-10">
        <div className="flex items-center gap-2">
          <Compass className={`w-5 h-5 ${mythMode ? 'text-rune glow-rune' : 'text-gold glow-gold'}`} />
          <h2 className={`text-lg font-bold tracking-wider font-decorative uppercase ${mythMode ? 'text-rune' : 'text-gold'}`}>
            {mythMode ? 'Saga Cosmology Map' : 'North Atlantic Viking Voyages'}
          </h2>
        </div>
        <div className={`text-[10px] px-3 py-1 rounded border flex items-center gap-1.5 font-medieval ${
          mythMode ? 'bg-rune/10 border-rune/30 text-rune' : 'bg-gold/10 border-gold/30 text-gold'
        }`}>
          <span>{activeYear} AD</span>
        </div>
      </div>

      {/* Map Content Box */}
      <div 
        ref={mapContainerRef}
        className="relative flex-grow border border-white/5 rounded-lg overflow-hidden bg-[#0a0c10] shadow-inner"
        style={{
          backgroundImage: `url(${mythMode ? '/yggdrasil_cosmology.jpg' : '/viking_parchment_map.jpg'})`,
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* SVG overlay to render lines and nodes over the background image */}
        <svg 
          viewBox="0 0 1000 1000" 
          className="absolute inset-0 w-full h-full"
          style={{ mixBlendMode: 'difference' }}
        >
          {/* We use difference blend mode or overlay lines so that routes look glowing and clear */}
        </svg>

        {/* Real interactive overlays positioned absolutely using percentage layout */}
        <div className="absolute inset-0 w-full h-full pointer-events-auto">
          {!mythMode ? (
            <>
              {/* Conquest/Exploration Routes overlay lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {visibleRoutes.map((r) => {
                  const points = r.path.map((p) => projectToParchment(p.lat, p.lon));
                  const isSelected = selectedEntity && r.explorer?.name.toLowerCase().includes(selectedEntity.toLowerCase());
                  if (points.length < 2) return null;
                  const pathD = `M ${points[0].x}% ${points[0].y}% ` + points.slice(1).map((p) => `L ${p.x}% ${p.y}%`).join(' ');

                  return (
                    <g key={`route-${r.id}`}>
                      <path
                        d={pathD}
                        fill="none"
                        stroke={isSelected ? '#d4af37' : 'rgba(212, 175, 55, 0.4)'}
                        strokeWidth={isSelected ? '4' : '2.2'}
                        strokeDasharray={isSelected ? 'none' : '4 4'}
                        className="transition-all duration-300"
                        style={{ filter: isSelected ? 'drop-shadow(0 0 6px rgba(212,175,55,0.8))' : 'none' }}
                      />
                    </g>
                  );
                })}
              </svg>

              {/* Historical Node Markers */}
              {visibleLocations.map((loc) => {
                if (loc.latitude === null || loc.longitude === null) return null;
                const { x, y } = projectToParchment(loc.latitude, loc.longitude);
                const isHovered = hoveredLoc?.name === loc.name;
                const isSelected = selectedLocation?.name === loc.name;

                let color = 'rgba(212, 175, 55, 0.9)'; // gold
                let shadowColor = 'shadow-[0_0_10px_rgba(212,175,55,0.7)]';
                if (loc.type === 'battle_site') {
                  color = 'rgba(239, 68, 68, 0.9)'; // red
                  shadowColor = 'shadow-[0_0_10px_rgba(239,68,68,0.7)]';
                }
                if (loc.type === 'sacred_site') {
                  color = 'rgba(16, 185, 129, 0.9)'; // green
                  shadowColor = 'shadow-[0_0_10px_rgba(16,185,129,0.7)]';
                }

                return (
                  <div
                    key={`loc-${loc.id}`}
                    style={{ left: `${x}%`, top: `${y}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10"
                    onMouseEnter={() => setHoveredLoc(loc)}
                    onMouseLeave={() => setHoveredLoc(null)}
                    onClick={() => {
                      setSelectedLocation(loc);
                      if (onSelectLocation) onSelectLocation(loc.name);
                    }}
                  >
                    <div className={`w-3.5 h-3.5 rounded-full border-2 border-white transition-all duration-300 ${shadowColor} ${
                      isHovered || isSelected ? 'scale-130' : ''
                    }`} style={{ backgroundColor: color }} />
                  </div>
                );
              })}
            </>
          ) : (
            <>
              {/* Mythological Worlds hotspots */}
              {MYTHICAL_WORLDS.map((world) => {
                const isHovered = hoveredWorld?.name === world.name;
                const isSelected = selectedWorld?.name === world.name;

                return (
                  <div
                    key={`world-${world.name}`}
                    style={{ left: `${world.x}%`, top: `${world.y}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10 flex flex-col items-center"
                    onMouseEnter={() => setHoveredWorld(world)}
                    onMouseLeave={() => setHoveredWorld(null)}
                    onClick={() => setSelectedWorld(world)}
                  >
                    {/* Glowing runic portal circle */}
                    <div 
                      className={`w-7 h-7 rounded-full flex items-center justify-center border font-medieval text-xs transition-all duration-300 ${
                        isHovered || isSelected
                          ? 'scale-120 border-white bg-white/10 text-white shadow-[0_0_15px_white]'
                          : 'border-white/40 bg-black/40 text-white/70'
                      }`}
                      style={{ 
                        borderColor: world.color, 
                        boxShadow: isHovered || isSelected ? `0 0 15px ${world.color}` : 'none',
                        color: world.color
                      }}
                    >
                      {world.rune}
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>

        {/* Floating Narrative Information Card */}
        {(selectedLocation || hoveredLoc || selectedWorld || hoveredWorld) && (
          <div className={`absolute bottom-4 left-4 right-4 backdrop-blur-md rounded-lg p-4 text-sm z-20 transition-all duration-300 shadow-2xl border ${
            mythMode ? 'bg-[#080d15]/90 border-rune/45' : 'bg-[#0b0e14]/90 border-gold/45'
          }`}>
            {mythMode ? (
              (selectedWorld || hoveredWorld) && (
                <div>
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-rune font-medieval uppercase tracking-wider text-[10px]">
                      {(selectedWorld || hoveredWorld)!.type}
                    </span>
                    {selectedWorld && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedWorld(null);
                        }}
                        className="text-xs text-foreground/50 hover:text-foreground font-medieval"
                      >
                        ✕ Close
                      </button>
                    )}
                  </div>
                  <h4 className="font-decorative font-bold text-base mb-1.5 flex items-center gap-1.5 text-rune glow-rune">
                    {(selectedWorld || hoveredWorld)!.name}
                  </h4>
                  <p className="text-xs text-foreground/80 leading-relaxed font-sans">
                    {(selectedWorld || hoveredWorld)!.desc}
                  </p>
                </div>
              )
            ) : (
              (selectedLocation || hoveredLoc) && (
                <div>
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-gold font-medieval uppercase tracking-wider text-[10px]">
                      {(selectedLocation || hoveredLoc)!.type.replace('_', ' ')}
                    </span>
                    {selectedLocation && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLocation(null);
                        }}
                        className="text-xs text-foreground/50 hover:text-foreground font-medieval"
                      >
                        ✕ Close
                      </button>
                    )}
                  </div>
                  <h4 className="font-decorative font-bold text-base mb-1.5 flex items-center gap-1.5 text-gold glow-gold">
                    {(selectedLocation || hoveredLoc)!.name}
                  </h4>
                  <p className="text-xs text-foreground/80 leading-relaxed font-sans">
                    {(selectedLocation || hoveredLoc)!.description}
                  </p>
                </div>
              )
            )}
          </div>
        )}
      </div>

      {/* Legend Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3 pt-3 border-t border-white/5 text-[10px] text-foreground/60 font-medieval uppercase tracking-wider">
        {!mythMode ? (
          <>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 inline-block shadow-[0_0_5px_rgba(212,175,55,0.7)]"></span>
              <span>Settlement</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block shadow-[0_0_5px_rgba(239,68,68,0.7)]"></span>
              <span>Battlefield</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block shadow-[0_0_5px_rgba(16,185,129,0.7)]"></span>
              <span>Pagan Site</span>
            </div>
            <div className="flex items-center gap-2">
              <Navigation className="w-3.5 h-3.5 text-gold inline" />
              <span>Conquest Route</span>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b] inline-block"></span>
              <span>Sky realms</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#3b82f6] inline-block"></span>
              <span>Mortal realm</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#f43f5e] inline-block"></span>
              <span>Fire / Ice</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#eab308] inline-block"></span>
              <span>Holy Well</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
