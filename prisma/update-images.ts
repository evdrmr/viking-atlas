import { prisma } from '../src/lib/db';

async function main() {
  console.log('Updating entity profile image URLs...');
  
  const updates = [
    { name: 'Odin', image: '/viking-atlas/portrait_odin.jpg' },
    { name: 'Thor', image: '/viking-atlas/portrait_thor.jpg' },
    { name: 'Loki', image: '/viking-atlas/char_loki.jpg' },
    { name: 'Freyja', image: '/viking-atlas/char_freyja.jpg' },
    { name: 'Surtr', image: '/viking-atlas/char_surtr.jpg' },
    { name: 'Harald Fairhair', image: '/viking-atlas/char_harald_fairhair.jpg' },
    { name: 'Saint Olaf', image: '/viking-atlas/char_saint_olaf.jpg' },
    { name: 'Harald Hardrada', image: '/viking-atlas/char_harald_hardrada.jpg' },
    { name: 'Leif Erikson', image: '/viking-atlas/char_leif_erikson.jpg' },
    { name: 'Erik the Red', image: '/viking-atlas/event_greenland.jpg' }
  ];

  for (const item of updates) {
    const entity = await prisma.entity.findFirst({
      where: { name: { contains: item.name, mode: 'insensitive' } }
    });
    if (entity) {
      await prisma.entity.update({
        where: { id: entity.id },
        data: { profileImageUrl: item.image }
      });
      console.log(`Updated ${entity.name} with ${item.image}`);
    }
  }

  console.log('Updating event media URLs...');
  const eventUpdates = [
    { title: 'Lindisfarne', image: '/viking-atlas/event_lindisfarne.jpg' },
    { title: 'Greenland', image: '/viking-atlas/event_greenland.jpg' },
    { title: 'Uppsala', image: '/viking-atlas/event_uppsala.jpg' }
  ];

  for (const item of eventUpdates) {
    const events = await prisma.event.findMany({
      where: { title: { contains: item.title, mode: 'insensitive' } }
    });
    for (const ev of events) {
      await prisma.event.update({
        where: { id: ev.id },
        data: { mediaUrl: item.image }
      });
      console.log(`Updated event "${ev.title}" with ${item.image}`);
    }
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
