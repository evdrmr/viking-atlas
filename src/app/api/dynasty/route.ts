import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const [entities, relationships] = await Promise.all([
      prisma.entity.findMany({
        include: {
          capital: true,
          burial: true,
        },
      }),
      prisma.relationship.findMany(),
    ]);

    return NextResponse.json({
      nodes: entities,
      links: relationships.map((rel) => ({
        id: rel.id,
        source: rel.fromEntityId,
        target: rel.toEntityId,
        type: rel.relationType,
        description: rel.description,
        isMythological: rel.isMythological,
      })),
    });
  } catch (error) {
    console.error('Failed to fetch dynasty graph data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dynasty graph data' },
      { status: 500 }
    );
  }
}
