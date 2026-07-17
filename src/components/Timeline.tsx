'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Calendar, ShieldAlert, Sparkles, Footprints, Landmark } from 'lucide-react';
import gsap from 'gsap';

interface EventItem {
  id: number;
  title: string;
  type: string;
  year: number;
  description: string | null;
  locationId: number | null;
  location: { name: string } | null;
  isMythological: boolean;
}

interface TimelineProps {
  mythMode: boolean;
  activeYear: number;
  onYearChange: (year: number) => void;
  onSelectEvent?: (event: EventItem) => void;
}

export default function Timeline({
  mythMode,
  activeYear,
  onYearChange,
  onSelectEvent,
}: TimelineProps) {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [activeEventId, setActiveEventId] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await fetch('/api/events');
        const data = await res.json();
        setEvents(data || []);
      } catch (err) {
        console.error('Error fetching events:', err);
      }
    }
    fetchEvents();
  }, []);

  // Filter events by mythology mode
  const visibleEvents = events.filter((e) => {
    if (mythMode) return true; // Show mythological events too
    return !e.isMythological;
  });

  const handleEventClick = (ev: EventItem) => {
    setActiveEventId(ev.id);
    onYearChange(ev.year);
    if (onSelectEvent) onSelectEvent(ev);

    // Scroll the clicked card into view smoothly
    const cardElement = document.getElementById(`event-card-${ev.id}`);
    if (cardElement && containerRef.current) {
      const container = containerRef.current;
      const containerHalfWidth = container.clientWidth / 2;
      const cardCenter = cardElement.offsetLeft + cardElement.clientWidth / 2;
      
      gsap.to(container, {
        scrollLeft: cardCenter - containerHalfWidth,
        duration: 0.6,
        ease: 'power2.out',
      });
    }
  };

  return (
    <div className="w-full bg-background border border-card/40 rounded-lg p-4 shadow-2xl flex flex-col gap-4">
      {/* Timeline Controls */}
      <div className="flex justify-between items-center border-b border-card/30 pb-2">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-gold" />
          <h2 className="text-lg font-bold tracking-wide uppercase">Historical & Mythological Timeline</h2>
        </div>
        <div className="text-xs text-foreground/50">
          Scroll horizontally <span className="font-mono text-gold">← Shift + Scroll →</span> or drag
        </div>
      </div>

      {/* Horizontal Scroll Area */}
      <div
        ref={containerRef}
        className="w-full overflow-x-auto flex gap-6 pb-4 pt-2 timeline-scroll-container scrollbar-thin scrollbar-thumb-card hover:scrollbar-thumb-gold"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {visibleEvents.map((ev) => {
          const isActive = ev.year === activeYear;
          const cardBorderColor = ev.isMythological
            ? 'border-rune/40 hover:border-rune'
            : 'border-gold/30 hover:border-gold';
          
          let icon = <Landmark className="w-4 h-4 text-gold" />;
          let typeColor = 'text-gold';
          
          if (ev.type === 'battle') {
            icon = <ShieldAlert className="w-4 h-4 text-battle" />;
            typeColor = 'text-battle';
          } else if (ev.type === 'discovery') {
            icon = <Footprints className="w-4 h-4 text-emerald-400" />;
            typeColor = 'text-emerald-400';
          } else if (ev.isMythological) {
            icon = <Sparkles className="w-4 h-4 text-rune" />;
            typeColor = 'text-rune';
          }

          return (
            <div
              key={`event-${ev.id}`}
              id={`event-card-${ev.id}`}
              onClick={() => handleEventClick(ev)}
              className={`flex-none w-72 h-44 bg-card/40 backdrop-blur-sm border rounded-lg p-4 cursor-pointer transition-all duration-300 flex flex-col justify-between select-none scroll-snap-align-center ${cardBorderColor} ${
                isActive
                  ? ev.isMythological
                    ? 'scale-102 bg-card/80 border-rune border-glow-rune'
                    : 'scale-102 bg-card/80 border-gold border-glow-gold'
                  : ''
              }`}
            >
              {/* Year & Type Header */}
              <div className="flex justify-between items-center">
                <span className="font-mono text-lg font-bold tracking-wider text-foreground">
                  {ev.year < 0 ? `${Math.abs(ev.year)} BCE` : `${ev.year} AD`}
                </span>
                <span className={`text-[10px] uppercase font-bold tracking-widest flex items-center gap-1 ${typeColor}`}>
                  {icon}
                  {ev.type.replace('_', ' ')}
                </span>
              </div>

              {/* Title & Location */}
              <div className="my-2">
                <h4 className="font-serif font-bold text-sm tracking-wide text-foreground line-clamp-1">
                  {ev.title}
                </h4>
                {ev.location && (
                  <span className="text-[10px] text-foreground/50 tracking-wide">
                    📍 {ev.location.name}
                  </span>
                )}
              </div>

              {/* Short Description */}
              <p className="text-xs text-foreground/75 leading-relaxed line-clamp-2">
                {ev.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Progress timeline bar */}
      <div className="relative w-full h-1 bg-card/40 rounded">
        <div
          className={`absolute top-0 bottom-0 left-0 transition-all duration-500 rounded ${
            mythMode ? 'bg-rune' : 'bg-gold'
          }`}
          style={{
            width: `${
              visibleEvents.length > 0
                ? ((visibleEvents.findIndex((e) => e.year === activeYear) + 1) /
                    visibleEvents.length) *
                  100
                : 0
            }%`,
          }}
        ></div>
      </div>
    </div>
  );
}
