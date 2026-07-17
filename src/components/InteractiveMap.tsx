'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Compass, ShieldAlert, Sparkles, MapPin, Navigation } from 'lucide-react';
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

export default function InteractiveMap({
  mythMode,
  activeYear,
  selectedEntity,
  onSelectLocation,
}: InteractiveMapProps) {
  const [locations, setLocations] = useState<Location[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
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

  // Animation when myth mode is toggled
  useEffect(() => {
    if (mapSvgRef.current) {
      gsap.fromTo(
        mapSvgRef.current,
        { filter: 'hue-rotate(0deg) saturate(1)' },
        {
          filter: mythMode
            ? 'hue-rotate(180deg) saturate(1.5) drop-shadow(0 0 15px rgba(77, 159, 255, 0.4))'
            : 'hue-rotate(0deg) saturate(1)',
          duration: 0.8,
          ease: 'power2.out',
        }
      );
    }
  }, [mythMode]);

  const project = (lat: number, lon: number, width = 800, height = 500) => {
    const x = ((lon - MAP_BOUNDS.minLon) / (MAP_BOUNDS.maxLon - MAP_BOUNDS.minLon)) * width;
    const y = ((MAP_BOUNDS.maxLat - lat) / (MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat)) * height;
    return { x, y };
  };

  // Pre-project landmass paths for stylized SVG map background
  // coordinates based on simplified bounds:
  // Greenland: (-48, 60) to (-40, 66)
  // Iceland: (-24, 63) to (-13, 66)
  // Ireland/UK: (-10, 50) to (-2, 59)
  // Scandinavia: (4, 58) to (22, 66)
  // Denmark: (8, 54) to (13, 58)
  const getLandmassPaths = (w = 800, h = 500) => {
    const greenland = [
      project(66.0, -48.0, w, h),
      project(66.0, -42.0, w, h),
      project(61.0, -43.0, w, h),
      project(60.0, -45.0, w, h),
      project(61.5, -48.0, w, h),
    ];
    const iceland = [
      project(66.2, -24.0, w, h),
      project(66.5, -16.0, w, h),
      project(65.0, -13.5, w, h),
      project(63.3, -19.0, w, h),
      project(64.0, -24.5, w, h),
    ];
    const britain = [
      project(58.5, -6.0, w, h),
      project(58.0, -3.0, w, h),
      project(56.0, -2.0, w, h),
      project(51.0, 1.5, w, h),
      project(50.0, -5.0, w, h),
      project(53.0, -4.5, w, h),
      project(55.0, -6.5, w, h),
    ];
    const ireland = [
      project(55.2, -6.5, w, h),
      project(54.0, -5.5, w, h),
      project(52.0, -6.0, w, h),
      project(51.5, -10.0, w, h),
      project(53.5, -10.5, w, h),
    ];
    const scandinavia = [
      project(66.0, 5.0, w, h),
      project(66.0, 22.0, w, h),
      project(60.0, 22.0, w, h),
      project(59.0, 18.0, w, h),
      project(58.0, 11.0, w, h),
      project(58.0, 5.0, w, h),
      project(62.0, 5.0, w, h),
    ];
    const denmark = [
      project(57.7, 10.5, w, h),
      project(56.0, 12.5, w, h),
      project(54.8, 12.0, w, h),
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

  // Filter locations and routes by active year and mythMode
  const visibleLocations = locations.filter((loc) => {
    if (mythMode) return true; // Show mythological realms too
    return !loc.isMythological;
  });

  const visibleRoutes = routes.filter((r) => {
    // Hide mythological routes when mythMode is off
    if (!mythMode && r.isMythological) return false;
    // Highlight if selectedEntity matches explorer
    return true;
  });

  return (
    <div className="relative w-full h-[550px] bg-background border border-card/40 rounded-lg p-4 overflow-hidden shadow-2xl flex flex-col">
      {/* Header controls */}
      <div className="flex justify-between items-center mb-2 z-10">
        <div className="flex items-center gap-2">
          <Compass className={`w-5 h-5 ${mythMode ? 'text-rune' : 'text-gold'}`} />
          <h2 className="text-lg font-bold tracking-wide uppercase">
            {mythMode ? 'Mythological Map of the Nine Worlds' : 'Historical Geography & Routes'}
          </h2>
        </div>
        <div className="text-xs bg-card/60 px-3 py-1 rounded border border-gold/20 flex items-center gap-1">
          <span className="font-mono text-gold">{activeYear} AD</span>
        </div>
      </div>

      {/* SVG Canvas Map */}
      <div className="relative flex-grow border border-card/50 rounded overflow-hidden bg-[#0a0d13]">
        <svg
          ref={mapSvgRef}
          viewBox="0 0 800 500"
          className="w-full h-full select-none transition-all duration-300"
        >
          {/* Grid lines */}
          <g stroke="#ffffff" strokeWidth="0.5" strokeOpacity="0.04" strokeDasharray="3 3">
            {Array.from({ length: 8 }).map((_, i) => (
              <line key={`x-${i}`} x1={i * 100} y1={0} x2={i * 100} y2={500} />
            ))}
            {Array.from({ length: 5 }).map((_, i) => (
              <line key={`y-${i}`} x1={0} y1={i * 100} x2={800} y2={i * 100} />
            ))}
          </g>

          {/* Ocean Text decoration */}
          <text x="250" y="280" fill="#ffffff" fillOpacity="0.05" fontSize="22" fontFamily="serif" fontStyle="italic" letterSpacing="6">
            NORTH ATLANTIC OCEAN
          </text>
          {mythMode && (
            <text x="280" y="240" fill="#4D9FFF" fillOpacity="0.1" fontSize="18" fontFamily="serif" letterSpacing="4" className="glow-rune">
              JÖRMUNGANDR'S DEEP
            </text>
          )}

          {/* Sea Serpent Mythological Overlay */}
          {mythMode && (
            <path
              d="M 50 450 Q 150 430 200 460 T 350 440 T 500 470 T 650 450 T 750 460"
              fill="none"
              stroke="#4D9FFF"
              strokeWidth="3"
              strokeOpacity="0.15"
              strokeDasharray="10 15"
              className="animate-pulse"
            />
          )}

          {/* Landmass shapes */}
          <g fill="#151D2A" stroke="#C8A261" strokeWidth="1.2" strokeOpacity="0.25">
            <path d={paths.greenland} />
            <path d={paths.iceland} />
            <path d={paths.britain} />
            <path d={paths.ireland} />
            <path d={paths.scandinavia} />
            <path d={paths.denmark} />
          </g>

          {/* Animated Route Lines */}
          <g>
            {visibleRoutes.map((r) => {
              const points = r.path.map((p) => project(p.lat, p.lon));
              const isSelected = selectedEntity && r.explorer?.name.toLowerCase().includes(selectedEntity.toLowerCase());
              
              if (points.length < 2) return null;
              
              // Draw path string
              const pathD = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map((p) => `L ${p.x} ${p.y}`).join(' ');

              return (
                <g key={`route-${r.id}`}>
                  <path
                    d={pathD}
                    fill="none"
                    stroke={r.isMythological ? '#4D9FFF' : '#C8A261'}
                    strokeWidth={isSelected ? '2.5' : '1.2'}
                    strokeOpacity={isSelected ? '0.85' : '0.35'}
                    strokeDasharray={r.isMythological ? '5 5' : 'none'}
                    className="transition-all duration-300"
                  />
                  {/* Glowing pulse along the line for selected routes */}
                  {isSelected && (
                    <circle r="4" fill={r.isMythological ? '#4D9FFF' : '#C8A261'}>
                      <animateMotion dur="6s" repeatCount="indefinite" path={pathD} />
                    </circle>
                  )}
                </g>
              );
            })}
          </g>

          {/* Markers / Cities / Battles */}
          <g>
            {visibleLocations.map((loc) => {
              if (loc.latitude === null || loc.longitude === null) return null;
              const { x, y } = project(loc.latitude, loc.longitude);
              const isHovered = hoveredItem === loc.name;
              const isSelected = selectedLocation?.name === loc.name;

              // Color coordinate by type
              let markerColor = '#C8A261'; // Gold for cities
              if (loc.type === 'battle_site') markerColor = '#C23B22'; // Red for battles
              if (loc.type === 'sacred_site') markerColor = '#4D9FFF'; // Light blue for sacred
              if (loc.isMythological) markerColor = '#b366ff'; // Purple for myth realms

              return (
                <g
                  key={`loc-${loc.id}`}
                  transform={`translate(${x}, ${y})`}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredItem(loc.name)}
                  onMouseLeave={() => setHoveredItem(null)}
                  onClick={() => {
                    setSelectedLocation(loc);
                    if (onSelectLocation) onSelectLocation(loc.name);
                  }}
                >
                  {/* Outer breathing circle */}
                  <circle
                    r={isHovered || isSelected ? '10' : '6'}
                    fill="none"
                    stroke={markerColor}
                    strokeWidth="1.5"
                    strokeOpacity="0.4"
                    className="animate-ping"
                  />
                  {/* Central core marker */}
                  <circle
                    r={isHovered || isSelected ? '5' : '3.5'}
                    fill={markerColor}
                    stroke="#0B0E14"
                    strokeWidth="1"
                  />
                </g>
              );
            })}
          </g>
        </svg>

        {/* Hover/Selection Inset Info Panel */}
        {(selectedLocation || hoveredItem) && (
          <div className="absolute bottom-4 left-4 right-4 bg-card/90 backdrop-blur-md border border-gold/30 rounded p-3 text-sm transition-all duration-300 z-10">
            {selectedLocation ? (
              <div>
                <div className="flex justify-between items-start mb-1">
                  <span className="font-bold text-gold uppercase tracking-wider text-xs">
                    {selectedLocation.type.replace('_', ' ')}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedLocation(null);
                    }}
                    className="text-xs text-foreground/50 hover:text-foreground"
                  >
                    ✕ Close
                  </button>
                </div>
                <h4 className="font-serif font-bold text-base mb-1 flex items-center gap-1.5">
                  {selectedLocation.name}
                  {selectedLocation.isMythological && (
                    <Sparkles className="w-4 h-4 text-rune" />
                  )}
                </h4>
                <p className="text-xs text-foreground/80 leading-relaxed">
                  {selectedLocation.description}
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gold" />
                <span className="font-medium text-foreground">{hoveredItem}</span>
                <span className="text-xs text-foreground/50">(Click marker to inspect details)</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Map Legend */}
      <div className="grid grid-cols-4 gap-2 mt-2 pt-2 border-t border-card/40 text-[10px] text-foreground/60">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-gold inline-block"></span>
          <span>Settlements / Capitals</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-battle inline-block"></span>
          <span>Historic Battlefields</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rune inline-block"></span>
          <span>Sacred / Pagan Sites</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Navigation className="w-3.5 h-3.5 text-gold inline" />
          <span>Active Exploration Routes</span>
        </div>
      </div>
    </div>
  );
}
