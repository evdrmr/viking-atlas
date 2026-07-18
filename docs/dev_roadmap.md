# Development Roadmap

This document outlines the milestones completed, near-term enhancements, and long-term architectural expansions for the **Viking Atlas** application.

---

## Milestone 1: Core Architecture & Seeding (Completed)
*   [x] Scaffold Next.js App Router project with TypeScript and Tailwind CSS.
*   [x] Set up database schema in Prisma targeting PostgreSQL (Supabase) under the `viking_atlas` schema.
*   [x] Implement DB seeding script capturing historical and mythological data (Kings of Norway/Denmark/Sweden, Aesir/Vanir, exploration routes of Erik the Red and Leif Erikson).
*   [x] Create D3.js force-directed dynasty trees and interactive custom SVG maps.
*   [x] Deploy code to production server behind Apache reverse proxy using a systemd service.

---

## Milestone 2: UI Polish & Animation Enhancements (Current)
*   **Three.js / WebGL Integration:**
    *   Integrate a 3D animated landing hero displaying a spinning runic compass (vegvísir).
    *   Transition static map lines to glowing 3D paths using Three.js lines and custom shaders.
*   **GSAP Parallax Scrolling:**
    *   Implement GSAP scroll triggers for page section transitions.
    *   Refine horizontal timeline scroll snapping and card zoom animations.
*   **Runic Aesthetics:**
    *   Integrate a web-safe runic font (e.g., Futhark-inspired typography) for headings.
    *   Add responsive CSS glassmorphism controls to panels.

---

## Milestone 3: Interactive Battles & Narrative Journeys (Mid-Term)
*   **Animated Battle Reenactments:**
    *   Create visual animations for legendary battles ( Lindisfarne Raid, Battle of Svolder, Battle of Stiklestad, Battle of Stamford Bridge).
    *   Display troop movements, tactical routes, and naval ship icons mapped directly to timeline progression.
*   **Travel Route Overlays:**
    *   Allow users to filter map routes by character (e.g., Leif Erikson's voyage to Vinland vs. Harald Hardrada's flight to Constantinople).
    *   Provide step-by-step descriptive logs along the voyages.

---

## Milestone 4: Audio, Personalization & Search (Long-Term)
*   **Soundscapes & Audio Narratives:**
    *   Integrate ambient background soundscapes (wind, ocean waves, runic chants).
    *   Add spoken audio narrations for major historical saga logs.
*   **Search & Semantic Filtering:**
    *   Build a global search bar enabling lookups for kings, battles, artifacts, or mythological entities.
    *   Provide semantic graph exploration, allowing users to hover over a king and instantly view all associated events and relationships.
