'use client';

import React, { useEffect, useState, useRef } from 'react';
import { GitFork, HelpCircle, Sparkles } from 'lucide-react';
import * as d3 from 'd3';

interface EntityNode extends d3.SimulationNodeDatum {
  id: number;
  name: string;
  title: string | null;
  type: string;
  description: string | null;
  reignStart: number | null;
  reignEnd: number | null;
  isMythological: boolean;
  capitalId: number | null;
  burialId: number | null;
}

interface RelationshipLink extends d3.SimulationLinkDatum<EntityNode> {
  id: number;
  source: number | EntityNode;
  target: number | EntityNode;
  type: string;
  description: string | null;
  isMythological: boolean;
}

interface DynastyGraphProps {
  mythMode: boolean;
  selectedEntity: string | null;
  onSelectEntity: (name: string | null) => void;
}

export default function DynastyGraph({
  mythMode,
  selectedEntity,
  onSelectEntity,
}: DynastyGraphProps) {
  const [data, setData] = useState<{ nodes: EntityNode[]; links: RelationshipLink[] }>({
    nodes: [],
    links: [],
  });
  const [hoveredNode, setHoveredNode] = useState<EntityNode | null>(null);
  const [selectedNode, setSelectedNode] = useState<EntityNode | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    async function fetchDynasty() {
      try {
        const res = await fetch('/viking-atlas/api/dynasty');
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error('Error fetching dynasty graph data:', err);
      }
    }
    fetchDynasty();
  }, []);

  useEffect(() => {
    if (!svgRef.current || data.nodes.length === 0) return;

    // Filter nodes and links based on mythMode
    const filteredNodes = data.nodes.filter((n) => (mythMode ? true : !n.isMythological));
    const filteredNodeIds = new Set(filteredNodes.map((n) => n.id));

    // Clone arrays to prevent D3 from mutating the React state directly
    const nodesCopy = filteredNodes.map((n) => ({ ...n }));
    const linksCopy = data.links
      .filter((l) => {
        const sId = typeof l.source === 'object' ? (l.source as any).id : l.source;
        const tId = typeof l.target === 'object' ? (l.target as any).id : l.target;
        return filteredNodeIds.has(sId) && filteredNodeIds.has(tId);
      })
      .map((l) => ({
        ...l,
        source: typeof l.source === 'object' ? (l.source as any).id : l.source,
        target: typeof l.target === 'object' ? (l.target as any).id : l.target,
      })) as RelationshipLink[];

    const width = 800;
    const height = 500;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous drawing

    // Draw markers for directed arrow links
    svg
      .append('defs')
      .selectAll('marker')
      .data(['parent_of', 'successor_of'])
      .enter()
      .append('marker')
      .attr('id', (d) => `arrow-${d}`)
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 24)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-4L10,0L0,4')
      .attr('fill', (d) => (d === 'successor_of' ? '#d4af37' : '#38bdf8'))
      .attr('opacity', 0.6);

    const gContainer = svg.append('g');

    // Add zoom behavior
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.4, 2.5])
      .on('zoom', (event) => {
        gContainer.attr('transform', event.transform);
      });
    svg.call(zoom);

    // Setup Force Simulation
    const simulation = d3
      .forceSimulation<EntityNode>(nodesCopy)
      .force(
        'link',
        d3
          .forceLink<EntityNode, RelationshipLink>(linksCopy)
          .id((d) => d.id)
          .distance(100)
      )
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(30));

    // Draw links (relationships)
    const link = gContainer
      .append('g')
      .selectAll('line')
      .data(linksCopy)
      .enter()
      .append('line')
      .attr('stroke', (d) => {
        if (d.type === 'spouse_of') return '#ec4899';
        if (d.type === 'successor_of') return '#d4af37';
        return '#38bdf8'; // parent_of
      })
      .attr('stroke-width', (d) => (d.type === 'successor_of' ? 2 : 1.2))
      .attr('stroke-dasharray', (d) => (d.type === 'spouse_of' ? '4 4' : 'none'))
      .attr('stroke-opacity', 0.5)
      .attr('marker-end', (d) => (d.type === 'spouse_of' ? 'none' : `url(#arrow-${d.type})`));

    // Draw nodes (entities)
    const node = gContainer
      .append('g')
      .selectAll('g')
      .data(nodesCopy)
      .enter()
      .append('g')
      .attr('class', 'cursor-pointer')
      .on('click', (event, d) => {
        setSelectedNode(d);
        onSelectEntity(d.name);
      })
      .on('mouseenter', (event, d) => {
        setHoveredNode(d);
      })
      .on('mouseleave', () => {
        setHoveredNode(null);
      })
      .call(
        d3
          .drag<SVGGElement, EntityNode>()
          .on('start', (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on('drag', (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on('end', (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      );

    // Node outer rings for selected state
    node
      .append('circle')
      .attr('r', 19)
      .attr('fill', 'none')
      .attr('stroke', (d) => {
        if (selectedEntity && d.name.toLowerCase().includes(selectedEntity.toLowerCase())) {
          return '#d4af37';
        }
        return '#38bdf8';
      })
      .attr('stroke-opacity', (d) => {
        if (selectedEntity && d.name.toLowerCase().includes(selectedEntity.toLowerCase())) return 0.85;
        return 0;
      })
      .attr('stroke-width', 2)
      .attr('class', 'animate-runic-pulse');

    // Node shape circles
    node
      .append('circle')
      .attr('r', 15)
      .attr('fill', (d) => {
        if (d.isMythological) return '#2e1065'; // Purple for mythological gods
        if (d.type === 'historical_king') return '#064e3b'; // Deep green for kings
        if (d.type === 'explorer') return '#78350f'; // Orange-brown for explorers
        return '#7f1d1d'; // Dark red for monsters
      })
      .attr('stroke', (d) => {
        if (selectedEntity && d.name.toLowerCase().includes(selectedEntity.toLowerCase())) {
          return '#d4af37';
        }
        return 'rgba(255, 255, 255, 0.2)';
      })
      .attr('stroke-width', 1.8);

    // Node Inner Rune Symbol
    node
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', 4)
      .attr('fill', (d) => {
        if (selectedEntity && d.name.toLowerCase().includes(selectedEntity.toLowerCase())) {
          return '#d4af37';
        }
        return '#ffffff';
      })
      .attr('font-size', '10px')
      .attr('font-family', 'MedievalSharp, serif')
      .text((d) => {
        if (d.isMythological) return 'ᚫ'; // God
        if (d.type === 'historical_king') return 'ᚲ'; // King
        if (d.type === 'explorer') return 'ᚱ'; // Explorer
        return 'ᚦ'; // Monster/Chaos
      });

    // Node labels (Text name)
    node
      .append('text')
      .attr('dx', 20)
      .attr('dy', 4)
      .attr('font-size', '10px')
      .attr('font-family', 'Cinzel, Georgia, serif')
      .attr('font-weight', 'bold')
      .attr('fill', '#e4ebf0')
      .text((d) => d.name);

    // Run force simulation updates
    simulation.on('tick', () => {
      link
        .attr('x1', (d) => (d.source as EntityNode).x!)
        .attr('y1', (d) => (d.source as EntityNode).y!)
        .attr('x2', (d) => (d.target as EntityNode).x!)
        .attr('y2', (d) => (d.target as EntityNode).y!);

      node.attr('transform', (d) => `translate(${d.x!}, ${d.y!})`);
    });

    return () => {
      simulation.stop();
    };
  }, [data, mythMode, selectedEntity]);

  return (
    <div className={`relative w-full h-[560px] flex flex-col p-5 rounded-xl border transition-all duration-300 ${
      mythMode ? 'norsk-panel-rune' : 'norsk-panel'
    }`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-3 z-10">
        <div className="flex items-center gap-2">
          <GitFork className={`w-5 h-5 ${mythMode ? 'text-rune glow-rune' : 'text-gold glow-gold'}`} />
          <h2 className={`text-lg font-bold tracking-wider font-decorative uppercase ${mythMode ? 'text-rune' : 'text-gold'}`}>
            {mythMode ? 'Ancestry & God Lineages' : 'Royal Succession Lineages'}
          </h2>
        </div>
        <div className="text-[10px] text-foreground/40 font-medieval uppercase tracking-wider hidden md:block">
          Drag to arrange • Drag canvas to pan • Scroll to zoom
        </div>
      </div>

      {/* SVG Canvas for D3 */}
      <div className="relative flex-grow border border-white/5 rounded-lg overflow-hidden bg-[#040608]">
        <svg ref={svgRef} viewBox="0 0 800 500" className="w-full h-full select-none" />

        {/* Floating Profile Info Panel */}
        {(selectedNode || hoveredNode) && (
          <div className={`absolute bottom-4 left-4 right-4 backdrop-blur-md rounded-lg p-4 text-sm z-10 transition-all duration-300 shadow-2xl border ${
            mythMode ? 'bg-[#080d15]/90 border-rune/45' : 'bg-[#0b0e14]/90 border-gold/45'
          }`}>
            {selectedNode ? (
              <div>
                <div className="flex justify-between items-start mb-1">
                  <span className={`font-bold font-medieval uppercase tracking-wider text-[10px] ${mythMode ? 'text-rune' : 'text-gold'}`}>
                    {selectedNode.type.replace('_', ' ')}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedNode(null);
                      onSelectEntity(null);
                    }}
                    className="text-xs text-foreground/50 hover:text-foreground font-medieval"
                  >
                    ✕ Clear
                  </button>
                </div>
                <h4 className={`font-decorative font-bold text-base mb-1.5 flex items-center gap-1.5 ${
                  mythMode ? 'text-rune glow-rune' : 'text-gold glow-gold'
                }`}>
                  {selectedNode.name}
                  {selectedNode.title && (
                    <span className="text-xs text-foreground/50 font-sans">({selectedNode.title})</span>
                  )}
                  {selectedNode.isMythological && <Sparkles className="w-4 h-4 text-rune" />}
                </h4>
                <p className="text-xs text-foreground/80 leading-relaxed font-sans">
                  {selectedNode.description}
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <HelpCircle className={`w-4 h-4 ${mythMode ? 'text-rune' : 'text-gold'}`} />
                <span className="font-semibold text-foreground">{hoveredNode?.name}</span>
                <span className="text-xs text-foreground/50 font-medieval uppercase tracking-wider">
                  ({hoveredNode?.type.replace('_', ' ')}) • Click to select
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* D3 Graph Legend */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-3 pt-3 border-t border-white/5 text-[10px] text-foreground/60 font-medieval uppercase tracking-wider">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#064e3b] inline-block border border-white/10"></span>
          <span>Kings</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#2e1065] inline-block border border-white/10"></span>
          <span>Deities</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#78350f] inline-block border border-white/10"></span>
          <span>Explorers</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-[#38bdf8] inline-block mr-1"></span>
          <span>Parentage</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-[#d4af37] inline-block mr-1"></span>
          <span>Succession</span>
        </div>
      </div>
    </div>
  );
}
