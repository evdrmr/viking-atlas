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
    { name: 'Erik the Red', image: '/viking-atlas/event_greenland.jpg' },
    { name: 'Canute the Great', image: '/viking-atlas/char_canute.jpg' },
    { name: 'Ragnar Lothbrok', image: '/viking-atlas/char_ragnar.jpg' }
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

  console.log('Upserting location media URLs (realms)...');
  const locationUpdates = [
    { name: 'Asgard', image: '/viking-atlas/map_asgard.jpg', isMythological: true, type: 'mythical_realm', desc: 'The sky-citadel of the Æsir gods, containing Valhalla.' },
    { name: 'Jotunheim', image: '/viking-atlas/map_jotunheim.jpg', isMythological: true, type: 'mythical_realm', desc: 'The realm of frost giants, a place of freezing winds and jagged peaks.' },
    { name: 'Muspelheim', image: '/viking-atlas/map_muspelheim.jpg', isMythological: true, type: 'mythical_realm', desc: 'The primordial southern realm of fire and soot, ruled by Surtr.' },
    { name: 'Midgard', image: '/viking-atlas/map_midgard.jpg', isMythological: true, type: 'mythical_realm', desc: 'The mortal world of humanity, represented as a circle of green coastlines and oceans linked to history.' }
  ];

  for (const item of locationUpdates) {
    const loc = await prisma.location.findFirst({
      where: { name: { equals: item.name, mode: 'insensitive' } }
    });
    if (loc) {
      await prisma.location.update({
        where: { id: loc.id },
        data: { mediaUrl: item.image, description: item.desc }
      });
      console.log(`Updated location ${loc.name} with image ${item.image}`);
    } else {
      const created = await prisma.location.create({
        data: {
          name: item.name,
          type: item.type,
          description: item.desc,
          isMythological: item.isMythological,
          mediaUrl: item.image
        }
      });
      console.log(`Created location ${created.name} with image ${item.image}`);
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
