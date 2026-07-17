'use client';

import React, { useState } from 'react';
import { Compass, Sparkles, BookOpen, GitFork, ArrowLeft, ArrowRight } from 'lucide-react';
import InteractiveMap from '@/components/InteractiveMap';
import Timeline from '@/components/Timeline';
import DynastyGraph from '@/components/DynastyGraph';

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

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col p-6 gap-6 max-w-7xl mx-auto">
      {/* App Header */}
      <header className="flex justify-between items-center border-b border-card/45 pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-wider font-serif uppercase flex items-center gap-2 text-gold glow-gold">
            Viking Atlas
          </h1>
          <p className="text-xs text-foreground/60 tracking-wider">
            An Interactive Journey of Myth, Sagas, and History (793 – 1066 AD)
          </p>
        </div>

        {/* Myth Overlay Toggle */}
        <button
          onClick={handleToggleMythMode}
          className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-300 ${
            mythMode
              ? 'bg-rune/15 border-rune text-rune shadow-[0_0_15px_rgba(77,159,255,0.35)] font-bold'
              : 'bg-card/50 border-gold/40 text-gold hover:border-gold'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>{mythMode ? 'Mythology Overlay: ON' : 'Pagan Myth Overlay'}</span>
        </button>
      </header>

      {/* Main Grid Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-grow">
        {/* Left Panel: Map */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <InteractiveMap
            mythMode={mythMode}
            activeYear={activeYear}
            selectedEntity={selectedEntity}
            onSelectLocation={(locName) => {
              // Highlight entity active in that location if matches
              const match = STORIES.find((s) => s.location === locName);
              if (match) setSelectedEntity(match.entity);
            }}
          />
        </div>

        {/* Right Panel: Story Controller & Dynasty Graph */}
        <div className="flex flex-col gap-6">
          {/* Story Controller Panel */}
          <div className="bg-card/30 border border-card/40 rounded-lg p-5 flex flex-col justify-between h-[230px] shadow-xl relative overflow-hidden">
            <div className="flex items-center gap-2 border-b border-card/30 pb-2 mb-3">
              <BookOpen className="w-4 h-4 text-gold" />
              <h3 className="font-bold tracking-wider uppercase text-xs">Saga Chronicles (Story Mode)</h3>
            </div>

            {storyIndex === null ? (
              <div className="flex flex-col justify-center items-center text-center flex-grow py-4">
                <p className="text-sm text-foreground/80 leading-relaxed max-w-[280px]">
                  Embark on the chronological story of the Viking expansion.
                </p>
                <button
                  onClick={() => handleSelectStory(0)}
                  className="mt-4 px-4 py-1.5 bg-gold/15 text-gold border border-gold/30 hover:bg-gold/25 rounded text-xs uppercase tracking-wider font-bold transition-all duration-200"
                >
                  Begin Saga
                </button>
              </div>
            ) : (
              <div className="flex flex-col justify-between flex-grow">
                <div>
                  <h4 className="font-serif font-bold text-sm text-gold mb-1.5">
                    {STORIES[storyIndex].title}
                  </h4>
                  <p className="text-xs text-foreground/75 leading-relaxed line-clamp-4">
                    {STORIES[storyIndex].description}
                  </p>
                </div>

                <div className="flex justify-between items-center mt-3 pt-2 border-t border-card/20">
                  <button
                    disabled={storyIndex === 0}
                    onClick={handlePrevStory}
                    className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-foreground/60 hover:text-foreground disabled:opacity-30 disabled:pointer-events-none transition-all duration-200"
                  >
                    <ArrowLeft className="w-3 h-3" /> Back
                  </button>
                  <span className="text-[10px] font-mono text-foreground/45">
                    {storyIndex + 1} / {STORIES.length}
                  </span>
                  <button
                    disabled={storyIndex === STORIES.length - 1}
                    onClick={handleNextStory}
                    className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-gold hover:text-foreground disabled:opacity-30 disabled:pointer-events-none transition-all duration-200"
                  >
                    Next <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* D3 Dynasty Graph Panel */}
          <div className="flex-grow min-h-[300px]">
            <DynastyGraph
              mythMode={mythMode}
              selectedEntity={selectedEntity}
              onSelectEntity={(name) => setSelectedEntity(name)}
            />
          </div>
        </div>
      </div>

      {/* Bottom Timeline Section */}
      <footer className="w-full">
        <Timeline
          mythMode={mythMode}
          activeYear={activeYear}
          onYearChange={(year) => {
            setActiveYear(year);
            // Sync story index if year matches
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
    </main>
  );
}
