/* ============================================================
   SITE CONFIG — every brandable string lives here.
   ============================================================ */

export const brand = {
  name: 'QAHVA',
  tagline: 'Roastery & Café',
  whatsapp: '923000000000', // digits only, international format
  phoneDisplay: '+92 300 0000000',
  email: 'hello@qahva.pk',
  address: 'Demo Roastery, MM Alam Road, Gulberg III, Lahore',
  instagram: 'https://instagram.com/',
  facebook: 'https://facebook.com/',
  tiktok: 'https://tiktok.com/',
};

export const announcement =
  'Freshly roasted every morning · Free delivery over Rs.2,500 · Open daily 8 am – 11 pm';

export const nav = [
  { label: 'Home', to: '/' },
  { label: 'Menu', to: '/menu' },
  { label: 'Our Story', to: '/#story' },
  { label: 'Contact', to: '/contact' },
];

/* ---------- hero slider (matches the video's two moods) ---------- */
export const slides = [
  {
    id: 'signature',
    theme: 'warm' as const,
    eyebrow: 'Small-batch · Single origin',
    headline: ['Celebrating the', 'perfect cup.'],
    sub: 'Beans roasted in-house every morning, pulled into velvet-smooth lattes and slow pour-overs. This is coffee taken seriously — and served warmly.',
    cta1: { label: 'Order online', to: '/menu' },
    cta2: { label: 'Read our story', to: '/#story' },
    badge: 'Signature Latte · Rs.650',
    photo: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: 'iced-luxe',
    theme: 'gold' as const,
    eyebrow: 'Limited summer drop',
    headline: ['The Iced Luxe', 'Collection.'],
    sub: 'Cold brew steeped for 18 hours, Spanish lattes over crystal ice, gold-dusted affogatos. Summer, upgraded.',
    cta1: { label: 'Order the collection', to: '/menu?cat=Iced%20%26%20Cold%20Brew' },
    cta2: { label: 'View full menu', to: '/menu' },
    badge: 'Iced Spanish Latte · Rs.800',
    photo: 'https://images.unsplash.com/photo-1559496417-e7f25cb247f3?auto=format&fit=crop&w=1000&q=80',
  },
];

export const story = {
  eyebrow: 'Our story',
  title: 'Coffee, the slow way.',
  body1:
    'QAHVA started with a five-kilo roaster, a stubborn belief that Lahore deserved better coffee, and a bench outside for anyone who wanted to talk about it. We source single-origin lots directly, roast in small batches every morning, and dial in every grind before the first customer walks in.',
  body2:
    'No syrups hiding stale shots. No burnt "dark roast" shortcuts. Just careful sourcing, honest roasting, and baristas who treat a flat white like it matters — because it does.',
  stats: [
    { value: 8, suffix: '+', label: 'Years roasting' },
    { value: 12, suffix: '', label: 'Origins sourced' },
    { value: 40, suffix: 'k', label: 'Cups a year' },
    { value: 4.9, suffix: '★', label: 'Average rating', decimals: 1 },
  ],
};

export const steps = [
  { title: 'Source', body: 'Direct-trade lots from farms we can name — Ethiopia, Colombia, Sumatra.' },
  { title: 'Roast', body: 'Small five-kilo batches every morning, rested to peak flavour.' },
  { title: 'Brew', body: 'Dialled-in espresso and slow pour-overs, made to order — never batched.' },
];

export const orderBand = {
  title: 'Skip the queue.',
  sub: 'Order online for pickup or delivery — your cup starts the moment you tap confirm.',
  cta: 'Order online',
};

export const pages = {
  menu: {
    title: 'The Menu',
    intro: 'Everything made to order. Prices include GST — no surprises at the counter.',
  },
  contact: {
    title: 'Find the Roastery',
    intro: 'Beans, brewing gear, private events or wholesale — send a message or just walk in.',
  },
  checkout: {
    title: 'Your Order',
    intro: 'Pickup in ~15 minutes, or delivery across the city.',
  },
};

export const footerBlurb =
  'A small roastery-café pouring single-origin espresso, slow brews and an iced luxe collection. Roasted every morning, served all day.';
