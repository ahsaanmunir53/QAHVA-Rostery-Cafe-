import { CSSProperties, MouseEvent as ReactMouseEvent, ReactNode, useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu as MenuIcon, X, ShoppingBag, Minus, Plus, Trash2, Star, MessageCircle } from 'lucide-react';
import { brand, announcement, nav, footerBlurb } from './data/site';
import { useCart } from './lib/cart';

export const money = (n: number) => 'Rs.' + (Number(n) || 0).toLocaleString();

/* ================= animated illustration kit =================
   Everything below is pure SVG/CSS so the demo is "fully animated"
   with zero image assets. Real photos can replace any of it later. */

/** A latte glass with layered coffee, foam, saucer and rising steam. */
export function LatteCup({ className = '', iced = false }: { className?: string; iced?: boolean }) {
  return (
    <div className={`relative ${className}`}>
      {/* steam */}
      {!iced && (
        <div className="absolute -top-2 left-1/2 flex -translate-x-1/2 gap-2" aria-hidden>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="anim-steam block h-8 w-2 rounded-full bg-white/70 blur-[3px]"
              style={{ ['--d' as string]: `${2.8 + i * 0.5}s`, ['--sx' as string]: `${i % 2 ? -6 : 6}px`, animationDelay: `${i * 0.6}s` }}
            />
          ))}
        </div>
      )}
      <svg viewBox="0 0 200 240" className="h-full w-full drop-shadow-[0_24px_30px_rgba(20,10,5,.35)]" aria-hidden>
        <defs>
          <linearGradient id="coffee" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F7EEDF" />
            <stop offset="26%" stopColor="#E3C9A6" />
            <stop offset="55%" stopColor="#A9683F" />
            <stop offset="100%" stopColor="#3A2417" />
          </linearGradient>
          <linearGradient id="icedCoffee" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F2E2CC" />
            <stop offset="45%" stopColor="#C89B69" />
            <stop offset="100%" stopColor="#6B4226" />
          </linearGradient>
          <linearGradient id="glass" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(255,255,255,.55)" />
            <stop offset="18%" stopColor="rgba(255,255,255,.08)" />
            <stop offset="82%" stopColor="rgba(255,255,255,.08)" />
            <stop offset="100%" stopColor="rgba(255,255,255,.45)" />
          </linearGradient>
        </defs>
        {/* saucer */}
        <ellipse cx="100" cy="216" rx="72" ry="12" fill="#1B0F09" opacity=".55" />
        <ellipse cx="100" cy="210" rx="66" ry="11" fill="#E8D8C2" />
        {/* handle */}
        <path d="M150 96 q34 8 30 42 q-4 34 -36 34" fill="none" stroke="rgba(255,255,255,.5)" strokeWidth="9" strokeLinecap="round" />
        {/* glass body */}
        <path d="M56 44 L64 196 q1 12 14 12 h44 q13 0 14 -12 L144 44 Z" fill="url(#glass)" stroke="rgba(255,255,255,.6)" strokeWidth="2.5" />
        {/* liquid */}
        <path d="M62 58 L69 192 q1 9 10 9 h42 q9 0 10 -9 L138 58 Z" fill={iced ? 'url(#icedCoffee)' : 'url(#coffee)'} />
        {/* foam / ice */}
        {iced ? (
          <g fill="rgba(255,255,255,.5)" stroke="rgba(255,255,255,.75)" strokeWidth="1.5">
            <rect x="74" y="70" width="22" height="22" rx="5" transform="rotate(-12 85 81)" />
            <rect x="104" y="64" width="20" height="20" rx="5" transform="rotate(14 114 74)" />
            <rect x="90" y="96" width="18" height="18" rx="4" transform="rotate(-6 99 105)" />
          </g>
        ) : (
          <>
            <ellipse cx="100" cy="58" rx="38" ry="9" fill="#FBF4E6" />
            <path d="M100 52 q10 4 0 9 q-10 -5 0 -9" fill="#C89B69" />
            <path d="M100 58 q0 10 -7 14 M100 58 q0 10 7 14" stroke="#C89B69" strokeWidth="2" fill="none" strokeLinecap="round" />
          </>
        )}
        {/* highlight */}
        <path d="M70 62 L76 186" stroke="rgba(255,255,255,.55)" strokeWidth="5" strokeLinecap="round" />
      </svg>
    </div>
  );
}

