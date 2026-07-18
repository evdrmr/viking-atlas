'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Compass, Sparkles, MapPin, Navigation } from 'lucide-react';
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

const MAP_BOUNDS = {
  minLon: -48,
  maxLon: 22,
  minLat: 50,
  maxLat: 66,
};

// Static definition of the Nine Worlds for Yggdrasil Cosmos
const MYTHICAL_WORLDS = [
  { name: 'Asgard', type: 'Sky Citadel', desc: 'Home of the Æsir gods, ruled by Odin. Houses Valhalla and Glaðsheimr.', x: 400, y: 80, color: '#f59e0b', rune: 'ᚫ' },
  { name: 'Vanaheim', type: 'Verdant Realm', desc: 'Home of the fertility and wisdom-controlling Vanir gods.', x: 230, y: 110, color: '#10b981', rune: 'ᚹ' },
  { name: 'Alfheim', type: 'Light Palace', desc: 'Homeland of the Light Elves, ruled by Freyr. Radiant and etherial.', x: 570, y: 110, color: '#06b6d4', rune: 'ᛚ' },
  { name: 'Midgard', type: 'Mortal World', desc: 'Human realm, surrounded by the ocean and encircled by Jörmungandr.', x: 400, y: 250, color: '#3b82f6', rune: 'ᛗ' },
  { name: 'Jotunheim', type: 'Giant Peaks', desc: 'Wild realm of rocks and frost giants, containing Utgard.', x: 610, y: 250, color: '#ec4899', rune: 'ᚦ' },
  { name: 'Svartalfheim', type: 'Subterranean Forge', desc: 'Dark caverns where the Dwarves forge legendary masterworks.', x: 190, y: 250, color: '#a855f7', rune: 'ᛞ' },
  { name: 'Helheim', type: 'Ice Underworld', desc: 'Realm of the dead who died of old age or sickness, ruled by Hel.', x: 400, y: 410, color: '#6b7280', rune: 'ᚻ' },
  { name: 'Niflheim', type: 'Mist & Frost', desc: 'Primordial land of ice, snow, and freezing fog.', x: 230, y: 390, color: '#38bdf8', rune: 'ᛁ' },
  { name: 'Muspelheim', type: 'Primordial Fire', desc: 'Realm of heat and flame, ruled by the fire giant Surtr.', x: 570, y: 390, color: '#f43f5e', rune: 'ᛏ' },
  { name: 'Urðarbrunnr', type: 'Well of Fate', desc: 'The Well of Urd at Yggdrasil’s roots, where the Norns weave fates.', x: 400, y: 470, color: '#eab308', rune: 'ᚢ' }
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
  const mapSvgRef = useRef<SVGSVGElement>(null);

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

  // Soft transitions when mythMode changes
  useEffect(() => {
    if (mapSvgRef.current) {
      gsap.fromTo(
        mapSvgRef.current,
        { opacity: 0.6, scale: 0.98 },
        { opacity: 1, scale: 1, duration: 0.5, ease: 'power2.out' }
      );
    }
    // Clear selections on mode toggle
    setSelectedLocation(null);
    setSelectedWorld(null);
  }, [mythMode]);

  const project = (lat: number, lon: number, width = 800, height = 500) => {
    const x = ((lon - MAP_BOUNDS.minLon) / (MAP_BOUNDS.maxLon - MAP_BOUNDS.minLon)) * width;
    const y = ((MAP_BOUNDS.maxLat - lat) / (MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat)) * height;
    return { x, y };
  };

  const getLandmassPaths = (w = 800, h = 500) => {
    const greenland = [
      project(66.0, -48.0, w, h), project(66.0, -42.0, w, h), project(61.0, -43.0, w, h),
      project(60.0, -45.0, w, h), project(61.5, -48.0, w, h),
    ];
    const iceland = [
      project(66.2, -24.0, w, h), project(66.5, -16.0, w, h), project(65.0, -13.5, w, h),
      project(63.3, -19.0, w, h), project(64.0, -24.5, w, h),
    ];
    const britain = [
      project(58.5, -6.0, w, h), project(58.0, -3.0, w, h), project(56.0, -2.0, w, h),
      project(51.0, 1.5, w, h), project(50.0, -5.0, w, h), project(53.0, -4.5, w, h),
      project(55.0, -6.5, w, h),
    ];
    const ireland = [
      project(55.2, -6.5, w, h), project(54.0, -5.5, w, h), project(52.0, -6.0, w, h),
      project(51.5, -10.0, w, h), project(53.5, -10.5, w, h),
    ];
    const scandinavia = [
      project(66.0, 5.0, w, h), project(66.0, 22.0, w, h), project(60.0, 22.0, w, h),
      project(59.0, 18.0, w, h), project(58.0, 11.0, w, h), project(58.0, 5.0, w, h),
      project(62.0, 5.0, w, h),
    ];
    const denmark = [
      project(57.7, 10.5, w, h), project(56.0, 12.5, w, h), project(54.8, 12.0, w, h),
      project(54.5, 9.0, w, h),
    ];

    const toDString = (pts: { x: number; y: number }[]) =>
      `M ${pts[0].x} ${pts[0].y} ` + pts.slice(1).map((p) => `L ${p.x} ${p.y}`).join(' ') + ' Z';

    return {
      greenland: toDString(greenland),
      iceland: toDString(iceland),
      britain: toDString(britain),
      ireland: toDString(ireland),
      scandinavia: toDString(scandinavia),
      denmark: toDString(denmark),
    };
  };

  const paths = getLandmassPaths();

  const visibleLocations = locations.filter((loc) => !loc.isMythological);
  const visibleRoutes = routes.filter((r) => !r.isMythological);

  return (
    <div className={`relative w-full h-[560px] flex flex-col p-5 rounded-xl border transition-all duration-300 ${
      mythMode ? 'norsk-panel-rune' : 'norsk-panel'
    }`}>
      {/* Dynamic Header */}
      <div className="flex justify-between items-center mb-3 z-10">
        <div className="flex items-center gap-2">
          <Compass className={`w-5 h-5 ${mythMode ? 'text-rune glow-rune' : 'text-gold glow-gold'}`} />
          <h2 className={`text-lg font-bold tracking-wider font-decorative uppercase ${mythMode ? 'text-rune' : 'text-gold'}`}>
            {mythMode ? 'Cosmology of Yggdrasil (9 Worlds)' : 'North Atlantic Viking Conquests'}
          </h2>
        </div>
        <div className={`text-xs px-3 py-1 rounded border flex items-center gap-1.5 font-medieval ${
          mythMode ? 'bg-rune/10 border-rune/30 text-rune' : 'bg-gold/10 border-gold/30 text-gold'
        }`}>
          <span>{activeYear} AD</span>
        </div>
      </div>

      {/* SVG Canvas Map area */}
      <div className="relative flex-grow border border-white/5 rounded-lg overflow-hidden bg-[#040608]">
        {/* Runes & Stars Particle Background (Myth Mode) */}
        {mythMode && (
          <div className="absolute inset-0 pointer-events-none opacity-25 mix-blend-screen bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-rune/20 via-transparent to-transparent"></div>
        )}

        <svg
          ref={mapSvgRef}
          viewBox="0 0 800 500"
          className="w-full h-full select-none transition-all duration-500"
        >
          {/* Grids / Compass Rose Background decoration */}
          {!mythMode ? (
            <>
              {/* Oceanic compass rose lines */}
              <circle cx="150" cy="380" r="120" fill="none" stroke="rgba(212, 175, 55, 0.03)" strokeWidth="1" />
              <circle cx="150" cy="380" r="60" fill="none" stroke="rgba(212, 175, 55, 0.05)" strokeWidth="1" />
              <line x1="150" y1="240" x2="150" y2="520" stroke="rgba(212, 175, 55, 0.04)" />
              <line x1="10" y1="380" x2="290" y2="380" stroke="rgba(212, 175, 55, 0.04)" />
              <text x="142" y="235" fill="rgba(212, 175, 55, 0.2)" fontSize="10" fontFamily="serif">N</text>

              <text x="320" y="300" fill="rgba(255, 255, 255, 0.03)" fontSize="20" className="font-decorative" letterSpacing="8">
                MARE DEUCALIDONIUM
              </text>

              {/* Physical Landmass Paths */}
              <g fill="#0b0e14" stroke="rgba(212, 175, 55, 0.2)" strokeWidth="1.5" className="transition-all duration-300">
                <path d={paths.greenland} className="hover:fill-gold/5" />
                <path d={paths.iceland} className="hover:fill-gold/5" />
                <path d={paths.britain} className="hover:fill-gold/5" />
                <path d={paths.ireland} className="hover:fill-gold/5" />
                <path d={paths.scandinavia} className="hover:fill-gold/5" />
                <path d={paths.denmark} className="hover:fill-gold/5" />
              </g>

              {/* Conquest/Exploration Routes */}
              <g>
                {visibleRoutes.map((r) => {
                  const points = r.path.map((p) => project(p.lat, p.lon));
                  const isSelected = selectedEntity && r.explorer?.name.toLowerCase().includes(selectedEntity.toLowerCase());
                  if (points.length < 2) return null;
                  const pathD = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map((p) => `L ${p.x} ${p.y}`).join(' ');

                  return (
                    <g key={`route-${r.id}`}>
                      {/* Outer shadow glow */}
                      {isSelected && (
                        <path
                          d={pathD}
                          fill="none"
                          stroke="#d4af37"
                          strokeWidth="4"
                          strokeOpacity="0.15"
                          className="blur-[2px]"
                        />
                      )}
                      <path
                        d={pathD}
                        fill="none"
                        stroke={isSelected ? '#d4af37' : 'rgba(212, 175, 55, 0.25)'}
                        strokeWidth={isSelected ? '2.5' : '1.2'}
                        strokeDasharray={isSelected ? 'none' : '3 3'}
                        className="transition-all duration-300"
                      />
                      {/* Pulse circle running along route */}
                      {isSelected && (
                        <circle r="4.5" fill="#d4af37" className="shadow-[0_0_8px_#d4af37]">
                          <animateMotion dur="5s" repeatCount="indefinite" path={pathD} />
                        </circle>
                      )}
                    </g>
                  );
                })}
              </g>

              {/* Historical Node Markers */}
              <g>
                {visibleLocations.map((loc) => {
                  if (loc.latitude === null || loc.longitude === null) return null;
                  const { x, y } = project(loc.latitude, loc.longitude);
                  const isHovered = hoveredLoc?.name === loc.name;
                  const isSelected = selectedLocation?.name === loc.name;

                  let color = '#d4af37'; // gold
                  if (loc.type === 'battle_site') color = '#ef4444'; // red
                  if (loc.type === 'sacred_site') color = '#10b981'; // green

                  return (
                    <g
                      key={`loc-${loc.id}`}
                      transform={`translate(${x}, ${y})`}
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredLoc(loc)}
                      onMouseLeave={() => setHoveredLoc(null)}
                      onClick={() => {
                        setSelectedLocation(loc);
                        if (onSelectLocation) onSelectLocation(loc.name);
                      }}
                    >
                      <circle
                        r={isHovered || isSelected ? '12' : '7'}
                        fill="none"
                        stroke={color}
                        strokeWidth="1.5"
                        strokeOpacity="0.3"
                        className="animate-ping"
                      />
                      <circle
                        r={isHovered || isSelected ? '6' : '4'}
                        fill={color}
                        stroke="#06080c"
                        strokeWidth="1.5"
                        className="transition-all duration-200"
                      />
                    </g>
                  );
                })}
              </g>
            </>
          ) : (
            <>
              {/* MYTH MODE - Cosmic Yggdrasil Layout */}
              {/* Glowing Background Runic Wheel */}
              <g opacity="0.12" transform="translate(400, 250)">
                <circle r="230" fill="none" stroke="#38bdf8" strokeWidth="2.5" className="animate-pulse" />
                <circle r="130" fill="none" stroke="#38bdf8" strokeWidth="1" strokeDasharray="5 5" />
                {/* 24 Elder Futhark spokes */}
                {Array.from({ length: 24 }).map((_, i) => (
                  <line
                    key={`spoke-${i}`}
                    x1="0"
                    y1="0"
                    x2={230 * Math.cos((i * 15 * Math.PI) / 180)}
                    y2={230 * Math.sin((i * 15 * Math.PI) / 180)}
                    stroke="#38bdf8"
                    strokeWidth="0.5"
                  />
                ))}
              </g>

              {/* Midgard Serpent (Jörmungandr) winding in circular motion */}
              <path
                d="M 400 20 A 230 230 0 1 1 399.9 20"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="3"
                strokeOpacity="0.25"
                strokeDasharray="15 20"
                className="animate-runic-pulse"
              />

              {/* Yggdrasil Tree Branches and Roots */}
              <g stroke="rgba(56, 189, 248, 0.25)" fill="none" strokeWidth="4" className="transition-all duration-500">
                {/* Main Trunk */}
                <path d="M 400 80 C 370 170, 370 330, 400 410" strokeWidth="6" />
                <path d="M 400 80 C 430 170, 430 330, 400 410" strokeWidth="6" />
                {/* Top Branches (Asgard to Vanaheim / Alfheim) */}
                <path d="M 400 110 Q 300 90, 230 110" />
                <path d="M 400 110 Q 500 90, 570 110" />
                {/* Middle Connections (Midgard to Svartalfheim / Jotunheim) */}
                <path d="M 400 250 L 190 250" />
                <path d="M 400 250 L 610 250" />
                {/* Bottom Roots (Helheim to Niflheim / Muspelheim / Urd) */}
                <path d="M 400 370 Q 300 380, 230 390" />
                <path d="M 400 370 Q 500 380, 570 390" />
                <path d="M 400 410 L 400 470" strokeDasharray="3 3" />
              </g>

              {/* The Bifröst Rainbow Bridge (Asgard to Midgard) */}
              <g opacity="0.7">
                <path
                  d="M 400 80 L 400 250"
                  stroke="url(#bifrostGradient)"
                  strokeWidth="5"
                  strokeDasharray="6 3"
                  className="glow-rune"
                />
                <defs>
                  <linearGradient id="bifrostGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#ef4444" />
                    <stop offset="50%" stopColor="#eab308" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
              </g>

              {/* Myth Worlds Interactive Nodes */}
              <g>
                {MYTHICAL_WORLDS.map((world) => {
                  const isHovered = hoveredWorld?.name === world.name;
                  const isSelected = selectedWorld?.name === world.name;

                  return (
                    <g
                      key={`world-${world.name}`}
                      transform={`translate(${world.x}, ${world.y})`}
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredWorld(world)}
                      onMouseLeave={() => setHoveredWorld(null)}
                      onClick={() => setSelectedWorld(world)}
                    >
                      {/* Pulse Ring */}
                      <circle
                        r={isHovered || isSelected ? '26' : '18'}
                        fill="none"
                        stroke={world.color}
                        strokeWidth="1.5"
                        strokeOpacity="0.4"
                        className="animate-runic-pulse transition-all duration-300"
                      />
                      {/* World Core Sphere */}
                      <circle
                        r={isHovered || isSelected ? '18' : '13'}
                        fill="#06080c"
                        stroke={world.color}
                        strokeWidth="2.5"
                        className="transition-all duration-300"
                      />
                      {/* Central Rune character representation */}
                      <text
                        textAnchor="middle"
                        dy="4.5"
                        fill={world.color}
                        fontSize={isHovered || isSelected ? '14' : '11'}
                        fontWeight="bold"
                        className="font-medieval"
                      >
                        {world.rune}
                      </text>
                      {/* Small text node label under node */}
                      <text
                        textAnchor="middle"
                        y="32"
                        fill="#e4ebf0"
                        fontSize="9"
                        fontWeight="bold"
                        letterSpacing="1"
                        className="font-decorative opacity-80"
                      >
                        {world.name.toUpperCase()}
                      </text>
                    </g>
                  );
                })}
              </g>
            </>
          )}
        </svg>

        {/* Floating Narrative Information Card */}
        {(selectedLocation || hoveredLoc || selectedWorld || hoveredWorld) && (
          <div className={`absolute bottom-4 left-4 right-4 backdrop-blur-md rounded-lg p-4 text-sm z-10 transition-all duration-300 shadow-2xl border ${
            mythMode ? 'bg-[#080d15]/90 border-rune/45' : 'bg-[#0b0e14]/90 border-gold/45'
          }`}>
            {mythMode ? (
              // Myth Mode Data Card
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
              // Historical Mode Data Card
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

      {/* Interactive Legend Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3 pt-3 border-t border-white/5 text-[10px] text-foreground/60 font-medieval uppercase tracking-wider">
        {!mythMode ? (
          <>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-gold inline-block shadow-[0_0_5px_#d4af37]"></span>
              <span>Settlement / Capital</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-battle inline-block shadow-[0_0_5px_#ef4444]"></span>
              <span>Battlefield</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block shadow-[0_0_5px_#10b981]"></span>
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
              <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b] inline-block shadow-[0_0_5px_#f59e0b]"></span>
              <span>God-Home (Asgard)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#3b82f6] inline-block shadow-[0_0_5px_#3b82f6]"></span>
              <span>Midgard / Realms</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#f43f5e] inline-block shadow-[0_0_5px_#f43f5e]"></span>
              <span>Underworlds (Hel/Fire)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#eab308] inline-block shadow-[0_0_5px_#eab308]"></span>
              <span>Well of Wyrd (Fate)</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
