# Application Description & Architecture

This document describes the module structure, page views, backend APIs, and component designs of the **Viking Atlas** codebase.

---

## 1. Directory Structure

```
viking-atlas/
├── prisma/
│   ├── schema.prisma   # PostgreSQL / Prisma Database schema
│   └── seed.ts         # Database seed script
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── dynasty/route.ts      # D3 tree node/link API
│   │   │   ├── events/route.ts       # Timeline events API
│   │   │   └── geography/route.ts    # Map markers and route paths API
│   │   ├── globals.css # CSS variables, runic glow classes, custom scrollbars
│   │   ├── layout.tsx  # Global wrapper (Fonts, Title, SEO Meta)
│   │   └── page.tsx    # App entry (StoryController & main dashboard layout)
│   ├── components/
│   │   ├── DynastyGraph.tsx   # Interactive D3 force-directed tree
│   │   ├── CinematicCanvas.tsx # 3D WebGL cosmos and regional map rendering engine
│   │   └── Timeline.tsx       # Snapping GSAP chronological slider
│   └── lib/
│       └── db.ts       # Prisma Pg Client adapter setup
└── supabase-setup.sql  # SQL schema provisioning script
```

---

## 2. API Endpoints (`/src/app/api`)

### `GET /api/events`
Returns all events ordered chronologically. Used to populate the horizontal slider.
*   **Payload structure:**
    ```json
    [
      {
        "id": 1,
        "title": "Lindisfarne Raid",
        "type": "battle",
        "year": 793,
        "description": "...",
        "location": { "name": "Lindisfarne", "latitude": 55.6792, "longitude": -1.8021 }
      }
    ]
    ```

### `GET /api/dynasty`
Returns dynastic and mythological links configured for D3 node trees.
*   **Payload structure:**
    ```json
    {
      "nodes": [
        { "id": "odin", "name": "Odin", "type": "god", "isMythological": true }
      ],
      "links": [
        { "source": "odin", "target": "thor", "type": "parent-child" }
      ]
    }
    ```

### `GET /api/geography`
Returns map markers (cities, battle sites, holy nodes) and exploration route paths (represented as parsed coordinates).
*   **Payload structure:**
    ```json
    {
      "locations": [
        { "id": 1, "name": "Trondheim", "type": "city", "latitude": 63.4305, "longitude": 10.3951 }
      ],
      "routes": [
        {
          "id": 1,
          "name": "Discovery of Greenland",
          "coordinates": [[65.0, -22.0], [64.0, -40.0]]
        }
      ]
    }
    ```

---

## 3. UI Components (`/src/components`)

### `StoryController` (State Manager in `page.tsx`)
Coordinates global reactivity. Holds:
*   `activeYear` (numeric): Filters events, maps active nodes, and shifts routes.
*   `isMythMode` (boolean): Switches between the physical map/dynasty and the runic mythological cosmos.
*   `selectedEntity` (string): Highlights focused characters.

### `Timeline`
*   Renders a horizontal container. GSAP handles smooth translations as users drag the slider.
*   Highlights the closest event corresponding to `activeYear`.

### `CinematicCanvas`
*   Renders a 3D WebGL context utilizing Three.js and GSAP camera flight path interpolation.
*   Contains 3D extrusions representing regional landmasses and a 3D tree layout representing the Nine Worlds of Yggdrasil.
*   Triggers smooth flying camera animations to zoom, pan, and focus close-ups on locations and worlds when sagas change.

### `DynastyGraph`
*   Initializes a D3 simulation with force link, many-body charge, and center positioning.
*   Binds click triggers to update `selectedEntity` and focus family cards.
