'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Sparkles, BookOpen, ArrowLeft, ArrowRight, Compass } from 'lucide-react';
import InteractiveMap from '@/components/InteractiveMap';
import Timeline from '@/components/Timeline';
import DynastyGraph from '@/components/DynastyGraph';

// Import CinematicCanvas dynamically as background stars
const CinematicCanvas = dynamic(() => import('@/components/CinematicCanvas'), { ssr: false });

const STORIES = [
  {
    id: 1,
    title: '1. The Lindisfarne Raid',
    year: 793,
    description: 'Viking raiders descend on the holy island of Lindisfarne off the coast of Northumbria, UK. The plunder of the rich monastery shocks Christian Europe and marks the traditional beginning of the Viking Age.',
    entity: 'Ragnar Lodbrok',
    location: 'Lindisfarne',
  },
  {
    id: 2,
    title: '2. The Flight to Iceland',
    year: 872,
    description: 'Harald Fairhair wins the Battle of Hafrsfjord, consolidating the coastal petty kingdoms of Norway. Free chieftains, refusing to submit to royal taxes, choose exile and establish a king-less republic in Iceland in 874 AD.',
    entity: 'Harald Fairhair',
    location: 'Reykjavík',
  },
  {
    id: 3,
    title: '3. Erik the Red & Greenland',
    year: 985,
    description: 'Erik the Red, outlawed in Norway and subsequently exiled from Iceland for manslaughter, sails west and discovers Greenland. He establishes the Eastern Settlement at Brattahlíð.',
    entity: 'Erik the Red',
    location: 'Brattahlíð',
  },
  {
    id: 4,
    title: '4. The Battle of Svolder',
    year: 1000,
    description: 'King Olaf Tryggvason converts Norway, Iceland, and Greenland to Christianity. In 1000 AD, Olaf is ambushed by Swedish, Danish, and Lade Jarl forces at the Battle of Svolder and leaps to his death.',
    entity: 'Olaf Tryggvason',
    location: 'Trondheim (Nidaros)',
  },
  {
    id: 5,
    title: '5. Saint Olaf at Stiklestad',
    year: 1030,
    description: 'Saint Olaf attempts to centralize Norway under Christian rule but is overthrown. Olaf returns from exile, only to be slain at the Battle of Stiklestad in 1030 AD. His martyrdom permanently seals Christianity in Norway.',
    entity: 'Saint Olaf',
    location: 'Stiklestad',
  },
  {
    id: 6,
    title: '6. The Fall of the Last Viking',
    year: 1066,
    description: 'Harald Hardrada, after serving as commander of the Byzantine Varangian Guard, returns to rule Norway. In 1066 AD, he invades England to claim the crown, but is slain at the Battle of Stamford Bridge, ending the Viking Age.',
    entity: 'Harald Hardrada',
    location: 'Stamford Bridge',
  },
];