/** A single coffee bean (SVG). */
function Bean({ size = 26, className = '', style }: { size?: number; className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 40 52" width={size} height={size * 1.3} className={className} style={style} aria-hidden>
      <ellipse cx="20" cy="26" rx="17" ry="24" fill="#4A3426" />
      <path d="M20 4 q-9 22 0 44" stroke="#241610" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M13 8 q-6 18 1 36" stroke="rgba(255,255,255,.14)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}

/** A field of drifting beans (deterministic layout, GPU-cheap). */
export function BeanField({ n = 9, light = false }: { n?: number; light?: boolean }) {
  const beans = Array.from({ length: n }).map((_, i) => {
    const left = (i * 97) % 100;
    const top = (i * 53 + 12) % 90;
    const size = 16 + ((i * 37) % 22);
    const dur = 6 + ((i * 29) % 50) / 10;
    const rot = ((i * 71) % 80) - 40;
    return { left, top, size, dur, rot, key: i };
  });
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {beans.map((b) => (
        <span
          key={b.key}
          className="anim-drift absolute block"
          style={{
            left: `${b.left}%`,
            top: `${b.top}%`,
            opacity: light ? 0.5 : 0.8,
            ['--d' as string]: `${b.dur}s`,
            ['--r' as string]: `${b.rot}deg`,
            animationDelay: `${(b.key * 0.7) % 3}s`,
          }}
        >
          <Bean size={b.size} />
        </span>
      ))}
    </div>
  );
}

/** Floating translucent ice cubes for the gold slide. */
export function IceField({ n = 6 }: { n?: number }) {
  const cubes = Array.from({ length: n }).map((_, i) => ({
    left: (i * 89 + 6) % 96,
    top: (i * 61 + 8) % 84,
    size: 26 + ((i * 41) % 26),
    dur: 5.5 + ((i * 31) % 40) / 10,
    rot: ((i * 57) % 60) - 30,
    key: i,
  }));
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {cubes.map((c) => (
        <span
          key={c.key}
          className="anim-drift absolute block rounded-lg border border-white/50 bg-white/20 backdrop-blur-[2px]"
          style={{
            left: `${c.left}%`,
            top: `${c.top}%`,
            width: c.size,
            height: c.size,
            ['--d' as string]: `${c.dur}s`,
            ['--r' as string]: `${c.rot}deg`,
            animationDelay: `${(c.key * 0.5) % 2.5}s`,
            boxShadow: 'inset 0 0 12px rgba(255,255,255,.35)',
          }}
        />
      ))}
    </div>
  );
}

/** Gold ribbon curves behind the luxe slide. */
export function Ribbons() {
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 1000 600" aria-hidden>
      <defs>
        <linearGradient id="ribbon" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#8A6534" />
          <stop offset="45%" stopColor="#E9CB94" />
          <stop offset="100%" stopColor="#9C7239" />
        </linearGradient>
      </defs>
      <path d="M-60 430 C 220 260, 420 560, 700 380 S 1080 240, 1080 240" fill="none" stroke="url(#ribbon)" strokeWidth="46" opacity=".5" className="anim-floaty" />
      <path d="M-60 180 C 260 60, 460 340, 760 170 S 1080 420, 1080 420" fill="none" stroke="url(#ribbon)" strokeWidth="26" opacity=".35" className="anim-floaty" style={{ animationDelay: '1.4s' }} />
    </svg>
  );
}

/** Roast-toned art block used wherever a photo is missing. */
export function RoastArt({ seed, label, className = '' }: { seed: string; label?: string; className?: string }) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 26;
  const hue = 18 + h; // stay in coffee browns
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ background: `radial-gradient(120% 100% at 25% 15%, hsl(${hue} 42% 78%) 0%, hsl(${hue} 38% 52%) 55%, hsl(${hue} 45% 22%) 100%)` }}
      aria-hidden
    >
      <span className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none font-display text-[30cqw] italic text-white/25">
        {(label || seed).charAt(0).toUpperCase()}
      </span>
      <span className="absolute bottom-2 right-3 opacity-70"><Bean size={18} /></span>
      {label && <span className="absolute bottom-3 left-3 text-[10px] uppercase tracking-label text-white/75">{label}</span>}
    </div>
  );
}

