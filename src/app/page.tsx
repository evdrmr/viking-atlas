'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Sparkles, BookOpen, ArrowLeft, ArrowRight, Compass, ShieldAlert, Footprints, Landmark } from 'lucide-react';
import InteractiveMap from '@/components/InteractiveMap';
import Timeline from '@/components/Timeline';
import DynastyGraph from '@/components/DynastyGraph';

// Import CinematicCanvas dynamically as background WebGL effects
const CinematicCanvas = dynamic(() => import('@/components/CinematicCanvas'), { ssr: false });

const STORIES = [
  {
    id: 1,
    title: '1. The Lindisfarne Raid',
    year: 793,
    description: 'Viking raiders descend on the holy island of Lindisfarne off the coast of Northumbria, UK. The plunder of the rich monastery shocks Christian Europe and marks the traditional beginning of the Viking Age.',
    entity: 'Ragnar Lodbrok',
    location: 'Lindisfarne',
    image: '/event_lindisfarne.jpg',
    type: 'battle'
  },
  {
    id: 2,
    title: '2. The Flight to Iceland',
    year: 872,
    description: 'Harald Fairhair wins the Battle of Hafrsfjord, consolidating the coastal petty kingdoms of Norway. Free chieftains establishing a king-less republic in Iceland to escape royal taxes and control.',
    entity: 'Harald Fairhair',
    location: 'Reykjavík',
    image: '/viking_bg.jpg',
    type: 'discovery'
  },
  {
    id: 3,
    title: '3. Erik the Red & Greenland',
    year: 985,
    description: 'Erik the Red, outlawed in Norway and subsequently exiled from Iceland for manslaughter, sails west and discovers Greenland. He establishes the Eastern Settlement at Brattahlíð.',
    entity: 'Erik the Red',
    location: 'Brattahlíð',
    image: '/event_greenland.jpg',
    type: 'discovery'
  },
  {
    id: 4,
    title: '4. The Battle of Svolder',
    year: 1000,
    description: 'King Olaf Tryggvason converts Norway, Iceland, and Greenland to Christianity. Olaf is ambushed by Swedish, Danish, and Lade Jarl forces at the Battle of Svolder and leaps to his death.',
    entity: 'Olaf Tryggvason',
    location: 'Trondheim (Nidaros)',
    image: '/viking_parchment_map.jpg',
    type: 'battle'
  },
  {
    id: 5,
    title: '5. Saint Olaf at Stiklestad',
    year: 1030,
    description: 'Saint Olaf attempts to centralize Norway under Christian rule but is overthrown. Olaf returns from exile, only to be slain at the Battle of Stiklestad. His martyrdom seals Christianity in Norway.',
    entity: 'Saint Olaf',
    location: 'Stiklestad',
    image: '/viking_bg.jpg',
    type: 'battle'
  },
  {
    id: 6,
    title: '6. The Fall of the Last Viking',
    year: 1066,
    description: 'Harald Hardrada, after serving as commander of the Byzantine Varangian Guard, returns to rule Norway. He invades England but is slain at the Battle of Stamford Bridge, ending the Viking Age.',
    entity: 'Harald Hardrada',
    location: 'Stamford Bridge',
    image: '/viking_bg.jpg',
    type: 'battle'
  },
];

