'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Sparkles, BookOpen, ArrowLeft, ArrowRight, Compass, ShieldAlert, Footprints, Landmark, HelpCircle, User } from 'lucide-react';
import InteractiveMap from '@/components/InteractiveMap';
import Timeline from '@/components/Timeline';
import DynastyGraph from '@/components/DynastyGraph';

// Import CinematicCanvas dynamically to render 3D space backdrop particles
const CinematicCanvas = dynamic(() => import('@/components/CinematicCanvas'), { ssr: false });

export default function Home() {
  const [mythMode, setMythMode] = useState<boolean>(false);
  const [activeYear, setActiveYear] = useState<number>(872);
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);
  
  // Dynamic data state from Supabase
  const [events, setEvents] = useState<any[]>([]);
  const [entities, setEntities] = useState<any[]>([]);
  const [storyIndex, setStoryIndex] = useState<number>(0);
  const [selectedEntityProfile, setSelectedEntityProfile] = useState<any>(null);

  // Fetch Supabase data on mount
  useEffect(() => {
    async function fetchData() {
      try {
        const eventsRes = await fetch('/api/events');
        const eventsData = await eventsRes.json();
        
        // Sort chronologically
        const sortedEvents = (eventsData || []).sort((a: any, b: any) => a.year - b.year);
        setEvents(sortedEvents);

        const dynastyRes = await fetch('/api/dynasty');
        const dynastyData = await dynastyRes.json();
        setEntities(dynastyData.nodes || []);
      } catch (err) {
        console.error('Failed to fetch data from Supabase:', err);
      }
    }
    fetchData();
  }, []);

  // Update selected profile when selectedEntity matches a node
  useEffect(() => {
    if (selectedEntity && entities.length > 0) {
      const match = entities.find(
        (e) => e.name.toLowerCase() === selectedEntity.toLowerCase() ||
               e.name.toLowerCase().includes(selectedEntity.toLowerCase())
      );
      if (match) {
        setSelectedEntityProfile(match);
      }
    } else {
      setSelectedEntityProfile(null);
    }
  }, [selectedEntity, entities]);

  const handleToggleMythMode = () => {
    setMythMode(!mythMode);
  };

  const handleSelectStory = (idx: number) => {
    if (events.length === 0) return;
    setStoryIndex(idx);
    const ev = events[idx];
    setActiveYear(ev.year);
    // Attempt to extract key entity from event description or title
    const potentialEntities = ['Odin', 'Thor', 'Harald Fairhair', 'Erik the Red', 'Leif Erikson', 'Saint Olaf', 'Harald Hardrada'];
    const matched = potentialEntities.find(
      (name) => ev.title.includes(name) || ev.description?.includes(name)
    );
    if (matched) {
      setSelectedEntity(matched);
    } else {
      setSelectedEntity(null);
    }
  };

  const handleNextStory = () => {
    if (storyIndex < events.length - 1) {
      handleSelectStory(storyIndex + 1);
    }
  };

  const handlePrevStory = () => {
    if (storyIndex > 0) {
      handleSelectStory(storyIndex - 1);
    }
  };

  // Helper to resolve generated scene artwork for current event
  const getEventImage = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('lindisfarne')) return '/viking-atlas/event_lindisfarne.jpg';
    if (t.includes('greenland')) return '/viking-atlas/event_greenland.jpg';
    if (t.includes('asgard')) return '/viking-atlas/map_asgard.jpg';
    if (t.includes('jotunheim')) return '/viking-atlas/map_jotunheim.jpg';
    if (t.includes('muspelheim')) return '/viking-atlas/map_muspelheim.jpg';
    if (t.includes('baldr') || t.includes('yggdrasil') || t.includes('nine worlds')) return '/viking-atlas/yggdrasil_cosmology.jpg';
    return '/viking-atlas/viking_parchment_map.jpg'; // weathered regional voyager map
  };

  // Helper to resolve generated portrait artwork for active character profile
  const getEntityPortrait = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('odin')) return '/viking-atlas/portrait_odin.jpg';
    if (n.includes('thor')) return '/viking-atlas/portrait_thor.jpg';
    if (n.includes('loki')) return '/viking-atlas/char_loki.jpg';
    if (n.includes('fairhair')) return '/viking-atlas/char_harald_fairhair.jpg';
    if (n.includes('saint olaf') || n.includes('olaf haraldsson')) return '/viking-atlas/char_saint_olaf.jpg';
    if (n.includes('leif erikson')) return '/viking-atlas/char_leif_erikson.jpg';
    if (n.includes('erik the red')) return '/viking-atlas/event_greenland.jpg';
    return null; // fallback to avatar icon
  };

  const activeStoryLocation = events.length > 0 && events[storyIndex]?.location
    ? events[storyIndex].location.name
    : null;

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col justify-between">
      {/* Cinematic Background Crossfade */}
      <div className="absolute inset-0 z-0 bg-[#06080c]">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
          style={{ backgroundImage: `url(/viking-atlas/viking_bg_parchment.jpg)` }}
        />
        <div 
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
            mythMode ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ backgroundImage: `url(/viking-atlas/myth_bg_roots.jpg)` }}
        />
        <div className="absolute inset-0 bg-black/40 mix-blend-multiply" />
      </div>

      {/* 3D WebGL space stardust backdrop */}
      <CinematicCanvas
        mythMode={mythMode}
        activeYear={activeYear}
        selectedEntity={selectedEntity}
        activeStoryLocation={activeStoryLocation}
      />

      {/* Foreground HUD dashboard */}
      <div className="relative z-10 flex flex-col justify-between min-h-screen p-4 md:p-6 gap-6 pointer-events-none w-full max-w-7xl mx-auto">
        
        {/* HUD Header */}
        <header className="flex flex-col sm:flex-row justify-between items-center border-b border-white/5 pb-4 gap-4 pointer-events-auto">
          <div className="text-center sm:text-left">
            <h1 className={`text-4xl font-bold tracking-widest font-decorative uppercase ${
              mythMode ? 'text-rune glow-rune' : 'text-gold glow-gold'
            }`}>
              Viking Atlas
            </h1>
            <p className="text-[9px] text-foreground/50 tracking-widest font-medieval uppercase mt-1">
              Interactive Cinematic Sagas and Deities Chronicles
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded border text-[10px] uppercase font-medieval tracking-wider ${
              mythMode ? 'border-rune/30 text-rune bg-rune/5' : 'border-gold/30 text-gold bg-gold/5'
            }`}>
              <Compass className="w-3.5 h-3.5" />
              <span>{mythMode ? 'Realm: Yggdrasil' : 'Realm: Midgard'}</span>
            </div>

            <button
              onClick={handleToggleMythMode}
              className={`flex items-center gap-2 px-5 py-2 rounded-full border transition-all duration-300 ${
                mythMode
                  ? 'bg-rune/15 border-rune text-rune shadow-[0_0_15px_rgba(56,189,248,0.3)] font-bold'
                  : 'bg-gold/5 border-gold/40 text-gold hover:border-gold shadow-[0_0_8px_rgba(212,175,55,0.1)]'
              } font-medieval text-xs uppercase tracking-wider cursor-pointer`}
            >
              <Sparkles className="w-4 h-4" />
              <span>{mythMode ? 'God Overlay: ON' : 'Pagan Myth Mode'}</span>
            </button>
          </div>
        </header>

        {/* Guided Sagas presentation layout grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch flex-grow my-2">
          
          {/* Main Visual theater panel (2/3 width) */}
          <div className="lg:col-span-2 flex flex-col gap-6 pointer-events-auto">
            {mythMode ? (
              <InteractiveMap
                mythMode={mythMode}
                activeYear={activeYear}
                selectedEntity={selectedEntity}
                onSelectLocation={(locName) => {
                  const match = events.find((s) => s.location?.name === locName);
                  if (match) setSelectedEntity(match.title);
                }}
              />
            ) : events.length === 0 ? (
              <div className="norsk-panel w-full flex-grow rounded-xl flex items-center justify-center min-h-[480px]">
                <span className="font-medieval text-gold animate-pulse">Consulting the Norns (Loading Supabase Sagas)...</span>
              </div>
            ) : (
              <div className="norsk-panel w-full flex-grow rounded-xl overflow-hidden flex flex-col justify-between relative min-h-[480px]">
                {/* Visual Scene Artwork Background */}
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-all duration-500"
                  style={{ backgroundImage: `url(${getEventImage(events[storyIndex].title)})` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-[#06080c] via-transparent to-black/35" />
                </div>

                {/* Overlaid Runic Info bar */}
                <div className="relative z-10 p-5 flex justify-between items-start pointer-events-none">
                  <div className="px-3 py-1.5 rounded border border-gold/30 bg-black/60 backdrop-blur-md text-gold font-medieval text-xs uppercase tracking-widest flex items-center gap-1.5">
                    {events[storyIndex].type === 'battle' ? <ShieldAlert className="w-4 h-4 text-battle" /> : <Footprints className="w-4 h-4 text-emerald-400" />}
                    <span>{events[storyIndex].type.replace('_', ' ').toUpperCase()} • {events[storyIndex].year < 0 ? `${Math.abs(events[storyIndex].year)} BCE` : `${events[storyIndex].year} AD`}</span>
                  </div>
                  {events[storyIndex].location && (
                    <div className="px-3 py-1.5 rounded border border-white/10 bg-black/60 backdrop-blur-md text-foreground/70 font-medieval text-[9px] uppercase tracking-wider">
                      📍 {events[storyIndex].location.name}
                    </div>
                  )}
                </div>

                {/* Story narrative presentation card overlay */}
                <div className="relative z-10 p-6 md:p-8 bg-gradient-to-t from-[#06080c] via-[#06080c]/90 to-transparent">
                  <h2 className="font-decorative font-bold text-2xl md:text-3xl text-gold glow-gold mb-3 uppercase tracking-wider">
                    {events[storyIndex].title}
                  </h2>
                  <p className="text-sm md:text-base text-foreground/90 leading-relaxed font-sans max-w-3xl mb-5">
                    {events[storyIndex].description}
                  </p>

                  <div className="flex justify-between items-center border-t border-white/5 pt-4">
                    <button
                      disabled={storyIndex === 0}
                      onClick={handlePrevStory}
                      className="norsk-btn px-5 py-2.5 rounded text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
                    >
                      <ArrowLeft className="w-4 h-4" /> Previous Saga
                    </button>
                    <span className="text-xs font-medieval text-foreground/45 tracking-widest">
                      CHRONICLE {storyIndex + 1} OF {events.length}
                    </span>
                    <button
                      disabled={storyIndex === events.length - 1}
                      onClick={handleNextStory}
                      className="norsk-btn px-5 py-2.5 rounded text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
                    >
                      Next Saga <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar: Dynamic profile cards & D3 graph (1/3 width) */}
          <div className="flex flex-col gap-6 pointer-events-auto">
            {/* Dynamic Profile Card displaying generated portrait art */}
            {selectedEntityProfile ? (
              <div className={`rounded-xl p-5 border shadow-2xl relative overflow-hidden transition-all duration-300 ${
                mythMode ? 'norsk-panel-rune border-rune/30' : 'norsk-panel border-gold/30'
              }`}>
                {/* Character Portrait Background (If available) */}
                {getEntityPortrait(selectedEntityProfile.name) && (
                  <div 
                    className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-luminosity hover:opacity-40 transition-all duration-300"
                    style={{ backgroundImage: `url(${getEntityPortrait(selectedEntityProfile.name)})` }}
                  />
                )}
                
                <div className="relative z-10 flex flex-col justify-between h-full min-h-[170px]">
                  <div>
                    <span className={`text-[9px] uppercase font-bold tracking-widest font-medieval ${
                      mythMode ? 'text-rune' : 'text-gold'
                    }`}>
                      {selectedEntityProfile.type.replace('_', ' ')}
                    </span>
                    <h3 className={`font-decorative font-bold text-lg mb-1 flex items-center gap-1.5 ${
                      mythMode ? 'text-rune glow-rune' : 'text-gold glow-gold'
                    }`}>
                      {selectedEntityProfile.name}
                      {selectedEntityProfile.title && (
                        <span className="text-[10px] text-foreground/50 font-sans font-normal">({selectedEntityProfile.title})</span>
                      )}
                    </h3>
                    <p className="text-xs text-foreground/80 leading-relaxed font-sans line-clamp-4 mt-2">
                      {selectedEntityProfile.description}
                    </p>
                  </div>

                  <div className="text-[9px] text-foreground/45 border-t border-white/5 pt-2 mt-3 flex justify-between uppercase font-medieval">
                    {selectedEntityProfile.capital && (
                      <span>Seat: {selectedEntityProfile.capital.name}</span>
                    )}
                    {selectedEntityProfile.burial && (
                      <span>Burial: {selectedEntityProfile.burial.name}</span>
                    )}
                  </div>
                </div>
              </div>
            ) : !mythMode ? (
              // Map preview box in history mode
              <div className="h-[210px] flex flex-col">
                <InteractiveMap
                  mythMode={mythMode}
                  activeYear={activeYear}
                  selectedEntity={selectedEntity}
                  onSelectLocation={(locName) => {
                    const match = events.find((s) => s.location?.name === locName);
                    if (match) setSelectedEntity(match.title);
                  }}
                />
              </div>
            ) : (
              // Myth instructions
              <div className="norsk-panel-rune rounded-xl p-5 flex flex-col justify-between h-[210px] border shadow-2xl relative overflow-hidden transition-all duration-300">
                <div className="flex items-center gap-2 border-b border-white/5 pb-2 mb-3">
                  <Compass className="w-4 h-4 text-rune" />
                  <h3 className="font-medieval font-bold tracking-widest uppercase text-[10px] text-rune">
                    Yggdrasil Realms
                  </h3>
                </div>
                <p className="text-xs text-foreground/80 leading-relaxed font-sans flex-grow">
                  Explore the Nine Worlds of the cosmos. Click any world's runic portal to zoom and view details.
                </p>
                <div className="text-[10px] text-rune/60 font-medieval uppercase tracking-wider border-t border-white/5 pt-2">
                  Active Mode: Pagan Cosmos
                </div>
              </div>
            )}

            {/* D3 Succession tree graph */}
            <div className="flex-grow min-h-[260px]">
              <DynastyGraph
                mythMode={mythMode}
                selectedEntity={selectedEntity}
                onSelectEntity={(name) => setSelectedEntity(name)}
              />
            </div>
          </div>
        </div>

        {/* HUD Bottom Panel: Dynamic Timeline */}
        <footer className="w-full pointer-events-auto">
          <Timeline
            mythMode={mythMode}
            activeYear={activeYear}
            onYearChange={(year) => {
              setActiveYear(year);
              const idx = events.findIndex((s) => s.year === year);
              if (idx !== -1) {
                setStoryIndex(idx);
                // Attempt to auto-select associated character from the event
                const ev = events[idx];
                const potentialEntities = ['Odin', 'Thor', 'Harald Fairhair', 'Erik the Red', 'Leif Erikson', 'Saint Olaf', 'Harald Hardrada'];
                const matched = potentialEntities.find(
                  (name) => ev.title.includes(name) || ev.description?.includes(name)
                );
                setSelectedEntity(matched || null);
              }
            }}
            onSelectEvent={(ev) => {
              setActiveYear(ev.year);
              if (ev.isMythological) setMythMode(true);
            }}
          />
        </footer>
      </div>
    </div>
  );
}
