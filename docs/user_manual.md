# User Manual: Viking Atlas Web Portal

Welcome to the **Viking Atlas**, a digital gateway into the history, folklore, and mythology of the Norse world. This manual outlines how to operate the portal's interactive panels.

---

## 1. Navigating the Interface
The application dashboard is divided into three key panels controlled by a unified **Story Controller**:

```
+-------------------------------------------------------------+
|                      HEADER CONTROLS                        |
|              [ History Mode ]  [ Myth Mode ]                |
+------------------------------+------------------------------+
|                              |                              |
|         MAP WIDGET           |        DYNASTY GRAPH         |
|   - Maps regional cities     |   - D3 force-directed tree   |
|   - Traces voyages           |   - Parentage/spouses/reigns |
|                              |                              |
+------------------------------+------------------------------+
|                      HORIZONTAL TIMELINE                    |
|       Scroll or slide to navigate the chronological eras    |
+-------------------------------------------------------------+
```

---

## 2. Interactive Map Operations

### Coordinate Node Cards
*   Click any glowing marker (such as **Trondheim**, **Uppsala**, or **Lindisfarne**) to open a descriptive tooltip containing the site's history and relevance to the active timeline year.

### Voyage Exploration Paths
*   When a navigation route is active, a dashed colored path will overlay the map. Hover over the path to view the voyager's name, dates, and details of their exploration (e.g., Leif Erikson's trip to Vinland).

### Myth Mode Map Overlay
*   Toggle **"Myth Mode"** in the header. The physical map coordinates will dissolve, replaced by the runic layout of Yggdrasil. The connections show how the nine worlds are logically positioned relative to each other.

---

## 3. Dynasty Graph Controls
The Dynasty panel visualizes connections between Norse figures:
*   **Panning & Zooming:** Click and drag the panel background to pan the tree. Use your mouse scroll wheel to zoom in and out.
*   **Inspecting Profiles:** Click any node to focus its profile details. Parents are connected via gold lines, siblings share structural hubs, and marriages are shown in dotted silver.
*   **Legendary Transitions:** You can follow lineage lines backwards in time from historical kings (like Harald Hardrada) back into the legendary rulers (Yngling dynasts) and eventually to the gods themselves.

---

## 4. Horizontal Timeline Navigation
*   **Scrolling:** Scroll horizontally or drag the slider pointer to move through time.
*   **Auto-Focusing:** Click any timeline event card. The timeline will snap to center on that year, the Map will load related geographic nodes, and the Dynasty graph will auto-select the main character of that event.