export default function Home() {
  const [mythMode, setMythMode] = useState<boolean>(false);
  const [activeYear, setActiveYear] = useState<number>(872);
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);
  const [storyIndex, setStoryIndex] = useState<number | null>(null);

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
    if (storyIndex === null) {
      handleSelectStory(0);
    } else if (storyIndex < STORIES.length - 1) {
      handleSelectStory(storyIndex + 1);
    }
  };

  const handlePrevStory = () => {
    if (storyIndex !== null && storyIndex > 0) {
      handleSelectStory(storyIndex - 1);
    }
  };

  const activeStoryLocation = storyIndex !== null ? STORIES[storyIndex].location : null;

  return (
    <div className="viking-bg-wrapper min-h-screen relative overflow-hidden flex flex-col justify-between">
      {/* 3D Cosmic space dust background effect */}
      <CinematicCanvas
        mythMode={mythMode}
        activeYear={activeYear}
        selectedEntity={selectedEntity}
        activeStoryLocation={activeStoryLocation}
      />

      {/* Foreground Interactive Layout Layer */}
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
              Journey of Myth, Sagas, and Historical Succession
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Active Mode indicator badge */}
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded border text-[10px] uppercase font-medieval tracking-wider ${
              mythMode ? 'border-rune/30 text-rune bg-rune/5' : 'border-gold/30 text-gold bg-gold/5'
            }`}>
              <Compass className="w-3.5 h-3.5" />
              <span>{mythMode ? 'Realm: Yggdrasil' : 'Realm: Midgard'}</span>
            </div>

            {/* Myth Mode Toggle */}
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

        {/* HUD Main Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch flex-grow my-2">
          
          {/* Main Map Panel (2/3 width) */}
          <div className="lg:col-span-2 flex flex-col pointer-events-auto h-[580px]">
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

          {/* Right Sidebar HUD: Saga Logs & Dynasty Node Graph (1/3 width) */}
          <div className="flex flex-col gap-6 pointer-events-auto">
            
            {/* Saga Guided Panel */}
            <div className={`rounded-xl p-5 flex flex-col justify-between h-[210px] border shadow-2xl relative overflow-hidden transition-all duration-300 ${
              mythMode ? 'norsk-panel-rune' : 'norsk-panel'
            }`}>
              <div className="flex items-center gap-2 border-b border-white/5 pb-2 mb-3">
                <BookOpen className={`w-4 h-4 ${mythMode ? 'text-rune' : 'text-gold'}`} />
                <h3 className={`font-medieval font-bold tracking-widest uppercase text-[10px] ${
                  mythMode ? 'text-rune' : 'text-gold'
                }`}>
                  Saga Chronicle (Guided Mode)
                </h3>
              </div>

              {storyIndex === null ? (
                <div className="flex flex-col justify-center items-center text-center flex-grow py-3">
                  <p className="text-xs text-foreground/75 leading-relaxed max-w-[280px] font-sans">
                    Embark on a curated chronological tour through the major events of the Viking expansion.
                  </p>
                  <button
                    onClick={() => handleSelectStory(0)}
                    className={`mt-4 px-5 py-2 rounded text-xs cursor-pointer ${
                      mythMode ? 'norsk-btn-rune' : 'norsk-btn'
                    }`}
                  >
                    Begin Saga
                  </button>
                </div>
              ) : (
                <div className="flex flex-col justify-between flex-grow">
                  <div>
                    <h4 className={`font-decorative font-bold text-sm mb-1.5 ${
                      mythMode ? 'text-rune glow-rune' : 'text-gold glow-gold'
                    }`}>
                      {STORIES[storyIndex].title}
                    </h4>
                    <p className="text-xs text-foreground/85 leading-relaxed line-clamp-3 font-sans">
                      {STORIES[storyIndex].description}
                    </p>
                  </div>

                  <div className="flex justify-between items-center mt-3 pt-2 border-t border-white/5">
                    <button
                      disabled={storyIndex === 0}
                      onClick={handlePrevStory}
                      className={`flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider hover:text-foreground disabled:opacity-30 disabled:pointer-events-none transition-all duration-200 cursor-pointer ${
                        mythMode ? 'text-rune/80' : 'text-gold/80'
                      }`}
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> Back
                    </button>
                    <span className="text-[10px] font-medieval text-foreground/45">
                      {storyIndex + 1} / {STORIES.length}
                    </span>
                    <button
                      disabled={storyIndex === STORIES.length - 1}
                      onClick={handleNextStory}
                      className={`flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider hover:text-foreground disabled:opacity-30 disabled:pointer-events-none transition-all duration-200 cursor-pointer ${
                        mythMode ? 'text-rune/80' : 'text-gold/80'
                      }`}
                    >
                      Next <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* D3 Dynasty succession Node Graph */}
            <div className="flex-grow min-h-[300px]">
              <DynastyGraph
                mythMode={mythMode}
                selectedEntity={selectedEntity}
                onSelectEntity={(name) => setSelectedEntity(name)}
              />
            </div>
          </div>
        </div>

        {/* HUD Bottom Panel: Chronological saga timeline */}
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
              } else {
                setStoryIndex(null);
                setSelectedEntity(null);
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
