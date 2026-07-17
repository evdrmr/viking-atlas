import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const [locations, routes] = await Promise.all([
      prisma.location.findMany(),
      prisma.route.findMany({
        include: {
          explorer: true,
        },
      }),
    ]);

    const formattedRoutes = routes.map((r) => ({
      id: r.id,
      name: r.name,
      explorerId: r.explorerId,
      explorer: r.explorer,
      startYear: r.startYear,
      endYear: r.endYear,
      isMythological: r.isMythological,
      description: r.description,
      path: r.pathPoints.split(';').map((p) => {
        const [lat, lon] = p.split(',').map(Number);
        return { lat, lon };
      }),
    }));

    return NextResponse.json({
      locations,
      routes: formattedRoutes,
    });
  } catch (error) {
    console.error('Failed to fetch geography data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch geography data' },
      { status: 500 }
    );
  }
}