export default function Home() {
  const [mythMode, setMythMode] = useState<boolean>(false);
  const [activeYear, setActiveYear] = useState<number>(872);
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);
  const [storyIndex, setStoryIndex] = useState<number>(0);

  const handleToggleMythMode = () => {
    setMythMode(!mythMode);
  };

  const handleSelectStory = (idx: number) => {
    setStoryIndex(idx);
    const story = STORIES[idx];
    setActiveYear(story.year);
    setSelectedEntity(story.entity);
  };

  const handleNextStory = () => {
    if (storyIndex < STORIES.length - 1) {
      handleSelectStory(storyIndex + 1);
    }
  };

  const handlePrevStory = () => {
    if (storyIndex > 0) {
      handleSelectStory(storyIndex - 1);
    }
  };

  const activeStoryLocation = STORIES[storyIndex].location;

  return (
    <div className="viking-bg-wrapper min-h-screen relative overflow-hidden flex flex-col justify-between">
      {/* 3D WebGL cosmic backdrop layer */}
      <CinematicCanvas
        mythMode={mythMode}
        activeYear={activeYear}
        selectedEntity={selectedEntity}
        activeStoryLocation={activeStoryLocation}
      />

      {/* Interactive HUD HUD Overlay */}
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
              An Interactive Visual Journey Through Myth, Sagas, and Kings
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

        {/* Cinematic Storytelling Layout Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch flex-grow my-2">
          
          {/* Central Visual Theater Panel (2/3 width) */}
          <div className="lg:col-span-2 flex flex-col gap-6 pointer-events-auto">
            {mythMode ? (
              // Myth Mode Map Explorer
              <InteractiveMap
                mythMode={mythMode}
                activeYear={activeYear}
                selectedEntity={selectedEntity}
                onSelectLocation={(locName) => {
                  const match = STORIES.find((s) => s.location === locName);
                  if (match) setSelectedEntity(match.entity);
                }}
              />
            ) : (
              // Guided Saga Cinematic Presentation
              <div className="norsk-panel w-full flex-grow rounded-xl overflow-hidden flex flex-col justify-between relative min-h-[480px]">
                {/* Visual Scene Artwork Background */}
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-all duration-500"
                  style={{ backgroundImage: `url(${STORIES[storyIndex].image})` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-[#06080c] via-transparent to-black/40" />
                </div>

                {/* Overlaid Runic Header info */}
                <div className="relative z-10 p-5 flex justify-between items-start pointer-events-none">
                  <div className="px-3 py-1.5 rounded border border-gold/30 bg-black/60 backdrop-blur-md text-gold font-medieval text-xs uppercase tracking-widest flex items-center gap-1.5">
                    {STORIES[storyIndex].type === 'battle' ? <ShieldAlert className="w-4 h-4 text-battle" /> : <Footprints className="w-4 h-4 text-emerald-400" />}
                    <span>{STORIES[storyIndex].type.toUpperCase()} • {STORIES[storyIndex].year} AD</span>
                  </div>
                  <div className="px-3 py-1.5 rounded border border-white/10 bg-black/60 backdrop-blur-md text-foreground/70 font-medieval text-[9px] uppercase tracking-wider">
                    Location: {STORIES[storyIndex].location}
                  </div>
                </div>

                {/* Overlaid Storyteller Narrative panel */}
                <div className="relative z-10 p-6 md:p-8 bg-gradient-to-t from-[#06080c] via-[#06080c]/90 to-transparent">
                  <h2 className="font-decorative font-bold text-2xl md:text-3xl text-gold glow-gold mb-3 uppercase tracking-wider">
                    {STORIES[storyIndex].title}
                  </h2>
                  <p className="text-sm md:text-base text-foreground/90 leading-relaxed font-sans max-w-3xl mb-5">
                    {STORIES[storyIndex].description}
                  </p>

                  {/* Navigation controls */}
                  <div className="flex justify-between items-center border-t border-white/5 pt-4">
                    <button
                      disabled={storyIndex === 0}
                      onClick={handlePrevStory}
                      className="norsk-btn px-5 py-2.5 rounded text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
                    >
                      <ArrowLeft className="w-4 h-4" /> Previous Chapter
                    </button>
                    <span className="text-xs font-medieval text-foreground/45 tracking-widest">
                      CHAPTER {storyIndex + 1} OF {STORIES.length}
                    </span>
                    <button
                      disabled={storyIndex === STORIES.length - 1}
                      onClick={handleNextStory}
                      className="norsk-btn px-5 py-2.5 rounded text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
                    >
                      Next Chapter <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right HUD: Maps Drawer & Succession lineages (1/3 width) */}
          <div className="flex flex-col gap-6 pointer-events-auto">
            {/* Map Explorer overlay card (Active only in History Mode, otherwise Map is displayed in center in Myth Mode) */}
            {!mythMode ? (
              <div className="h-[210px] flex flex-col">
                <InteractiveMap
                  mythMode={mythMode}
                  activeYear={activeYear}
                  selectedEntity={selectedEntity}
                  onSelectLocation={(locName) => {
                    const match = STORIES.find((s) => s.location === locName);
                    if (match) setSelectedEntity(match.entity);
                  }}
                />
              </div>
            ) : (
              // Myth Info helper card
              <div className="norsk-panel-rune rounded-xl p-5 flex flex-col justify-between h-[210px] border shadow-2xl relative overflow-hidden transition-all duration-300">
                <div className="flex items-center gap-2 border-b border-white/5 pb-2 mb-3">
                  <Compass className="w-4 h-4 text-rune" />
                  <h3 className="font-medieval font-bold tracking-widest uppercase text-[10px] text-rune">
                    World Tree Navigation
                  </h3>
                </div>
                <p className="text-xs text-foreground/80 leading-relaxed font-sans flex-grow">
                  Explore the 9 mythical realms of the Norse cosmology directly on the visual tree. Click world runic portals to inspect their ruler lineages.
                </p>
                <div className="text-[10px] text-rune/60 font-medieval uppercase tracking-wider border-t border-white/5 pt-2">
                  Active Mode: Pagan Cosmos
                </div>
              </div>
            )}

            {/* D3 Succession tree graph */}
            <div className="flex-grow min-h-[300px]">
              <DynastyGraph
                mythMode={mythMode}
                selectedEntity={selectedEntity}
                onSelectEntity={(name) => setSelectedEntity(name)}
              />
            </div>
          </div>
        </div>

        {/* HUD Bottom Panel: Timeline */}
        <footer className="w-full pointer-events-auto">
          <Timeline
            mythMode={mythMode}
            activeYear={activeYear}
            onYearChange={(year) => {
              setActiveYear(year);
              const idx = STORIES.findIndex((s) => s.year === year);
              if (idx !== -1) {
                setStoryIndex(idx);
                setSelectedEntity(STORIES[idx].entity);
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
