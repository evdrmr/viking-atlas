# Walkthrough — Viking Atlas Web Application Deployment

This document summarizes the steps taken to migrate, seed, and deploy the **Viking Atlas** interactive web application to the production server.

---

## 1. Summary of Accomplishments

We have successfully migrated the application database to Supabase, deployed the codebase to the production server, and configured the web server to host it publicly:

*   **Supabase Schema & Security Setup:** Provisions the custom `viking_atlas` schema, migration owner role `prisma_viking_atlas`, and least-privilege runtime role `viking_atlas_app`.
*   **Database Seeding:** Executed the seed script to populate Supabase PostgreSQL with coordinate matrices, historical events, lineages, and travel routes.
*   **Prisma Client Migration:** Switched from SQLite to PostgreSQL adapter-pg driver, configured schema overrides, and resolved build-time TypeScript type mismatches.
*   **Git Scaffolding:** Initialized a git repository, committed project files, and pushed them to [github.com/evdrmr/viking-atlas](https://github.com/evdrmr/viking-atlas).
*   **Production Deployment:** Cloned the repo on the server `~/viking-atlas`, installed dependencies, and built Next.js successfully.
*   **Apache Reverse Proxy:** Configured the Apache virtual host to map `https://www.hobbyshot.net/viking-atlas` to Node port `3001` (bypassing basic authentication), and serve static assets directly from `.next/static` for maximum speed.
*   **systemd Service Integration:** Created and enabled `viking-atlas.service` to keep the application running.
*   **Location Schema Enhancements:** Added `mediaUrl String?` to the `Location` model in `schema.prisma` to allow storing visual maps directly on specific geographical sites and realms. Synced changes using `prisma db push`.
*   **Retirement of Space-Camera Themes:** Completely removed the abstract cosmic backdrop, basic 3D spheres, cylinder trunk, and extruded land blocks.
*   **Ambient Ember Particle Overhaul:** Built a clean, lightweight particle points system in `CinematicCanvas.tsx` rendering floating amber embers that drift upwards across the screen, blending into campfire gold in history mode and runic blue in myth mode.
*   **Cinematic Background Crossfade:** Implemented dynamic CSS-opacity layers in `page.tsx` that transition smoothly between the Celtic parchment paper background (`viking_bg_parchment.jpg`) and the Yggdrasil forest roots background (`myth_bg_roots.jpg`) when Pagan Myth Mode is toggled.
*   **High-Quality Graphical Asset Integrations:** Connected all dynamic database event and character lookups to high-res visual assets generated via Google's AI image tools:
    *   *Realms & Scenery:* Midgard fjord coastlines (`map_midgard.jpg`), Asgard golden sky-citadel (`map_asgard.jpg`), Jotunheim icy mountains (`map_jotunheim.jpg`), and Muspelheim volcanic lava fields (`map_muspelheim.jpg`).
    *   *Portraits & Figures:* Canute the Great (`char_canute.jpg`), Ragnar Lothbrok (`char_ragnar.jpg`), Harald Fairhair (`char_harald_fairhair.jpg`), Saint Olaf (`char_saint_olaf.jpg`), Leif Erikson (`char_leif_erikson.jpg`), Loki (`char_loki.jpg`), Odin (`portrait_odin.jpg`), and Thor (`portrait_thor.jpg`).

---

## 2. File-by-File Changes Made

### Project Infrastructure & Environment
*   **[next.config.ts](file:///home/evdrmr/github/viking-atlas/next.config.ts):** Configured `basePath: '/viking-atlas'` to prefix Next.js routing and assets correctly under the Apache sub-path.
*   **[.env](file:///home/evdrmr/github/viking-atlas/.env):** Updated with the target Supabase connection string and search path options.
*   **[db.ts](file:///home/evdrmr/github/viking-atlas/src/lib/db.ts):** Refactored to utilize `@prisma/adapter-pg` with `pg.Pool`, configuring dynamic SSL bypass (`rejectUnauthorized: false`) and passing the explicit `{ schema: 'viking_atlas' }` generator options.
*   **[.gitignore](file:///home/evdrmr/github/viking-atlas/.gitignore):** Added SQLite local files (`dev.db`, `dev.db-journal`) to ignore rules.

### Database Layer
*   **[schema.prisma](file:///home/evdrmr/github/viking-atlas/prisma/schema.prisma):** Changed provider to `postgresql` and added the `mediaUrl` field to the `Location` model.
*   **[update-images.ts](file:///home/evdrmr/github/viking-atlas/prisma/update-images.ts):** Dynamic update script mapping generated characters, events, and realms directly to their Supabase DB fields.
*   **[supabase-setup.sql](file:///home/evdrmr/github/viking-atlas/supabase-setup.sql):** Schema and permission grants configuration file. Altered the roles to set the default `search_path` to `viking_atlas, public` permanently.

### Premium UI Implementation
*   **[globals.css](file:///home/evdrmr/github/viking-atlas/src/app/globals.css):** Imported Google Fonts (`Cinzel`, `MedievalSharp`, `Uncial Antiqua`). Defined glassmorphism panel styles (`.norsk-panel`, `.norsk-panel-rune`), button custom overrides (`.norsk-btn`, `.norsk-btn-rune`), and runic pulse animations.
*   **[page.tsx](file:///home/evdrmr/github/viking-atlas/src/app/page.tsx):** Configured the main page wrapper, story selections, navigation controls, and layout grids. Restructured the backgrounds to support crossfading layouts (`viking_bg_parchment.jpg` & `myth_bg_roots.jpg`). Set up image resolver maps to match new characters and scenic realm cards, pulling directly from dynamic database record fields when present.
*   **[InteractiveMap.tsx](file:///home/evdrmr/github/viking-atlas/src/components/InteractiveMap.tsx):** Renders the custom generated sepia parchment maps. When in Pagan Myth Mode, it shows `yggdrasil_cosmology.jpg` with glowing runic portals mapped over the respective world locations. In Midgard mode, it shows `viking_parchment_map.jpg` with detailed coordinate projection overlays for voyager paths and battle sites.
*   **[DynastyGraph.tsx](file:///home/evdrmr/github/viking-atlas/src/components/DynastyGraph.tsx):** Injected ancient runic symbol letters inside nodes (`ᚫ` for deities, `ᚲ` for kings, `ᚱ` for explorers) and added breathing outer gold rings for selected items. Cloned nodes/links to prevent rendering runtime crashes.
*   **[Timeline.tsx](file:///home/evdrmr/github/viking-atlas/src/components/Timeline.tsx):** Modified cards into glassmorphic components, added glowing timeline slider tracks, and optimized type headers.

---

## 3. Server Deployment Configuration

### systemd Service File
The app runs on port `3001` on the server managed by systemd:
```ini
[Unit]
Description=Viking Atlas Next.js App
After=network-online.target
Wants=network-online.target
StartLimitInterval=60
StartLimitBurst=20
RequiresMountsFor=/mnt

[Service]
Type=simple
User=evdrmr
Group=evdrmr
WorkingDirectory=/home/evdrmr/viking-atlas

Environment=NODE_ENV=production
Environment=NODE_OPTIONS=--max-old-space-size=4096
Environment=PORT=3001
Environment=HOSTNAME=127.0.0.1
Environment=UV_THREADPOOL_SIZE=8
Environment=VIPS_CONCURRENCY=4
Environment=MALLOC_ARENA_MAX=2

ExecStartPre=+/bin/mkdir -p /mnt/next-cache/viking-atlas
ExecStartPre=+/bin/chown -R evdrmr:evdrmr /mnt/next-cache
ExecStartPre=/bin/bash -lc 'mkdir -p /home/evdrmr/viking-atlas/.next && rm -rf /home/evdrmr/viking-atlas/.next/cache && ln -sf /mnt/next-cache/viking-atlas /home/evdrmr/viking-atlas/.next/cache'
ExecStart=/usr/bin/node /home/evdrmr/viking-atlas/node_modules/next/dist/bin/next start -H 127.0.0.1 -p 3001

Restart=on-failure
RestartSec=5
TimeoutStartSec=30
TimeoutStopSec=30
KillSignal=SIGTERM

LimitNOFILE=65535
TasksMax=1024
MemoryMax=4G

NoNewPrivileges=yes
PrivateTmp=yes
ProtectSystem=strict
ProtectHome=read-only
ReadWritePaths=/home/evdrmr/viking-atlas /mnt
```

### Apache Virtual Host (`hobbyshot-le-ssl.conf`)
*   **Bypassing Next.js for static assets:**
    ```apache
    # --- PERFORMANCE: Serve Viking Atlas Next.js static assets directly (Bypass Node.js) ---
    ProxyPass /viking-atlas/_next/static !
    Alias /viking-atlas/_next/static /home/evdrmr/viking-atlas/.next/static

    <Directory /home/evdrmr/viking-atlas/.next/static>
        Require all granted
        Header set Cache-Control "public, max-age=31536000, immutable"
        Options -ExecCGI -Includes -Indexes
    </Directory>
    ```
*   **Reverse proxy routing:**
    ```apache
    # --- REVERSE PROXY: Send to Viking Atlas (Port 3001) ---
    ProxyPass /viking-atlas http://127.0.0.1:3001/viking-atlas retry=0 timeout=120 keepalive=On
    ProxyPassReverse /viking-atlas http://127.0.0.1:3001/viking-atlas
    ```

---

## 4. Verification

*   **Production Web App URL:**
    👉 **[https://www.hobbyshot.net/viking-atlas](https://www.hobbyshot.net/viking-atlas)**
*   **API Verification:**
    👉 **[https://www.hobbyshot.net/viking-atlas/api/events](https://www.hobbyshot.net/viking-atlas/api/events)** (successfully returns seeded JSON items queried from Supabase).

---

## 5. Ongoing Deployment Pipeline (Standard Rule)
Going forward, follow this workflow to build and test changes:
1.  **Local Dev:** Make edits and verify locally using `npm run dev`.
2.  **Commit & Push:** Stage, commit, and push changes to GitHub:
    ```bash
    git add . && git commit -m "commit message" && git push
    ```
3.  **Deploy on Server:** Connect via SSH, pull latest code, generate schema, rebuild Next.js, and restart systemd service:
    ```bash
    ssh Ubuntu 'cd ~/viking-atlas && git pull && npx prisma generate && npm run build && sudo systemctl restart viking-atlas.service'
    ```
