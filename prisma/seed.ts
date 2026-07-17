import { prisma } from '../src/lib/db';

async function main() {
  console.log('Clearing database...');
  await prisma.relationship.deleteMany();
  await prisma.route.deleteMany();
  await prisma.event.deleteMany();
  await prisma.entity.deleteMany();
  await prisma.location.deleteMany();

  console.log('Seeding locations...');
  const locationsData = [
    // Real locations
    { name: 'Trondheim (Nidaros)', type: 'city', description: 'Founded by Olaf Tryggvason in 997 AD, it served as Norway’s first capital. Nidaros Cathedral was built over the burial site of Saint Olaf.', latitude: 63.4305, longitude: 10.3951, isMythological: false },
    { name: 'Stiklestad', type: 'battle_site', description: 'The historic battlefield where Saint Olaf was killed in 1030 AD, cementing the Christianization of Norway.', latitude: 63.7972, longitude: 11.5644, isMythological: false },
    { name: 'Gamla Uppsala', type: 'sacred_site', description: 'The spiritual heart of Swedish paganism, famous for its golden temple, sacred grove, and royal burial mounds.', latitude: 59.8979, longitude: 17.6322, isMythological: false },
    { name: 'Sigtuna', type: 'city', description: 'Founded around 980 AD by Eric the Victorious, it became Sweden’s first Christian royal town to counter pagan Uppsala.', latitude: 59.6173, longitude: 17.7237, isMythological: false },
    { name: 'Jelling', type: 'city', description: 'The seat of the early Danish kings Gorm the Old and Harald Bluetooth, site of the famous Jelling runestones.', latitude: 55.7564, longitude: 9.4215, isMythological: false },
    { name: 'Lejre', type: 'city', description: 'The legendary capital of the Danish Skjöldungs, traditional location of the grand hall Heorot from Beowulf.', latitude: 55.6048, longitude: 11.9740, isMythological: false },
    { name: 'Þingvellir (Thingvellir)', type: 'sacred_site', description: 'The volcanic assembly site of the Icelandic Althing, where Iceland adopted Christianity in 1000 AD.', latitude: 64.2559, longitude: -21.1296, isMythological: false },
    { name: 'Reykjavík', type: 'city', description: 'The homestead of Ingólfur Arnarson, who established Iceland’s first permanent settlement in 874 AD.', latitude: 64.1466, longitude: -21.9426, isMythological: false },
    { name: 'Brattahlíð', type: 'city', description: 'Erik the Red’s estate in southern Greenland, site of the first Christian chapel in the Americas.', latitude: 61.1566, longitude: -45.5204, isMythological: false },
    { name: 'Garðar', type: 'city', description: 'The religious heart of Greenland, eventually becoming the seat of the Norse bishop of Greenland.', latitude: 60.9833, longitude: -45.4167, isMythological: false },
    { name: 'Dublin (Dyflin)', type: 'city', description: 'A major Norse-Gaelic trade capital and fortress founded by Viking raiders in 841 AD.', latitude: 53.3498, longitude: -6.2603, isMythological: false },
    { name: 'York (Jórvík)', type: 'city', description: 'The capital of the Viking kingdom of Jórvík and the Danelaw in Anglo-Saxon England.', latitude: 53.9598, longitude: -1.0873, isMythological: false },
    { name: 'Lindisfarne', type: 'sacred_site', description: 'The holy island whose monastery raid in 793 AD traditionally marks the start of the Viking Age.', latitude: 55.6792, longitude: -1.8021, isMythological: false },
    { name: 'Stamford Bridge', type: 'battle_site', description: 'The battlefield where Harald Hardrada was slain in 1066 AD, marking the end of the Viking Age.', latitude: 53.9882, longitude: -0.9103, isMythological: false },
    { name: 'Stainmore', type: 'battle_site', description: 'The lonely pass in Westmorland where the exiled Eric Bloodaxe was ambushed and slain in 954 AD.', latitude: 54.5167, longitude: -2.2167, isMythological: false },
    
    // Mythological locations
    { name: 'Asgard', type: 'mythical_realm', description: 'The sky-citadel of the Æsir gods, containing Valhalla.', latitude: null, longitude: null, isMythological: true },
    { name: 'Vanaheim', type: 'mythical_realm', description: 'The verdant homeland of the fertility-controlling Vanir gods.', latitude: null, longitude: null, isMythological: true },
    { name: 'Muspelheim', type: 'mythical_realm', description: 'The primordial southern realm of fire and soot, ruled by Surtr.', latitude: null, longitude: null, isMythological: true },
    { name: 'Helheim', type: 'mythical_realm', description: 'The cold underworld of the dead who died of old age or sickness.', latitude: null, longitude: null, isMythological: true },
    { name: 'Urðarbrunnr', type: 'mythical_realm', description: 'The Well of Urd at the roots of Yggdrasil, where the Norns weave fates.', latitude: null, longitude: null, isMythological: true }
  ];

  const locationsMap: Record<string, any> = {};
  for (const loc of locationsData) {
    const created = await prisma.location.create({ data: loc });
    locationsMap[created.name] = created;
  }

  console.log('Seeding entities...');
  const entitiesData = [
    // 1. Mythological deities
    { name: 'Odin', title: 'The Allfather', type: 'mythological_god', description: 'Ruler of Asgard. God of war, wisdom, death, and poetry.', isMythological: true, capitalName: 'Asgard', burialName: null },
    { name: 'Frigg', title: 'Queen of Asgard', type: 'mythological_god', description: 'Goddess of motherhood, foresight, and marriage. Odin’s wife.', isMythological: true, capitalName: 'Asgard', burialName: null },
    { name: 'Thor', title: 'The Thunderer', type: 'mythological_god', description: 'Odin’s son. Defender of humanity. Wielder of Mjölnir.', isMythological: true, capitalName: 'Asgard', burialName: null },
    { name: 'Baldr', title: 'The Bright God', type: 'mythological_god', description: 'God of light, beauty, and peace. Slain by a mistletoe dart.', isMythological: true, capitalName: 'Asgard', burialName: 'Helheim' },
    { name: 'Loki', title: 'The Trickster', type: 'mythological_god', description: 'Shape-shifting catalyst of chaos and blood-brother to Odin.', isMythological: true, capitalName: null, burialName: null },
    { name: 'Fenrir', title: 'The Wolf of Chaos', type: 'monster', description: 'Monstrous wolf destined to swallow Odin at Ragnarök.', isMythological: true, capitalName: null, burialName: null },
    { name: 'Jörmungandr', title: 'The Midgard Serpent', type: 'monster', description: 'World-encircling sea serpent, destined to slay Thor.', isMythological: true, capitalName: null, burialName: null },
    { name: 'Hel', title: 'Ruler of the Dead', type: 'mythological_god', description: 'Loki’s daughter, half-living and half-decayed queen of Helheim.', isMythological: true, capitalName: 'Helheim', burialName: null },
    { name: 'Njord', title: 'Lord of the Sea', type: 'mythological_god', description: 'Vanir sea god. Hostage to Asgard who secured the peace treaty.', isMythological: true, capitalName: 'Vanaheim', burialName: null },
    { name: 'Freyr', title: 'Lord of Alfheim', type: 'mythological_god', description: 'Son of Njord. God of agriculture and sunshine.', isMythological: true, capitalName: 'Vanaheim', burialName: null },
    { name: 'Freyja', title: 'Mistress of Magic', type: 'mythological_god', description: 'Daughter of Njord. Goddess of love, beauty, war, and Seiðr.', isMythological: true, capitalName: 'Asgard', burialName: null },
    { name: 'Sæming', title: 'First Jarl of Hålogaland', type: 'mythological_god', description: 'Son of Odin and Skadi; ancestor of the Lade Jarls.', isMythological: true, capitalName: 'Lade', burialName: null },

    // 2. Uppsala Yngling Line
    { name: 'Yngvi-Freyr', title: 'Founder of Uppsala', type: 'historical_king', description: 'God-king who founded Old Uppsala and Yngling dynasty.', reignStart: -100, reignEnd: -50, isMythological: true, capitalName: 'Gamla Uppsala', burialName: 'Gamla Uppsala' },
    { name: 'Fjölnir', title: 'King of Sweden', type: 'historical_king', description: 'Reigned in peace, drowned in a vat of mead in Zealand.', reignStart: -50, reignEnd: -20, isMythological: true, capitalName: 'Gamla Uppsala', burialName: 'Gamla Uppsala' },
    { name: 'Sveigðir', title: 'The Seeker', type: 'historical_king', description: 'Swore to find God-home, lured inside a giant stone by a dwarf.', reignStart: -20, reignEnd: 10, isMythological: true, capitalName: 'Gamla Uppsala', burialName: null },
    { name: 'Vanlandi', title: 'The Strangled', type: 'historical_king', description: 'Strangled in his sleep by a witch-summoned nightmare (mara).', reignStart: 10, reignEnd: 40, isMythological: true, capitalName: 'Gamla Uppsala', burialName: 'Gamla Uppsala' },
    { name: 'Visbur', title: 'The Burned', type: 'historical_king', description: 'Burned alive in his hall by his sons over a gold necklace.', reignStart: 40, reignEnd: 70, isMythological: true, capitalName: 'Gamla Uppsala', burialName: 'Gamla Uppsala' },
    { name: 'Domaldi', title: 'The Sacrificed', type: 'historical_king', description: 'Sacrificed by Swedish nobles to end a severe three-year famine.', reignStart: 70, reignEnd: 100, isMythological: true, capitalName: 'Gamla Uppsala', burialName: 'Gamla Uppsala' },
    { name: 'Domar', title: 'The Peaceful', type: 'historical_king', description: 'Reigned during a golden era of harvests; died of natural illness.', reignStart: 100, reignEnd: 130, isMythological: true, capitalName: 'Gamla Uppsala', burialName: 'Gamla Uppsala' },
    { name: 'Dyggvi', title: 'First Addressed as King', type: 'historical_king', description: 'The first Yngling ruler to assume the title of King.', reignStart: 130, reignEnd: 160, isMythological: true, capitalName: 'Gamla Uppsala', burialName: 'Gamla Uppsala' },
    { name: 'Dag the Wise', title: 'King of Sweden', type: 'historical_king', description: 'Understood birds; killed by a thrall’s pitchfork while raiding.', reignStart: 160, reignEnd: 190, isMythological: true, capitalName: 'Gamla Uppsala', burialName: 'Gamla Uppsala' },
    { name: 'Agni', title: 'The Hanged', type: 'historical_king', description: 'Hanged from a tree by his captive wife Skjálf using a gold torque.', reignStart: 190, reignEnd: 220, isMythological: true, capitalName: 'Gamla Uppsala', burialName: 'Gamla Uppsala' },
    { name: 'Alaric', title: 'Co-King of Sweden', type: 'historical_king', description: 'Killed his brother Eric with a bridle during a horse ride.', reignStart: 220, reignEnd: 250, isMythological: true, capitalName: 'Gamla Uppsala', burialName: 'Gamla Uppsala' },
    { name: 'Eric Agnesson', title: 'Co-King of Sweden', type: 'historical_king', description: 'Slain by his brother Alaric with a bridle during a horse ride.', reignStart: 220, reignEnd: 250, isMythological: true, capitalName: 'Gamla Uppsala', burialName: 'Gamla Uppsala' },
    { name: 'Yngvi Alaricson', title: 'Co-King of Sweden', type: 'historical_king', description: 'Slew his brother Alf in the hall out of marital jealousy.', reignStart: 250, reignEnd: 280, isMythological: true, capitalName: 'Gamla Uppsala', burialName: 'Gamla Uppsala' },
    { name: 'Alf', title: 'Co-King of Sweden', type: 'historical_king', description: 'Slew his brother Yngvi in the hall out of marital jealousy.', reignStart: 250, reignEnd: 280, isMythological: true, capitalName: 'Gamla Uppsala', burialName: 'Gamla Uppsala' },
    { name: 'Hugleik', title: 'King of Sweden', type: 'historical_king', description: 'A peaceful, wealthy king, slain when Danish sea-king Haki invaded.', reignStart: 280, reignEnd: 310, isMythological: true, capitalName: 'Gamla Uppsala', burialName: null },
    { name: 'Jörund', title: 'The Restorer', type: 'historical_king', description: 'Reclaimed Sweden, but was later captured and hanged in Denmark.', reignStart: 310, reignEnd: 340, isMythological: true, capitalName: 'Gamla Uppsala', burialName: null },
    { name: 'Aun the Old', title: 'The Longevity King', type: 'historical_king', description: 'Sacrificed nine of his sons to Odin to prolong his life.', reignStart: 340, reignEnd: 430, isMythological: true, capitalName: 'Gamla Uppsala', burialName: 'Gamla Uppsala' },
    { name: 'Egil', title: 'King of Sweden', type: 'historical_king', description: 'Fought thrall rebellion. Gored to death by a sacrificial bull.', reignStart: 430, reignEnd: 460, isMythological: true, capitalName: 'Gamla Uppsala', burialName: 'Gamla Uppsala' },
    { name: 'Ottar', title: 'Vendelcrow', type: 'historical_king', description: 'Fought the Danes. Slayed in Jutland; his body fed to crows.', reignStart: 460, reignEnd: 490, isMythological: true, capitalName: 'Gamla Uppsala', burialName: 'Gamla Uppsala' },
    { name: 'Adils', title: 'The Great', type: 'historical_king', description: 'Fought Geatish wars. Fell from horse and fractured skull.', reignStart: 490, reignEnd: 550, isMythological: true, capitalName: 'Gamla Uppsala', burialName: 'Gamla Uppsala' },
    { name: 'Eystein', title: 'King of Sweden', type: 'historical_king', description: 'Surprised by Danish sea-king Sölvi and burned alive in his hall.', reignStart: 550, reignEnd: 580, isMythological: true, capitalName: 'Gamla Uppsala', burialName: null },
    { name: 'Yngvar', title: 'The Harrier', type: 'historical_king', description: 'Slain in battle by Estonians during a Viking raid in Adalsysla.', reignStart: 580, reignEnd: 600, isMythological: true, capitalName: 'Gamla Uppsala', burialName: null },
    { name: 'Braut-Anund', title: 'The Road-Builder', type: 'historical_king', description: 'Cleared forests and built roads; buried in a landslide.', reignStart: 600, reignEnd: 630, isMythological: true, capitalName: 'Gamla Uppsala', burialName: null },
    { name: 'Ingjald', title: 'The Ill-Ruler', type: 'historical_king', description: 'Burned rival kings alive; committed suicide by burning his hall.', reignStart: 630, reignEnd: 640, isMythological: true, capitalName: 'Gamla Uppsala', burialName: 'Gamla Uppsala' },
    { name: 'Olaf Tree-Feller', title: 'The Forest Clearer', type: 'historical_king', description: 'Fled Sweden to Värmland. Sacrificed to Odin during a famine.', reignStart: 640, reignEnd: 670, isMythological: true, capitalName: null, burialName: null },

    // 3. Historical Kings of Norway
    { name: 'Halfdan Whiteleg', title: 'King of Vestfold & Solør', type: 'historical_king', description: 'First Yngling ruler in Norway; expanded territory. Died of old age.', reignStart: 710, reignEnd: 740, isMythological: false, capitalName: null, burialName: null },
    { name: 'Eystein Halfdansson', title: 'King of Vestfold', type: 'historical_king', description: 'Succeeded Halfdan; knocked overboard by a sail boom and drowned.', reignStart: 740, reignEnd: 770, isMythological: false, capitalName: null, burialName: null },
    { name: 'Halfdan the Mild', title: 'King of Vestfold', type: 'historical_king', description: 'Paid his men in gold but starved them of food; died of illness.', reignStart: 770, reignEnd: 800, isMythological: false, capitalName: null, burialName: null },
    { name: 'Gudrød the Hunter', title: 'King of Vestfold & Agder', type: 'historical_king', description: 'Wed Queen Åsa. Speared to death by Åsa’s servant to avenge her father.', reignStart: 800, reignEnd: 820, isMythological: false, capitalName: null, burialName: null },
    { name: 'Halfdan the Black', title: 'King of Vestfold', type: 'historical_king', description: 'Consolidated southeastern Norway. Sleigh broke through lake ice.', reignStart: 820, reignEnd: 860, isMythological: false, capitalName: null, burialName: null },
    { name: 'Harald Fairhair', title: 'First King of Unified Norway', type: 'historical_king', description: 'Sought Gyda’s hand; unified Norway at the Battle of Hafrsfjord.', reignStart: 872, reignEnd: 930, isMythological: false, capitalName: null, burialName: null },
    { name: 'Eric Bloodaxe', title: 'King of Norway & Jórvík', type: 'historical_king', description: 'Brutal son of Fairhair, murdered brothers, exiled to York; died in battle.', reignStart: 930, reignEnd: 934, isMythological: false, capitalName: 'York (Jórvík)', burialName: 'Stainmore' },
    { name: 'Haakon the Good', title: 'The beloved Christian King', type: 'historical_king', description: 'Raised in England, overthrew Bloodaxe; killed in battle.', reignStart: 934, reignEnd: 961, isMythological: false, capitalName: null, burialName: null },
    { name: 'Olaf Tryggvason', title: 'Olaf I of Norway', type: 'historical_king', description: 'Converted Norway, Iceland, and Greenland by force; fell at Svolder.', reignStart: 995, reignEnd: 1000, isMythological: false, capitalName: 'Trondheim (Nidaros)', burialName: null },
    { name: 'Saint Olaf', title: 'Olaf II / Patron Saint of Norway', type: 'historical_king', description: 'Slain at Stiklestad, patron saint. Enshrined in Nidaros Cathedral.', reignStart: 1015, reignEnd: 1028, isMythological: false, capitalName: 'Trondheim (Nidaros)', burialName: 'Trondheim (Nidaros)' },
    { name: 'Magnus the Good', title: 'Magnus I of Norway & Denmark', type: 'historical_king', description: 'Saint Olaf’s son. Reclaimed Norway from Denmark; joint-ruled Danes.', reignStart: 1035, reignEnd: 1047, isMythological: false, capitalName: 'Trondheim (Nidaros)', burialName: 'Trondheim (Nidaros)' },
    { name: 'Harald Hardrada', title: 'The Last Viking', type: 'historical_king', description: 'Varangian general, half-brother to Saint Olaf. Slain at Stamford Bridge.', reignStart: 1046, reignEnd: 1066, isMythological: false, capitalName: 'Trondheim (Nidaros)', burialName: 'Trondheim (Nidaros)' },

    // 4. Historical Kings of Denmark & England
    { name: 'Ragnar Lodbrok', title: 'Legendary Viking Chieftain', type: 'explorer', description: 'Executed in snake pit by King Ælla. Progenitor of Danish & Swedish houses.', isMythological: true, capitalName: null, burialName: null },
    { name: 'Sigurd Snake-in-the-Eye', title: 'King of Zealand & Scania', type: 'historical_king', description: 'Ragnar’s son. Born with snake mark in eye. Inherited Denmark.', reignStart: 865, reignEnd: 890, isMythological: true, capitalName: 'Lejre', burialName: null },
    { name: 'Gorm the Old', title: 'First Historical Danish King', type: 'historical_king', description: 'Pagan king, unified Denmark, established Jelling dynasty.', reignStart: 936, reignEnd: 958, isMythological: false, capitalName: 'Jelling', burialName: 'Jelling' },
    { name: 'Harald Bluetooth', title: 'King of Denmark & Norway', type: 'historical_king', description: 'Christianized Denmark, built massive ringforts; deposed by Sweyn.', reignStart: 958, reignEnd: 986, isMythological: false, capitalName: 'Jelling', burialName: 'Roskilde' },
    { name: 'Sweyn Forkbeard', title: 'King of Denmark, England & Norway', type: 'historical_king', description: 'Pagan rebel, conquered England, deposed Harald Bluetooth.', reignStart: 986, reignEnd: 1014, isMythological: false, capitalName: 'Jelling', burialName: 'Roskilde' },
    { name: 'Cnut the Great', title: 'Emperor of the North Sea', type: 'historical_king', description: 'Ruled Denmark, Norway, and England. Built North Sea Empire.', reignStart: 1016, reignEnd: 1035, isMythological: false, capitalName: 'London', burialName: 'Winchester' },

    // 5. Jarls of Lade
    { name: 'Hakon Grjótgarðsson', title: 'First Earl of Lade', type: 'historical_king', description: 'Allied with Harald Fairhair to secure Trøndelag’s autonomy.', reignStart: 890, reignEnd: 915, isMythological: false, capitalName: 'Lade', burialName: null },
    { name: 'Sigurd Hákonarson', title: 'Earl of Lade', type: 'historical_king', description: 'Beloved pagan earl, burned alive in his hall by Bloodaxe’s sons.', reignStart: 915, reignEnd: 962, isMythological: false, capitalName: 'Lade', burialName: null },
    { name: 'Hakon Jarl', title: 'De facto ruler of Norway', type: 'historical_king', description: 'Fierce pagan defender, ruled under Danes. Murdered in a pigsty.', reignStart: 975, reignEnd: 995, isMythological: false, capitalName: 'Lade', burialName: null },
    { name: 'Eric Haconarson', title: 'Earl of Lade', type: 'historical_king', description: 'Slew Tryggvason at Svolder. Ruled Norway as regent under Denmark.', reignStart: 1000, reignEnd: 1015, isMythological: false, capitalName: 'Lade', burialName: null },

    // 6. Explorers
    { name: 'Erik the Red', title: 'Founder of Greenland Colony', type: 'explorer', description: 'Exiled from Norway, then Iceland for manslaughter. Founded Greenland.', isMythological: false, capitalName: 'Brattahlíð', burialName: 'Brattahlíð' },
    { name: 'Leif Erikson', title: 'Discoverer of Vinland', type: 'explorer', description: 'Son of Erik. Converted to Christianity by Tryggvason. Sailed to America.', isMythological: false, capitalName: 'Brattahlíð', burialName: null }
  ];

  const entitiesMap: Record<string, any> = {};
  for (const ent of entitiesData) {
    const capitalLoc = ent.capitalName ? locationsMap[ent.capitalName] : null;
    const burialLoc = ent.burialName ? locationsMap[ent.burialName] : null;

    const created = await prisma.entity.create({
      data: {
        name: ent.name,
        title: ent.title,
        type: ent.type,
        description: ent.description,
        reignStart: ent.reignStart,
        reignEnd: ent.reignEnd,
        isMythological: ent.isMythological,
        capitalId: capitalLoc ? capitalLoc.id : null,
        burialId: burialLoc ? burialLoc.id : null
      }
    });
    entitiesMap[created.name] = created;
  }

  console.log('Seeding relationships...');
  const relationshipsData = [
    // Odin's mythological line
    { from: 'Odin', to: 'Thor', type: 'parent_of', isMythological: true },
    { from: 'Odin', to: 'Baldr', type: 'parent_of', isMythological: true },
    { from: 'Odin', to: 'Sæming', type: 'parent_of', isMythological: true },
    { from: 'Odin', to: 'Yngvi-Freyr', type: 'parent_of', isMythological: true },
    { from: 'Frigg', to: 'Baldr', type: 'parent_of', isMythological: true },
    { from: 'Njord', to: 'Freyr', type: 'parent_of', isMythological: true },
    { from: 'Njord', to: 'Freyja', type: 'parent_of', isMythological: true },
    
    // Loki's brood
    { from: 'Loki', to: 'Fenrir', type: 'parent_of', isMythological: true },
    { from: 'Loki', to: 'Jörmungandr', type: 'parent_of', isMythological: true },
    { from: 'Loki', to: 'Hel', type: 'parent_of', isMythological: true },

    // Yngling Line (Sweden)
    { from: 'Yngvi-Freyr', to: 'Fjölnir', type: 'parent_of', isMythological: true },
    { from: 'Fjölnir', to: 'Sveigðir', type: 'parent_of', isMythological: true },
    { from: 'Sveigðir', to: 'Vanlandi', type: 'parent_of', isMythological: true },
    { from: 'Vanlandi', to: 'Visbur', type: 'parent_of', isMythological: true },
    { from: 'Visbur', to: 'Domaldi', type: 'parent_of', isMythological: true },
    { from: 'Domaldi', to: 'Domar', type: 'parent_of', isMythological: true },
    { from: 'Domar', to: 'Dyggvi', type: 'parent_of', isMythological: true },
    { from: 'Dyggvi', to: 'Dag the Wise', type: 'parent_of', isMythological: true },
    { from: 'Dag the Wise', to: 'Agni', type: 'parent_of', isMythological: true },
    { from: 'Agni', to: 'Alaric', type: 'parent_of', isMythological: true },
    { from: 'Agni', to: 'Eric Agnesson', type: 'parent_of', isMythological: true },
    { from: 'Alaric', to: 'Yngvi Alaricson', type: 'parent_of', isMythological: true },
    { from: 'Alaric', to: 'Alf', type: 'parent_of', isMythological: true },
    { from: 'Alf', to: 'Hugleik', type: 'parent_of', isMythological: true },
    { from: 'Yngvi Alaricson', to: 'Jörund', type: 'parent_of', isMythological: true },
    { from: 'Jörund', to: 'Aun the Old', type: 'parent_of', isMythological: true },
    { from: 'Aun the Old', to: 'Egil', type: 'parent_of', isMythological: true },
    { from: 'Egil', to: 'Ottar', type: 'parent_of', isMythological: true },
    { from: 'Ottar', to: 'Adils', type: 'parent_of', isMythological: true },
    { from: 'Adils', to: 'Eystein', type: 'parent_of', isMythological: true },
    { from: 'Eystein', to: 'Yngvar', type: 'parent_of', isMythological: true },
    { from: 'Yngvar', to: 'Braut-Anund', type: 'parent_of', isMythological: true },
    { from: 'Braut-Anund', to: 'Ingjald', type: 'parent_of', isMythological: true },
    { from: 'Ingjald', to: 'Olaf Tree-Feller', type: 'parent_of', isMythological: true },

    // Ynglings in Norway
    { from: 'Olaf Tree-Feller', to: 'Halfdan Whiteleg', type: 'parent_of', isMythological: false },
    { from: 'Halfdan Whiteleg', to: 'Eystein Halfdansson', type: 'parent_of', isMythological: false },
    { from: 'Eystein Halfdansson', to: 'Halfdan the Mild', type: 'parent_of', isMythological: false },
    { from: 'Halfdan the Mild', to: 'Gudrød the Hunter', type: 'parent_of', isMythological: false },
    { from: 'Gudrød the Hunter', to: 'Halfdan the Black', type: 'parent_of', isMythological: false },
    { from: 'Halfdan the Black', to: 'Harald Fairhair', type: 'parent_of', isMythological: false },
    { from: 'Harald Fairhair', to: 'Eric Bloodaxe', type: 'parent_of', isMythological: false },
    { from: 'Harald Fairhair', to: 'Haakon the Good', type: 'parent_of', isMythological: false },

    // Norway Successions / Grandchildren
    { from: 'Harald Fairhair', to: 'Olaf Tryggvason', type: 'parent_of', description: 'Great-grandfather of Olaf Tryggvason via Olaf Haraldsson', isMythological: false },
    { from: 'Harald Fairhair', to: 'Saint Olaf', type: 'parent_of', description: 'Great-grandfather of Saint Olaf via Björn Farmann', isMythological: false },
    { from: 'Harald Fairhair', to: 'Harald Hardrada', type: 'parent_of', description: 'Great-grandfather of Hardrada via Sigurd Rise', isMythological: false },
    { from: 'Saint Olaf', to: 'Magnus the Good', type: 'parent_of', isMythological: false },

    // Ragnar Lodbrok / Danish lines
    { from: 'Ragnar Lodbrok', to: 'Sigurd Snake-in-the-Eye', type: 'parent_of', isMythological: true },
    { from: 'Sigurd Snake-in-the-Eye', to: 'Harthacnut I', type: 'parent_of', isMythological: true },
    { from: 'Harthacnut I', to: 'Gorm the Old', type: 'parent_of', isMythological: false },
    { from: 'Gorm the Old', to: 'Harald Bluetooth', type: 'parent_of', isMythological: false },
    { from: 'Harald Bluetooth', to: 'Sweyn Forkbeard', type: 'parent_of', isMythological: false },
    { from: 'Sweyn Forkbeard', to: 'Cnut the Great', type: 'parent_of', isMythological: false },

    // Jarls of Lade
    { from: 'Sæming', to: 'Hakon Grjótgarðsson', type: 'parent_of', description: 'Mythological ancestor', isMythological: true },
    { from: 'Hakon Grjótgarðsson', to: 'Sigurd Hákonarson', type: 'parent_of', isMythological: false },
    { from: 'Sigurd Hákonarson', to: 'Hakon Jarl', type: 'parent_of', isMythological: false },
    { from: 'Hakon Jarl', to: 'Eric Haconarson', type: 'parent_of', isMythological: false },

    // Explorers
    { from: 'Erik the Red', to: 'Leif Erikson', type: 'parent_of', isMythological: false },

    // Inter-dynasty marriages & alliances
    { from: 'Sigrid the Haughty', to: 'Olof Skötkonung', type: 'parent_of', description: 'Sigrid was Olof’s mother with Eric the Victorious', isMythological: false },
    { from: 'Sweyn Forkbeard', to: 'Cnut the Great', type: 'parent_of', description: 'Sweyn’s son with Sigrid the Haughty', isMythological: false }
  ];

  for (const rel of relationshipsData) {
    const fromEnt = entitiesMap[rel.from];
    const toEnt = entitiesMap[rel.to];

    if (fromEnt && toEnt) {
      await prisma.relationship.create({
        data: {
          fromEntityId: fromEnt.id,
          toEntityId: toEnt.id,
          relationType: rel.type,
          description: rel.description || null,
          isMythological: rel.isMythological
        }
      });
    }
  }

  console.log('Seeding events...');
  const eventsData = [
    { title: 'The Raid on Lindisfarne', type: 'battle', year: 793, description: 'Viking raiders attack the wealthy monastery on Lindisfarne Holy Island, marking the traditional beginning of the Viking Age.', locationName: 'Lindisfarne', isMythological: false },
    { title: 'The Battle of Hafrsfjord', type: 'battle', year: 872, description: 'Harald Fairhair wins a decisive naval battle, crushing rival petty kings to become the first King of unified Norway.', locationName: 'Trondheim (Nidaros)', isMythological: false },
    { title: 'First Settlement of Iceland', type: 'discovery', year: 874, description: 'Ingólfur Arnarson establishes the first permanent settlement in Iceland at Reykjavík, escaping blood feuds and Fairhair’s tyranny.', locationName: 'Reykjavík', isMythological: false },
    { title: 'Discovery of Greenland', type: 'discovery', year: 985, description: 'Exiled from Iceland, Erik the Red explores the west and founds the Greenland colony, naming it to attract settlers.', locationName: 'Brattahlíð', isMythological: false },
    { title: 'Battle of Fyrisvellir', type: 'battle', year: 984, description: 'Eric the Victorious defeats his nephew Styrbjörn the Strong and the Jomsvikings on the plains of Uppsala.', locationName: 'Gamla Uppsala', isMythological: false },
    { title: 'The Battle of Svolder', type: 'battle', year: 1000, description: 'King Olaf Tryggvason is ambushed by a coalition of Danish, Swedish, and Lade Jarl forces. Olaf leaps into the sea and vanishes.', locationName: 'Trondheim (Nidaros)', isMythological: false },
    { title: 'The Conversion of Iceland', type: 'religious_ritual', year: 1000, description: 'The Althing at Þingvellir decides that Iceland will officially adopt Christianity to prevent civil war.', locationName: 'Þingvellir (Thingvellir)', isMythological: false },
    { title: 'The Battle of Helgeå', type: 'battle', year: 1026, description: 'Cnut the Great defeats a joint Swedish and Norwegian fleet, securing Danish hegemony in the North Sea.', locationName: 'Jelling', isMythological: false },
    { title: 'The Battle of Stiklestad', type: 'battle', year: 1030, description: 'Saint Olaf is slain in battle against a peasant army allied with Cnut. In death, Olaf becomes Norway’s patron saint.', locationName: 'Stiklestad', isMythological: false },
    { title: 'The Battle of Stamford Bridge', type: 'battle', year: 1066, description: 'Harald Hardrada is slain by an arrow to the throat in Yorkshire, ending the age of Viking expansionism.', locationName: 'Stamford Bridge', isMythological: false },
    { title: 'Death of Baldr', type: 'religious_ritual', year: -1000, description: 'The blind god Höðr is tricked by Loki into slaying his brother Baldr with a mistletoe dart.', locationName: 'Asgard', isMythological: true }
  ];

  for (const ev of eventsData) {
    const loc = locationsMap[ev.locationName];
    await prisma.event.create({
      data: {
        title: ev.title,
        type: ev.type,
        year: ev.year,
        description: ev.description,
        locationId: loc ? loc.id : null,
        isMythological: ev.isMythological
      }
    });
  }

  console.log('Seeding routes...');
  const routesData = [
    {
      name: 'Odin’s Divine Migration',
      explorerName: 'Odin',
      startYear: -200,
      endYear: -100,
      pathPoints: '48.0,37.0;50.4,30.5;51.5,10.5;55.4,10.3;59.6,17.7', // Ukraine -> Kiev -> Germany -> Fyn -> Sigtuna
      isMythological: true,
      description: 'Odin leads the Æsir out of Asaland (near the Black Sea) across Saxony and Denmark to Sigtuna, Sweden.'
    },
    {
      name: 'Sveigðir’s Quest for God-home',
      explorerName: 'Sveigðir',
      startYear: -20,
      endYear: 10,
      pathPoints: '59.8,17.6;55.7,37.6;41.0,29.0;42.0,43.5;59.8,17.6', // Uppsala -> Russia -> Turkey -> Caucasus -> Uppsala
      isMythological: true,
      description: 'Sveigðir travels to Vanaland, Asia Minor, and Scythia in search of Odin and the ancient home of the gods.'
    },
    {
      name: 'Erik the Red’s Colonization of Greenland',
      explorerName: 'Erik the Red',
      startYear: 982,
      endYear: 985,
      pathPoints: '58.7,5.5;64.8,-23.7;61.1,-45.5', // Jæren -> Iceland -> Brattahlid
      isMythological: false,
      description: 'Erik is exiled from Jæren, Norway to Iceland, then exiled from Iceland, sailing west to settle Greenland.'
    },
    {
      name: 'Leif Erikson’s Exploration of Vinland',
      explorerName: 'Leif Erikson',
      startYear: 999,
      endYear: 1000,
      pathPoints: '61.1,-45.5;63.4,10.3;61.1,-45.5;51.5,-55.5', // Greenland -> Trondheim -> Greenland -> L'Anse aux Meadows
      isMythological: false,
      description: 'Leif sails to Norway to serve Olaf Tryggvason, converts to Christianity, and sails to North America (Vinland).'
    },
    {
      name: 'Harald Hardrada’s Varangian Odyssey',
      explorerName: 'Harald Hardrada',
      startYear: 1030,
      endYear: 1046,
      pathPoints: '63.7,11.5;59.3,18.0;50.4,30.5;41.0,29.0;31.7,35.2;50.4,30.5;63.4,10.3;53.9,-0.9', // Stiklestad -> Sweden -> Kiev -> Constantinople -> Jerusalem -> Kiev -> Trondheim -> Stamford Bridge
      isMythological: false,
      description: 'Hardrada escapes Stiklestad to Kiev, rises to commander of the Byzantine Varangian Guard, and returns to rule Norway.'
    }
  ];

  for (const r of routesData) {
    const explorer = entitiesMap[r.explorerName];
    await prisma.route.create({
      data: {
        name: r.name,
        explorerId: explorer ? explorer.id : null,
        startYear: r.startYear,
        endYear: r.endYear,
        pathPoints: r.pathPoints,
        isMythological: r.isMythological,
        description: r.description
      }
    });
  }

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
