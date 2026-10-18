/*
  Every video on the site, newest first.
  - id:   file name in assets/video/<id>.mp4 (short silent loop) and assets/img/<id>.jpg (poster)
  - full: file name in assets/full/<full>.mp4 (full-length with sound, opened in the lightbox)
  - ig:   Instagram reel id, links back to the post
  - cat:  fire | food | party (gallery filters)
  To add a new reel, see README.md.
*/
window.PH_CLIPS = [
  { id: 'chandelier-fire', full: 'DefahQ4CcYs', ig: 'DefahQ4CcYs', date: '2026-10-14', cat: 'fire',  en: 'Chandelier Nights',      es: 'Noches de Candelabro' },
  { id: 'night-crowd',     full: 'Deaq5__OOLS', ig: 'Deaq5__OOLS', date: '2026-10-12', cat: 'party', en: 'Birthday Under the Lights', es: 'Cumpleaños Bajo las Luces' },
  { id: 'dance',           full: 'DeH_3rPy4gB', ig: 'DeH_3rPy4gB', date: '2026-10-05', cat: 'party', en: 'The Chef Has Moves',     es: 'El Chef Sabe Bailar' },
  { id: 'big-tent',        full: 'Dd2sx2HOdiZ', ig: 'Dd2sx2HOdiZ', date: '2026-09-28', cat: 'party', en: 'Big Tent, Big Party',    es: 'Gran Carpa, Gran Fiesta' },
  { id: 'garden-party',    full: 'Dd2EdDQS9k2', ig: 'Dd2EdDQS9k2', date: '2026-09-28', cat: 'party', en: 'Garden Party',           es: 'Fiesta en el Jardín' },
  { id: 'tent-fire',       full: 'DdyEx6wOG0-', ig: 'DdyEx6wOG0-', date: '2026-09-27', cat: 'fire',  en: 'Fire in the Tent',       es: 'Fuego en la Carpa' },
  { id: 'two-chefs',       full: 'Ddk6Jp4OxqR', ig: 'Ddk6Jp4OxqR', date: '2026-09-21', cat: 'fire',  en: 'Two Chefs, One Show',    es: 'Dos Chefs, Un Show' },
  { id: 'crowd-catch',     full: 'DdhJ5UMuf8o', ig: 'DdhJ5UMuf8o', date: '2026-09-20', cat: 'party', en: 'Front-Row Seats',        es: 'Primera Fila' },
  { id: 'trays',           full: 'DdKoamZOOjV', ig: 'DdKoamZOOjV', date: '2026-09-11', cat: 'food',  en: 'Hot Off the Grill',      es: 'Recién Salido' },
  { id: 'big-flame',       full: 'Dc3F9V8ujo9', ig: 'Dc3F9V8ujo9', date: '2026-09-04', cat: 'fire',  en: 'Afternoon Flames',       es: 'Llamas de la Tarde' },
  { id: 'chandelier-tent', full: 'DefahQ4CcYs', ig: 'DefahQ4CcYs', date: '2026-10-14', cat: 'party', en: 'Set for a Celebration',  es: 'Lista Para Celebrar', extra: true },
  { id: 'garden-show',     full: 'Dd2EdDQS9k2', ig: 'Dd2EdDQS9k2', date: '2026-09-28', cat: 'fire',  en: 'Everybody Films',        es: 'Todos Graban', extra: true },
  { id: 'plate',           full: 'DdyEx6wOG0-', ig: 'DdyEx6wOG0-', date: '2026-09-27', cat: 'food',  en: 'Steak, Shrimp & Rice',   es: 'Bistec, Camarón y Arroz', extra: true },
  { id: 'sauce',           full: 'DdyEx6wOG0-', ig: 'DdyEx6wOG0-', date: '2026-09-27', cat: 'food',  en: 'House Sauces',           es: 'Salsas de la Casa', extra: true },

  { id: 'original',  full: 'original',  cat: 'fire',  en: 'The Onion Volcano',      es: 'El Volcán de Cebolla' },
  { id: 'fire2',     full: 'fire2',     cat: 'fire',  en: 'Flame Tower',            es: 'Torre de Fuego' },
  { id: 'fire1',     full: 'fire1',     cat: 'fire',  en: 'High Flames',            es: 'Llamas Altas' },
  { id: 'firevid',   full: 'firevid',   cat: 'fire',  en: 'Fire Down the Table',    es: 'Fuego en la Mesa' },
  { id: 'party55',   full: 'party55',   cat: 'fire',  en: 'Pergola Fire',           es: 'Fuego en la Pérgola' },
  { id: 'venue',     full: 'venue',     cat: 'party', en: 'Under the String Lights', es: 'Bajo las Luces' },
  { id: 'partyco',   full: 'partyco',   cat: 'party', en: 'Big Tent Nights',        es: 'Noches de Fiesta' },
  { id: 'partyvid',  full: 'partyvid',  cat: 'party', en: 'Grill-Side',             es: 'Junto a la Parrilla' },
  { id: 'food36',    full: 'food36',    cat: 'party', en: 'Backyard Birthdays',     es: 'Cumpleaños en Casa' },
  { id: 'lobster',   full: 'lobster',   cat: 'food',  en: 'Lobster Prep',           es: 'Preparando Langosta' },
  { id: 'food26',    full: 'food26',    cat: 'food',  en: 'Fried Rice, Live',       es: 'Arroz Frito en Vivo' },
  { id: 'food37',    full: 'food37',    cat: 'food',  en: 'Chicken & Shrimp',       es: 'Pollo y Camarón' },
  { id: 'foodtray',  full: 'foodtray',  cat: 'food',  en: 'Steak & Shrimp',         es: 'Bistec y Camarón' },
  { id: 'food50',    full: 'food50',    cat: 'food',  en: 'Shrimp Noodles',         es: 'Fideos con Camarón' },
  { id: 'food51',    full: 'food51',    cat: 'food',  en: 'Plated',                 es: 'Servido' },
  { id: 'party3',    full: 'party3',    cat: 'food',  en: 'On the Flat-Top',        es: 'En la Plancha' },
];
