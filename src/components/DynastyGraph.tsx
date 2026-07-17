'use client';

import React, { useEffect, useState, useRef } from 'react';
import { GitFork, Heart, Shield, HelpCircle, Sparkles } from 'lucide-react';
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
        const res = await fetch('/api/dynasty');
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

    // Deep copy links to avoid mutating state and map objects
    const filteredLinks = data.links
      .filter((l) => {
        const sId = typeof l.source === 'object' ? l.source.id : l.source;
        const tId = typeof l.target === 'object' ? l.target.id : l.target;
        return filteredNodeIds.has(sId) && filteredNodeIds.has(tId);
      })
      .map((l) => ({
        ...l,
        source: typeof l.source === 'object' ? l.source.id : l.source,
        target: typeof l.target === 'object' ? l.target.id : l.target,
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
      .attr('refX', 22) // Position relative to node center (node radius is 15)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-4L10,0L0,4')
      .attr('fill', (d) => (d === 'successor_of' ? '#C8A261' : '#4d9fff'))
      .attr('opacity', 0.6);

    const gContainer = svg.append('g');

    // Add zoom behavior
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on('zoom', (event) => {
        gContainer.attr('transform', event.transform);
      });
    svg.call(zoom);

    // Setup Force Simulation
    const simulation = d3
      .forceSimulation<EntityNode>(filteredNodes)
      .force(
        'link',
        d3
          .forceLink<EntityNode, RelationshipLink>(filteredLinks)
          .id((d) => d.id)
          .distance(90)
      )
      .force('charge', d3.forceManyBody().strength(-150))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(25));

    // Draw links (relationships)
    const link = gContainer
      .append('g')
      .selectAll('line')
      .data(filteredLinks)
      .enter()
      .append('line')
      .attr('stroke', (d) => {
        if (d.type === 'spouse_of') return '#ff66b2';
        if (d.type === 'successor_of') return '#C8A261';
        return '#4d9fff'; // parent_of
      })
      .attr('stroke-width', (d) => (d.type === 'successor_of' ? 2 : 1.2))
      .attr('stroke-dasharray', (d) => (d.type === 'spouse_of' ? '3 3' : 'none'))
      .attr('stroke-opacity', 0.5)
      .attr('marker-end', (d) => (d.type === 'spouse_of' ? 'none' : `url(#arrow-${d.type})`));

    // Draw nodes (entities)
    const node = gContainer
      .append('g')
      .selectAll('g')
      .data(filteredNodes)
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

    // Node shape circles
    node
      .append('circle')
      .attr('r', 15)
      .attr('fill', (d) => {
        if (d.isMythological) return '#4a154b'; // Purple for mythological gods
        if (d.type === 'historical_king') return '#152e1f'; // Deep green for kings
        if (d.type === 'explorer') return '#5d4037'; // Brown for explorers
        return '#8b0000'; // Red for monsters
      })
      .attr('stroke', (d) => {
        // Highlight active entity
        if (selectedEntity && d.name.toLowerCase().includes(selectedEntity.toLowerCase())) {
          return '#C8A261';
        }
        return '#ffffff';
      })
      .attr('stroke-width', (d) => {
        if (selectedEntity && d.name.toLowerCase().includes(selectedEntity.toLowerCase())) {
          return 3;
        }
        return 1.2;
      })
      .attr('stroke-opacity', 0.85);

    // Node labels (Text name)
    node
      .append('text')
      .attr('dx', 18)
      .attr('dy', 4)
      .attr('font-size', '10px')
      .attr('font-family', 'sans-serif')
      .attr('fill', '#E5EAEF')
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
    <div className="relative w-full h-[550px] bg-background border border-card/40 rounded-lg p-4 overflow-hidden shadow-2xl flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-2 z-10">
        <div className="flex items-center gap-2">
          <GitFork className={`w-5 h-5 ${mythMode ? 'text-rune' : 'text-gold'}`} />
          <h2 className="text-lg font-bold tracking-wide uppercase">
            {mythMode ? 'Unified Dynastic & God Graph' : 'Historical Succession & Lineages'}
          </h2>
        </div>
        <div className="text-xs text-foreground/50">
          Drag nodes to arrange • Drag canvas to pan • Scroll to zoom
        </div>
      </div>

      {/* SVG Canvas for D3 */}
      <div className="relative flex-grow border border-card/50 rounded overflow-hidden bg-[#0a0d13]">
        <svg ref={svgRef} viewBox="0 0 800 500" className="w-full h-full select-none" />

        {/* Hover/Selection Inset Info Panel */}
        {(selectedNode || hoveredNode) && (
          <div className="absolute bottom-4 left-4 right-4 bg-card/90 backdrop-blur-md border border-gold/30 rounded p-3 text-sm transition-all duration-300 z-10">
            {selectedNode ? (
              <div>
                <div className="flex justify-between items-start mb-1">
                  <span className="font-bold text-gold uppercase tracking-wider text-xs">
                    {selectedNode.type.replace('_', ' ')}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedNode(null);
                      onSelectEntity(null);
                    }}
                    className="text-xs text-foreground/50 hover:text-foreground"
                  >
                    ✕ Clear Selection
                  </button>
                </div>
                <h4 className="font-serif font-bold text-base mb-1 flex items-center gap-1.5">
                  {selectedNode.name}
                  {selectedNode.title && (
                    <span className="text-xs text-foreground/60">({selectedNode.title})</span>
                  )}
                  {selectedNode.isMythological && <Sparkles className="w-4 h-4 text-rune" />}
                </h4>
                <p className="text-xs text-foreground/80 leading-relaxed">
                  {selectedNode.description}
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-gold" />
                <span className="font-medium text-foreground">{hoveredNode?.name}</span>
                <span className="text-xs text-foreground/60">
                  ({hoveredNode?.type.replace('_', ' ')}) • Click to select
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* D3 Graph Legend */}
      <div className="grid grid-cols-5 gap-2 mt-2 pt-2 border-t border-card/40 text-[10px] text-foreground/60">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#152e1f] inline-block border border-white/20"></span>
          <span>Historic Kings</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#4a154b] inline-block border border-white/20"></span>
          <span>Mythic Gods (Æsir/Vanir)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#5d4037] inline-block border border-white/20"></span>
          <span>Explorers</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-[#4d9fff] inline-block mr-1"></span>
          <span>Parentage</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-[#C8A261] inline-block mr-1"></span>
          <span>Succession</span>
        </div>
      </div>
    </div>
  );
}