/* ============ 3D mouse-tilt wrapper ============ */
export function Tilt3D({ children, max = 12, className = '' }: { children: ReactNode; max?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  const move = (e: ReactMouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty('--ry', `${px * max * 2}deg`);
    el.style.setProperty('--rx', `${-py * max * 2}deg`);
  };
  const leave = () => {
    const el = ref.current;
    if (!el) return;
    setOn(false);
    el.style.setProperty('--ry', '0deg');
    el.style.setProperty('--rx', '0deg');
  };
  return (
    <div className="scene">
      <div
        ref={ref}
        onMouseEnter={() => setOn(true)}
        onMouseMove={move}
        onMouseLeave={leave}
        className={`tilt ${on ? 'tilt-on' : ''} ${className}`}
      >
        {children}
      </div>
    </div>
  );
}

/* ============ steam wisps ============ */
export function Steam({ n = 3, className = '' }: { n?: number; className?: string }) {
  return (
    <div className={`pointer-events-none absolute ${className}`} aria-hidden>
      {Array.from({ length: n }).map((_, i) => (
        <span
          key={i}
          className="anim-steam absolute block h-10 w-2 rounded-full bg-white/60 blur-[4px]"
          style={{
            left: `${18 + i * 26}%`,
            ['--d' as string]: `${3 + i * 0.55}s`,
            ['--sx' as string]: `${i % 2 ? -8 : 8}px`,
            animationDelay: `${i * 0.7}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ============ depth-layered beans (parallax feel) ============ */
export function DepthBeans({ n = 14, light = false }: { n?: number; light?: boolean }) {
  const beans = Array.from({ length: n }).map((_, i) => {
    const layer = i % 3; // 0 = far, 2 = near
    return {
      key: i,
      left: (i * 83) % 100,
      top: (i * 47 + 8) % 92,
      size: [10, 16, 26][layer] + ((i * 13) % 8),
      dur: [11, 8, 6][layer] + ((i * 17) % 30) / 10,
      rot: ((i * 61) % 90) - 45,
      blur: [2.5, 1, 0][layer],
      op: [0.28, 0.55, 0.85][layer],
      delay: (i * 0.37) % 4,
    };
  });
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {beans.map((b) => (
        <span
          key={b.key}
          className="anim-drift absolute block rounded-[50%]"
          style={{
            left: `${b.left}%`,
            top: `${b.top}%`,
            width: b.size,
            height: b.size * 1.32,
            filter: `blur(${b.blur}px)`,
            opacity: b.op,
            animationDelay: `${b.delay}s`,
            background: light
              ? 'radial-gradient(60% 55% at 35% 30%, #7A5230 0%, #4A2E18 60%, #2E1B0E 100%)'
              : 'radial-gradient(60% 55% at 35% 30%, #C9A26B 0%, #7A5230 55%, #3A2417 100%)',
            boxShadow: 'inset 0 0 6px rgba(0,0,0,.45)',
            ['--d' as string]: `${b.dur}s`,
            ['--r' as string]: `${b.rot}deg`,
          }}
        />
      ))}
    </div>
  );
}

export function SmartImg({ src, seed, label, alt, className = '' }: { src?: string; seed: string; label?: string; alt: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return <RoastArt seed={seed} label={label} className={className} />;
  return <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} className={`object-cover ${className}`} />;
}

/* ================= scroll + counters ================= */
export function Reveal({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setShown(true); io.disconnect(); }
    }, { threshold: 0.12 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={`transition-all duration-700 ${shown ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

export function CountUp({ to, suffix = '', decimals = 0, duration = 1400 }: { to: number; suffix?: string; decimals?: number; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [val, setVal] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const tick = (t: number) => {
        const p = Math.min(1, (t - start) / duration);
        setVal(to * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.5 });
    io.observe(el);
    return () => io.disconnect();
  }, [to, duration]);
  return <span ref={ref}>{val.toFixed(decimals)}{suffix}</span>;
}

export function SectionHead({ eyebrow, title, sub, light = false }: { eyebrow: string; title: string; sub?: string; light?: boolean }) {
  return (
    <Reveal className="mx-auto mb-10 max-w-2xl text-center">
      <p className="text-[11px] uppercase tracking-label text-gold">{eyebrow}</p>
      <h2 className={`mt-2 font-display text-4xl sm:text-5xl ${light ? 'text-foam' : 'text-espresso'}`}>{title}</h2>
      {sub && <p className={`mt-3 leading-relaxed ${light ? 'text-foam/70' : 'text-smoke'}`}>{sub}</p>}
    </Reveal>
  );
}

export function Stars({ n }: { n: number }) {
  return (
    <span className="inline-flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={`h-4 w-4 ${i <= n ? 'fill-gold text-gold' : 'text-line'}`} />
      ))}
    </span>
  );
}

/* ================= chrome ================= */
export function Header() {
  const { count, openDrawer } = useCart();
  const [open, setOpen] = useState(false);
  const linkCls = ({ isActive }: { isActive: boolean }) =>
    `px-4 py-2 text-[12px] uppercase tracking-label transition-colors hover:text-gold ${isActive ? 'text-gold' : 'text-foam/85'}`;
  return (
    <>
      {/* animated marquee announcement */}
      <div className="overflow-hidden bg-gold/95 py-1.5 text-espresso">
        <div className="anim-marquee flex w-max whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.16em]">
          {[0, 1].map((k) => (
            <span key={k} className="px-6">{announcement} · {announcement}</span>
          ))}
        </div>
      </div>
      <header className="sticky top-0 z-40 border-b border-white/10 bg-espresso/95 text-foam backdrop-blur">
        <div className="mx-auto flex max-w-[1240px] items-center justify-between px-5 py-3.5">
          <button className="p-2 lg:hidden" aria-label="Open menu" onClick={() => setOpen(true)}>
            <MenuIcon className="h-5 w-5" />
          </button>
          <Link to="/" className="group select-none">
            <span className="font-display text-2xl tracking-[0.24em]">{brand.name}</span>
            <span className="block text-[9px] uppercase tracking-label text-gold">{brand.tagline}</span>
          </Link>
          <nav className="hidden items-center lg:flex">
            {nav.map((n) =>
              n.to.startsWith('/#') ? (
                <a key={n.label} href={n.to} className="px-4 py-2 text-[12px] uppercase tracking-label text-foam/85 transition-colors hover:text-gold">{n.label}</a>
              ) : (
                <NavLink key={n.label} to={n.to} className={linkCls} end={n.to === '/'}>{n.label}</NavLink>
              ),
            )}
          </nav>
          <div className="flex items-center gap-2">
            <button aria-label="Your order" onClick={openDrawer} className="relative p-2 hover:text-gold">
              <ShoppingBag className="h-5 w-5" />
              {count > 0 && (
                <span className="anim-glow absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-gold px-1 text-[10px] font-bold text-espresso">
                  {count}
                </span>
              )}
            </button>
            <Link to="/menu" className="hidden bg-gold px-5 py-2.5 text-[11px] font-semibold uppercase tracking-label text-espresso transition-colors hover:bg-foam sm:block">
              Order online
            </Link>
          </div>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-espresso/60" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 flex h-full w-[82%] max-w-sm flex-col bg-espresso text-foam">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <span className="font-display text-xl tracking-[0.22em]">{brand.name}</span>
              <button aria-label="Close menu" onClick={() => setOpen(false)}><X className="h-5 w-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto py-2">
              {nav.map((n) =>
                n.to.startsWith('/#') ? (
                  <a key={n.label} href={n.to} onClick={() => setOpen(false)} className="block border-b border-white/10 px-5 py-4 text-[12px] uppercase tracking-label">{n.label}</a>
                ) : (
                  <Link key={n.label} to={n.to} onClick={() => setOpen(false)} className="block border-b border-white/10 px-5 py-4 text-[12px] uppercase tracking-label">{n.label}</Link>
                ),
              )}
            </div>
            <Link to="/menu" onClick={() => setOpen(false)} className="m-5 bg-gold py-3.5 text-center text-[11px] font-semibold uppercase tracking-label text-espresso">
              Order online
            </Link>
          </div>
        </div>
      )}
    </>
  );
}

export function CartDrawer() {
  const { lines, subtotal, drawerOpen, closeDrawer, setQty, remove } = useCart();
  const navigate = useNavigate();
  if (!drawerOpen) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-espresso/50" onClick={closeDrawer} />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-foam">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="font-display text-2xl">Your order</h2>
          <button aria-label="Close" onClick={closeDrawer}><X className="h-5 w-5" /></button>
        </div>
        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <ShoppingBag className="h-8 w-8 text-smoke" />
            <p className="text-smoke">Nothing in your order yet.</p>
            <button onClick={() => { closeDrawer(); navigate('/menu'); }} className="mt-1 border border-espresso px-6 py-2.5 text-[11px] uppercase tracking-label hover:bg-espresso hover:text-foam">
              Browse the menu
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 divide-y divide-line overflow-y-auto px-5">
              {lines.map((l) => (
                <div key={l.id} className="flex items-center gap-4 py-4">
                  <div className="flex-1">
                    <p className="font-display text-lg leading-tight">{l.name}</p>
                    <p className="text-xs text-smoke">{money(l.price)} each</p>
                  </div>
                  <div className="flex items-center border border-line">
                    <button aria-label="Decrease" className="grid h-8 w-8 place-items-center hover:bg-cream" onClick={() => setQty(l.id, l.qty - 1)}><Minus className="h-3.5 w-3.5" /></button>
                    <span className="w-8 text-center text-sm">{l.qty}</span>
                    <button aria-label="Increase" className="grid h-8 w-8 place-items-center hover:bg-cream" onClick={() => setQty(l.id, l.qty + 1)}><Plus className="h-3.5 w-3.5" /></button>
                  </div>
                  <span className="w-20 text-right text-sm font-medium">{money(l.price * l.qty)}</span>
                  <button aria-label="Remove" onClick={() => remove(l.id)} className="text-smoke hover:text-copper"><Trash2 className="h-4 w-4" /></button>
                </div>
              ))}
            </div>
            <div className="border-t border-line px-5 py-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-label text-smoke">Subtotal</span>
                <span className="font-display text-xl">{money(subtotal)}</span>
              </div>
              <button
                onClick={() => { closeDrawer(); navigate('/checkout'); }}
                className="w-full bg-espresso py-3.5 text-[11px] uppercase tracking-label text-foam transition-colors hover:bg-gold hover:text-espresso"
              >
                Checkout
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

export function WhatsAppFloat({ number }: { number?: string }) {
  return (
    <a
      href={`https://wa.me/${number || brand.whatsapp}?text=${encodeURIComponent('Hello! I have a question about my order.')}`}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-espresso px-4 py-3 text-foam shadow-lg transition-colors hover:bg-gold hover:text-espresso"
    >
      <MessageCircle className="h-5 w-5" />
      <span className="hidden text-[11px] uppercase tracking-label sm:inline">WhatsApp</span>
    </a>
  );
}

export function Footer({ phone, address, hours }: { phone?: string; address?: string; hours?: string }) {
  return (
    <footer className="relative mt-24 overflow-hidden bg-espresso text-foam">
      <BeanField n={7} light />
      <div className="relative mx-auto grid max-w-[1240px] gap-10 px-5 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-display text-2xl tracking-[0.22em]">{brand.name}</p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-foam/65">{footerBlurb}</p>
          <div className="mt-4 flex gap-4 text-[11px] uppercase tracking-label text-foam/80">
            <a className="hover:text-gold" href={brand.instagram} target="_blank" rel="noreferrer">Instagram</a>
            <a className="hover:text-gold" href={brand.facebook} target="_blank" rel="noreferrer">Facebook</a>
            <a className="hover:text-gold" href={brand.tiktok} target="_blank" rel="noreferrer">TikTok</a>
          </div>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-label text-gold">Explore</p>
          <ul className="mt-3 space-y-2 text-sm text-foam/80">
            <li><Link className="hover:text-gold" to="/menu">Menu</Link></li>
            <li><Link className="hover:text-gold" to="/checkout">Your order</Link></li>
            <li><a className="hover:text-gold" href="/#story">Our story</a></li>
            <li><Link className="hover:text-gold" to="/contact">Contact</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-label text-gold">Hours</p>
          <p className="mt-3 text-sm text-foam/80">{hours || 'Open daily · 8:00 am – 11:00 pm'}</p>
          <p className="mt-2 text-sm text-foam/60">Kitchen closes 10:30 pm</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-label text-gold">Find us</p>
          <ul className="mt-3 space-y-2 text-sm text-foam/80">
            <li>{address || brand.address}</li>
            <li><a className="hover:text-gold" href={`tel:${(phone || brand.phoneDisplay).replace(/\s/g, '')}`}>{phone || brand.phoneDisplay}</a></li>
            <li><a className="hover:text-gold" href={`mailto:${brand.email}`}>{brand.email}</a></li>
          </ul>
        </div>
      </div>
      <div className="relative border-t border-white/10 px-5 py-4 text-center text-xs text-foam/50">
        © {new Date().getFullYear()} {brand.name} — demo website; imagery, menu and reviews are placeholders. ·{' '}
        <Link to="/admin" className="hover:text-gold">Admin</Link>
      </div>
    </footer>
  );
}
