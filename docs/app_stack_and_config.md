# Application Stack & Configuration

This document details the architectural stack, system configurations, and environment setups for the **Viking Atlas** application.

---

## 1. Technology Stack

### Frontend & UI
*   **Next.js (v16.2.10, App Router):** Framework for routing, server component data fetching, and API endpoints.
*   **React (v19.2.4) & TypeScript:** Core application logic and component structure.
*   **Tailwind CSS (v4.0.0):** Rapid, utility-first styling utilizing a custom "Dark Norse" color palette.
*   **Three.js (v0.170.0+):** Drives the 3D WebGL engine rendering Yggdrasil and the extruded landmass maps.
*   **GSAP (GreenSock Animation Platform v3.15.0):** Drives smooth camera flight animations, transitions, and scroll triggers.
*   **D3.js (v7.9.0):** Orchestrates the force-directed dynamic layout for the interactive dynastic/mythological trees.
*   **Tailwind CSS (v4.0.0):** Rapid, utility-first styling utilizing a custom "Dark Norse" color palette.

### Database & ORM
*   **PostgreSQL (Hosted on Supabase):** Production relational database.
*   **Prisma Client & Prisma ORM (v7.8.0):** Type-safe query builder, coupled with `@prisma/adapter-pg` to enable PostgreSQL connection capability on edge/server runtimes.
*   **pg (node-postgres v8.22.0), @types/three, & pg-connection-string:** Underpinning client pool and runtime configurations.

### Server & Hosting
*   **Ubuntu Server Host:** Hosts the Node/Next.js application.
*   **systemd:** Manages the Next.js process as a daemon service on Port `3001`.
*   **Apache HTTP Server:** Acts as a reverse proxy, mapping public SSL sub-path traffic to the local Next.js instance.

---

## 2. Configuration Parameters

### Environment Variables (`.env`)
The environment configuration requires a parsed connection string specifying the target schema and disabling TLS rejection checks for self-signed certificates:
```env
DATABASE_URL="postgresql://<user>:<password>@<host>:5432/postgres?schema=viking_atlas&sslmode=require&options=-c%20search_path%3Dviking_atlas"
```
*   `schema=viking_atlas`: Instructs the Prisma engine to query the custom schema.
*   `options=-c%20search_path%3Dviking_atlas`: Pass the search path parameter on startup (URL-encoded space `%20`).

### Next.js basePath Configuration
In [next.config.ts](file:///home/evdrmr/github/viking-atlas/next.config.ts), we configure:
```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/viking-atlas",
};

export default nextConfig;
```
This forces all built routes (API endpoints, JS/CSS assets, routing hooks) to be served under the `/viking-atlas` path prefix.

---

## 3. Database Roles & Schema Provisioning
The SQL schema and role definitions are managed in [supabase-setup.sql](file:///home/evdrmr/github/viking-atlas/supabase-setup.sql):
*   **`viking_atlas` Schema:** Isolates all tables to prevent naming collisions with other applications on the same database.
*   **`prisma_viking_atlas` Role:** Used during schema migrations and database seeding. Privileges are restricted to `viking_atlas` schema.
*   **`viking_atlas_app` Role:** Least-privilege runtime role used by the web app for read/write access.
*   **`ALTER ROLE ... SET search_path`:**
    ```sql
    alter role prisma_viking_atlas set search_path to viking_atlas, public;
    alter role viking_atlas_app set search_path to viking_atlas, public;
    ```
    This guarantees that any connection established by these roles automatically binds queries to the `viking_atlas` schema.
