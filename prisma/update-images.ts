import { prisma } from '../src/lib/db';

async function main() {
  console.log('Upserting missing entities from the markdowns...');
  
  const missingEntities = [
    {
      name: 'Surtr',
      title: 'Ruler of Muspelheim',
      type: 'monster',
      description: 'The primordial fire giant who guards Muspelheim. Destined to lead the sons of Muspel to burn the world during Ragnarök.',
      isMythological: true,
      image: '/viking-atlas/char_surtr.jpg'
    },
    {
      name: 'Heimdall',
      title: 'The White God / Guardian of Asgard',
      type: 'mythological_god',
      description: 'The watchman of the gods who guards the rainbow Bifröst bridge. He possesses golden teeth and has ears that can hear grass grow.',
      isMythological: true,
      image: '/viking-atlas/char_heimdall.jpg'
    },
    {
      name: 'Björn Ironside',
      title: 'King of Sweden',
      type: 'historical_king',
      description: 'The legendary son of Ragnar Lodbrok who raided the Mediterranean and founded the Swedish Munsö dynasty.',
      isMythological: true,
      image: '/viking-atlas/char_bjorn_ironside.jpg',
      reignStart: 865,
      reignEnd: 880
    },
    {
      name: 'Olof Skötkonung',
      title: 'First Christian King of Sweden',
      type: 'historical_king',
      description: 'Son of Eric the Victorious. He was the first Swedish king to be baptized and mint coins, and allied with Sweyn Forkbeard against Olaf Tryggvason at Svolder.',
      isMythological: false,
      image: '/viking-atlas/char_olof_skotkonung.jpg',
      reignStart: 995,
      reignEnd: 1022
    },
    {
      name: 'Eric the Victorious',
      title: 'First King of United Sweden',
      type: 'historical_king',
      description: 'Sweden’s first historically verified king. He defeated his nephew Styrbjörn at the Battle of Fyrisvellir.',
      isMythological: false,
      image: '/viking-atlas/char_eric_victorious.jpg',
      reignStart: 970,
      reignEnd: 995
    },
    {
      name: 'Ingólfur Arnarson',
      title: 'First Settler of Iceland',
      type: 'explorer',
      description: 'A Norwegian chieftain who fled the tyranny of Harald Fairhair and founded the first permanent settlement in Iceland at Reykjavík in 874 AD.',
      isMythological: false,
      image: '/viking-atlas/char_ingolfur.jpg'
    },
    {
      name: 'Styrbjörn the Strong',
      title: 'The Swedish Challenger',
      type: 'explorer',
      description: 'A legendary Swedish prince who became leader of the Jomsvikings and challenged Eric the Victorious at Fyrisvellir.',
      isMythological: true,
      image: '/viking-atlas/char_styrbjorn.jpg'
    }
  ];

  for (const ent of missingEntities) {
    const existing = await prisma.entity.findFirst({
      where: { name: { equals: ent.name, mode: 'insensitive' } }
    });
    if (!existing) {
      const created = await prisma.entity.create({
        data: {
          name: ent.name,
          title: ent.title,
          type: ent.type,
          description: ent.description,
          isMythological: ent.isMythological,
          profileImageUrl: ent.image,
          reignStart: ent.reignStart ?? null,
          reignEnd: ent.reignEnd ?? null
        }
      });
      console.log(`Created missing entity ${created.name} in DB`);
    } else {
      await prisma.entity.update({
        where: { id: existing.id },
        data: {
          profileImageUrl: ent.image,
          title: ent.title,
          description: ent.description,
          reignStart: ent.reignStart ?? null,
          reignEnd: ent.reignEnd ?? null
        }
      });
      console.log(`Updated entity ${existing.name} with image ${ent.image}`);
    }
  }

  console.log('Establishing missing relationships...');
  const missingRelationships = [
    { from: 'Ragnar Lodbrok', to: 'Björn Ironside', type: 'parent_of', desc: 'Ragnar is the father of Björn Ironside', isMythological: true },
    { from: 'Eric the Victorious', to: 'Olof Skötkonung', type: 'parent_of', desc: 'Eric is the father of Olof Skötkonung', isMythological: false },
    { from: 'Eric the Victorious', to: 'Styrbjörn the Strong', type: 'rivals', desc: 'Eric defeated his nephew Styrbjörn at Fyrisvellir', isMythological: true }
  ];

  for (const rel of missingRelationships) {
    const fromEnt = await prisma.entity.findFirst({ where: { name: { equals: rel.from, mode: 'insensitive' } } });
    const toEnt = await prisma.entity.findFirst({ where: { name: { equals: rel.to, mode: 'insensitive' } } });
    if (fromEnt && toEnt) {
      const existingRel = await prisma.relationship.findFirst({
        where: {
          fromEntityId: fromEnt.id,
          toEntityId: toEnt.id,
          relationType: rel.type
        }
      });
      if (!existingRel) {
        await prisma.relationship.create({
          data: {
            fromEntityId: fromEnt.id,
            toEntityId: toEnt.id,
            relationType: rel.type,
            description: rel.desc,
            isMythological: rel.isMythological
          }
        });
        console.log(`Created relationship ${rel.from} -> ${rel.type} -> ${rel.to}`);
      }
    }
  }

  console.log('Updating entity profile image URLs...');
  
  const updates = [
    { name: 'Odin', image: '/viking-atlas/portrait_odin.jpg' },
    { name: 'Thor', image: '/viking-atlas/portrait_thor.jpg' },
    { name: 'Loki', image: '/viking-atlas/char_loki.jpg' },
    { name: 'Freyja', image: '/viking-atlas/char_freyja.jpg' },
    { name: 'Frigg', image: '/viking-atlas/char_frigg.jpg' },
    { name: 'Freyr', image: '/viking-atlas/char_freyr.jpg' },
    { name: 'Baldr', image: '/viking-atlas/char_baldr.jpg' },
    { name: 'Hel', image: '/viking-atlas/char_hel.jpg' },
    { name: 'Fenrir', image: '/viking-atlas/char_fenrir.jpg' },
    { name: 'Jörmungandr', image: '/viking-atlas/char_jormungandr.jpg' },
    { name: 'Harald Fairhair', image: '/viking-atlas/char_harald_fairhair.jpg' },
    { name: 'Saint Olaf', image: '/viking-atlas/char_saint_olaf.jpg' },
    { name: 'Harald Hardrada', image: '/viking-atlas/char_harald_hardrada.jpg' },
    { name: 'Leif Erikson', image: '/viking-atlas/char_leif_erikson.jpg' },
    { name: 'Erik the Red', image: '/viking-atlas/event_greenland.jpg' },
    { name: 'Cnut the Great', image: '/viking-atlas/char_canute.jpg' },
    { name: 'Ragnar Lodbrok', image: '/viking-atlas/char_ragnar.jpg' },
    { name: 'Yngvi-Freyr', image: '/viking-atlas/char_freyr.jpg' },
    { name: 'Sigurd Snake-in-the-Eye', image: '/viking-atlas/char_sigurd_snake_eye.jpg' },
    { name: 'Sweyn Forkbeard', image: '/viking-atlas/char_sweyn_forkbeard.jpg' },
    { name: 'Haakon the Good', image: '/viking-atlas/char_haakon_good.jpg' },
    { name: 'Eric Bloodaxe', image: '/viking-atlas/char_eric_bloodaxe.jpg' },
    { name: 'Hakon Jarl', image: '/viking-atlas/char_hakon_jarl.jpg' },
    { name: 'Olaf Tryggvason', image: '/viking-atlas/char_olaf_tryggvason.jpg' }
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
      console.log(`Updated entity ${entity.name} with ${item.image}`);
    }
  }

  console.log('Updating event media URLs...');
  const eventUpdates = [
    { title: 'Lindisfarne', image: '/viking-atlas/event_lindisfarne.jpg' },
    { title: 'Greenland', image: '/viking-atlas/event_greenland.jpg' },
    { title: 'Uppsala', image: '/viking-atlas/event_uppsala.jpg' },
    { title: 'Hafrsfjord', image: '/viking-atlas/event_hafrsfjord.jpg' },
    { title: 'Iceland', image: '/viking-atlas/event_thingvellir.jpg' },
    { title: 'Fyrisvellir', image: '/viking-atlas/event_uppsala.jpg' },
    { title: 'Svolder', image: '/viking-atlas/event_svolder.jpg' },
    { title: 'Conversion of Iceland', image: '/viking-atlas/event_thingvellir.jpg' },
    { title: 'Helgeå', image: '/viking-atlas/event_jelling.jpg' },
    { title: 'Stiklestad', image: '/viking-atlas/event_stiklestad.jpg' },
    { title: 'Stamford Bridge', image: '/viking-atlas/event_stamford.jpg' },
    { title: 'Baldr', image: '/viking-atlas/char_baldr.jpg' }
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

  console.log('Upserting location media URLs (realms and historic cities)...');
  const locationUpdates = [
    // Realms
    { name: 'Asgard', image: '/viking-atlas/map_asgard.jpg', isMythological: true, type: 'mythical_realm', desc: 'The sky-citadel of the Æsir gods, containing Valhalla.' },
    { name: 'Jotunheim', image: '/viking-atlas/map_jotunheim.jpg', isMythological: true, type: 'mythical_realm', desc: 'The realm of frost giants, a place of freezing winds and jagged peaks.' },
    { name: 'Muspelheim', image: '/viking-atlas/map_muspelheim.jpg', isMythological: true, type: 'mythical_realm', desc: 'The primordial southern realm of fire and soot, ruled by Surtr.' },
    { name: 'Midgard', image: '/viking-atlas/map_midgard.jpg', isMythological: true, type: 'mythical_realm', desc: 'The mortal world of humanity, represented as a circle of green coastlines and oceans linked to history.' },
    { name: 'Helheim', image: '/viking-atlas/map_helheim.jpg', isMythological: true, type: 'mythical_realm', desc: 'The cold underworld of the dead who died of old age or sickness.' },
    { name: 'Vanaheim', image: '/viking-atlas/map_vanaheim.jpg', isMythological: true, type: 'mythical_realm', desc: 'The verdant homeland of the fertility-controlling Vanir gods.' },
    { name: 'Alfheim', image: '/viking-atlas/map_alfheim.jpg', isMythological: true, type: 'mythical_realm', desc: 'The ethereal forest kingdom of the light elves.' },
    { name: 'Svartalfheim', image: '/viking-atlas/map_svartalfheim.jpg', isMythological: true, type: 'mythical_realm', desc: 'The subterranean mountain forge of the dwarves.' },
    { name: 'Niflheim', image: '/viking-atlas/map_niflheim.jpg', isMythological: true, type: 'mythical_realm', desc: 'The dark, frozen mist realm of ice rivers.' },
    { name: 'Urðarbrunnr', image: '/viking-atlas/map_urdarbrunnr.jpg', isMythological: true, type: 'mythical_realm', desc: 'The Well of Urd at the roots of Yggdrasil, where the Norns weave fates.' },
    
    // Historic Places
    { name: 'Trondheim (Nidaros)', image: '/viking-atlas/event_nidaros.jpg', isMythological: false, type: 'city', desc: 'Founded by Olaf Tryggvason in 997 AD, it served as Norway’s first capital.' },
    { name: 'Stiklestad', image: '/viking-atlas/event_stiklestad.jpg', isMythological: false, type: 'battle_site', desc: 'The historic battlefield where Saint Olaf was killed in 1030 AD.' },
    { name: 'Gamla Uppsala', image: '/viking-atlas/event_uppsala.jpg', isMythological: false, type: 'sacred_site', desc: 'The spiritual heart of Swedish paganism, famous for its golden temple.' },
    { name: 'Jelling', image: '/viking-atlas/event_jelling.jpg', isMythological: false, type: 'city', desc: 'The seat of the early Danish kings Gorm the Old and Harald Bluetooth.' },
    { name: 'Lejre', image: '/viking-atlas/event_lejre.jpg', isMythological: false, type: 'city', desc: 'The legendary capital of the Danish Skjöldungs, traditional location of Heorot.' },
    { name: 'Þingvellir (Thingvellir)', image: '/viking-atlas/event_thingvellir.jpg', isMythological: false, type: 'sacred_site', desc: 'The volcanic assembly site of the Icelandic Althing.' },
    { name: 'Dublin (Dyflin)', image: '/viking-atlas/event_dublin.jpg', isMythological: false, type: 'city', desc: 'A major Norse-Gaelic trade capital and fortress founded in 841 AD.' },
    { name: 'York (Jórvík)', image: '/viking-atlas/event_york.jpg', isMythological: false, type: 'city', desc: 'The capital of the Viking kingdom of Jórvík and the Danelaw.' },
    { name: 'Lindisfarne', image: '/viking-atlas/event_lindisfarne.jpg', isMythological: false, type: 'sacred_site', desc: 'The holy island whose monastery raid in 793 AD marks the start of the Viking Age.' },
    { name: 'Stamford Bridge', image: '/viking-atlas/event_stamford.jpg', isMythological: false, type: 'battle_site', desc: 'The battlefield where Harald Hardrada was slain in 1066 AD.' }
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
