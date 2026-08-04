import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Flame, Coffee, Bean, Plus } from 'lucide-react';
import { slides, story, steps, orderBand, brand } from '../data/site';
import { apiGet } from '../lib/api';
import { useCart } from '../lib/cart';
import type { MenuItem, Testimonial, GalleryItem, PublicSettings } from '../lib/types';
import { BeanField, DepthBeans, Tilt3D, Steam, IceField, Ribbons, SmartImg, Reveal, SectionHead, Stars, CountUp, money } from '../ui';

/* ---------------- hero slider ---------------- */
function Hero() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setActive((a) => (a + 1) % slides.length), 6500);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="relative isolate min-h-[86vh] overflow-hidden">
      {slides.map((s, i) => {
        const gold = s.theme === 'gold';
        return (
          <div
            key={s.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${active === i ? 'z-10 opacity-100' : 'z-0 opacity-0'}`}
            aria-hidden={active !== i}
          >
            {/* backdrop */}
            <div className={gold
              ? 'absolute inset-0 bg-[radial-gradient(130%_100%_at_50%_0%,#E4C489_0%,#B98F52_45%,#6E4A22_100%)]'
              : 'absolute inset-0 bg-[radial-gradient(130%_100%_at_50%_0%,#4A3426_0%,#33221A_45%,#1B0F09_100%)]'}
            />
            {gold ? (<><Ribbons /><IceField n={7} /><DepthBeans n={12} light /></>) : (<DepthBeans n={16} />)}

            <div className="relative mx-auto grid min-h-[86vh] max-w-[1240px] items-center gap-8 px-5 py-20 lg:grid-cols-[1.05fr_.95fr]">
              <div className={`${active === i ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'} text-center transition-all delay-200 duration-700 lg:text-left`}>
                <p className={`text-[11px] uppercase tracking-label ${gold ? 'text-espresso/80' : 'text-gold'}`}>{s.eyebrow}</p>
                <h1 className={`mt-4 font-display text-5xl leading-[1.05] sm:text-7xl ${gold ? 'text-espresso' : 'text-foam'}`}>
                  {s.headline[0]}<br />
                  <span className={gold ? 'italic' : 'text-shimmer italic'}>{s.headline[1]}</span>
                </h1>
                <p className={`mx-auto mt-5 max-w-lg leading-relaxed lg:mx-0 ${gold ? 'text-espresso/75' : 'text-foam/70'}`}>{s.sub}</p>
                <div className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
                  <Link to={s.cta1.to} className={`anim-glow px-8 py-3.5 text-[11px] font-semibold uppercase tracking-label transition-colors ${gold ? 'bg-espresso text-foam hover:bg-foam hover:text-espresso' : 'bg-gold text-espresso hover:bg-foam'}`}>
                    {s.cta1.label}
                  </Link>
                  <Link to={s.cta2.to} className={`border px-8 py-3.5 text-[11px] uppercase tracking-label transition-colors ${gold ? 'border-espresso/50 text-espresso hover:bg-espresso hover:text-foam' : 'border-foam/40 text-foam hover:bg-foam hover:text-espresso'}`}>
                    {s.cta2.label}
                  </Link>
                </div>
              </div>

              {/* cup */}
              <div className={`relative mx-auto flex h-[340px] w-[280px] items-center justify-center sm:h-[420px] sm:w-[340px] ${active === i ? 'scale-100 opacity-100' : 'scale-95 opacity-0'} transition-all delay-300 duration-1000`}>
                <div className={`absolute inset-x-6 bottom-6 top-10 rounded-full blur-3xl ${gold ? 'bg-white/40' : 'bg-gold/25'}`} />
                <Tilt3D max={11} className="h-full w-full">
                  <div className="anim-float-deep relative h-full w-full preserve-3d">
                    <div className="shine shine-auto relative h-full w-full overflow-hidden rounded-[2rem] shadow-[0_40px_70px_-18px_rgba(20,10,5,.65)] ring-1 ring-white/25">
                      <img src={s.photo} alt={s.badge} className="h-full w-full object-cover" loading={i === 0 ? 'eager' : 'lazy'} />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-espresso/50 via-transparent to-white/10" />
                    </div>
                    <Steam n={3} className="-top-6 left-1/2 h-16 w-24 -translate-x-1/2" />
                    <span className="podium" />
                    <span className="podium-ring anim-ring-spin" />
                  </div>
                </Tilt3D>
                <span className={`absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap border px-4 py-2 text-[11px] uppercase tracking-label backdrop-blur ${gold ? 'border-espresso/30 bg-white/40 text-espresso' : 'border-white/25 bg-white/10 text-foam'}`}>
                  {s.badge}
                </span>
              </div>
            </div>
          </div>
        );
      })}

      {/* dots */}
      <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-2.5">
        {slides.map((s, i) => (
          <button
            key={s.id}
            aria-label={`Slide ${i + 1}`}
            onClick={() => setActive(i)}
            className={`h-2.5 rounded-full transition-all ${active === i ? 'w-8 bg-gold' : 'w-2.5 bg-white/50 hover:bg-white/80'}`}
          />
        ))}
      </div>
    </section>
  );
}

/* ---------------- page ---------------- */
export default function Home({ settings }: { settings: PublicSettings | null }) {
  const { add } = useCart();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);

  useEffect(() => {
    apiGet<MenuItem[]>('/api/menu').then((r) => r.ok && setItems(r.data));
    apiGet<Testimonial[]>('/api/testimonials').then((r) => r.ok && setTestimonials(r.data));
    apiGet<GalleryItem[]>('/api/gallery').then((r) => r.ok && setGallery(r.data));
  }, []);

  const featured = items.filter((m) => m.featured && !m.soldOut).slice(0, 6);
  const stepIcons = [Bean, Flame, Coffee];

  return (
    <div>
      <Hero />

      {/* story + count-up stats */}
      <section id="story" className="mx-auto max-w-[1240px] scroll-mt-24 px-5 pt-20">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <Reveal>
            <div className="relative">
              <div className="aspect-[4/5] overflow-hidden rounded-t-[160px]" style={{ containerType: 'inline-size' }}>
                <SmartImg src="https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=900&q=80" seed="roastery-floor" label="The roastery" alt="Inside the roastery" className="h-full w-full transition-transform duration-700 hover:scale-[1.06]" />
              </div>
              <div className="anim-floaty absolute -right-2 top-8 hidden rounded-full bg-espresso p-4 text-gold sm:block">
                <Coffee className="h-7 w-7" />
              </div>
            </div>
          </Reveal>
          <Reveal delay={80}>
            <p className="text-[11px] uppercase tracking-label text-gold">{story.eyebrow}</p>
            <h2 className="mt-2 font-display text-4xl sm:text-5xl">{story.title}</h2>
            <p className="mt-4 leading-relaxed text-smoke">{story.body1}</p>
            <p className="mt-3 leading-relaxed text-smoke">{story.body2}</p>
            <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4">
              {story.stats.map((s) => (
                <div key={s.label}>
                  <p className="font-display text-3xl text-espresso">
                    <CountUp to={s.value} suffix={s.suffix} decimals={s.decimals || 0} />
                  </p>
                  <p className="mt-0.5 text-[10px] uppercase tracking-label text-smoke">{s.label}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* bean → roast → brew steps */}
      <section className="mx-auto max-w-[1240px] px-5 pt-24">
        <SectionHead eyebrow="From farm to cup" title="Three steps, zero shortcuts" />
        <div className="grid gap-5 sm:grid-cols-3">
          {steps.map((st, i) => {
            const Icon = stepIcons[i];
            return (
              <Reveal key={st.title} delay={i * 90}>
                <div className="group relative h-full overflow-hidden border border-line bg-foam p-7 text-center transition-shadow hover:shadow-[0_24px_50px_-28px_rgba(36,22,16,.45)]">
                  <div className="anim-floaty mx-auto grid h-14 w-14 place-items-center rounded-full bg-espresso text-gold" style={{ animationDelay: `${i * 0.5}s` }}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <p className="mt-4 text-[10px] uppercase tracking-label text-gold">Step {i + 1}</p>
                  <h3 className="mt-1 font-display text-2xl">{st.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-smoke">{st.body}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* featured drinks */}
      <section className="mx-auto max-w-[1240px] px-5 pt-24">
        <SectionHead eyebrow="House favourites" title="What everyone orders" sub="Tap + to add straight to your order — the full menu has twenty more reasons to stay." />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((m, i) => (
            <Reveal key={m.id} delay={Math.min(i, 5) * 50}>
              <div className="group flex h-full flex-col overflow-hidden border border-line bg-foam transition-shadow hover:shadow-[0_24px_50px_-28px_rgba(36,22,16,.45)]">
                <div className="relative aspect-[4/3] overflow-hidden" style={{ containerType: 'inline-size' }}>
                  <SmartImg src={m.image} seed={m.name} label={m.category} alt={m.name} className="h-full w-full transition-transform duration-700 group-hover:scale-[1.08]" />
                  {m.tag && (
                    <span className="absolute left-3 top-3 bg-espresso px-2.5 py-1 text-[10px] uppercase tracking-label text-gold">{m.tag}</span>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-display text-2xl leading-tight">{m.name}</h3>
                    <span className="font-semibold">{money(m.price)}</span>
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-smoke">{m.description}</p>
                  <button
                    onClick={() => add({ id: m.id, name: m.name, price: m.price })}
                    className="mt-4 flex items-center justify-center gap-2 bg-espresso py-3 text-[11px] uppercase tracking-label text-foam transition-colors hover:bg-gold hover:text-espresso"
                  >
                    <Plus className="h-4 w-4" /> Add to order
                  </button>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link to="/menu" className="group inline-flex items-center gap-1.5 border-b border-espresso pb-0.5 text-[11px] uppercase tracking-label hover:text-gold">
            View the full menu <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </section>

      {/* gold luxe band */}
      <section className="relative mt-24 overflow-hidden bg-[radial-gradient(120%_120%_at_50%_0%,#E4C489_0%,#B98F52_55%,#7A5326_100%)] py-20 text-espresso">
        <Ribbons />
        <IceField n={6} />
        <div className="relative mx-auto grid max-w-[1240px] items-center gap-8 px-5 lg:grid-cols-[1fr_.7fr]">
          <Reveal>
            <p className="text-[11px] uppercase tracking-label text-espresso/70">Limited summer drop</p>
            <h2 className="mt-2 font-display text-4xl sm:text-6xl">The Iced Luxe<br /><span className="italic">Collection.</span></h2>
            <p className="mt-4 max-w-md leading-relaxed text-espresso/75">
              Eighteen-hour cold brew, Spanish lattes over crystal ice and a gold-dusted affogato. Available until the heat gives up — it won't.
            </p>
            <Link to="/menu?cat=Iced%20%26%20Cold%20Brew" className="mt-7 inline-block bg-espresso px-9 py-4 text-[11px] font-semibold uppercase tracking-label text-foam transition-colors hover:bg-foam hover:text-espresso">
              Order the collection
            </Link>
          </Reveal>
          <Reveal delay={120} className="relative mx-auto h-[300px] w-[240px]">
            <div className="absolute inset-x-4 bottom-4 top-8 rounded-full bg-white/40 blur-3xl" />
            <div className="anim-floaty relative h-full w-full overflow-hidden rounded-[1.75rem] shadow-[0_24px_50px_-14px_rgba(20,10,5,.5)] ring-1 ring-white/25">
              <img src="https://images.unsplash.com/photo-1559496417-e7f25cb247f3?auto=format&fit=crop&w=800&q=80" alt="Iced coffee" className="h-full w-full object-cover" loading="lazy" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* testimonials */}
      <section className="mx-auto max-w-[1240px] px-5 pt-24">
        <SectionHead eyebrow="Regulars, in their words" title="Reviews from the counter" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.slice(0, 6).map((t, i) => (
            <Reveal key={t.id} delay={Math.min(i, 5) * 40}>
              <figure className="flex h-full flex-col border border-line bg-foam p-6">
                <Stars n={t.stars} />
                <blockquote className="mt-3 text-[15px] leading-relaxed text-espresso/80">“{t.text}”</blockquote>
                <figcaption className="mt-auto pt-4 text-[11px] uppercase tracking-label text-smoke">{t.name}</figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </section>

      {/* gallery strip */}
      <section className="mx-auto max-w-[1240px] px-5 pt-24">
        <SectionHead eyebrow="Around the café" title="A look inside" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {gallery.slice(0, 6).map((g, i) => (
            <Reveal key={g.id} delay={Math.min(i, 5) * 40}>
              <figure className={`group overflow-hidden ${i % 3 === 1 ? 'aspect-[3/4]' : 'aspect-square'}`} style={{ containerType: 'inline-size' }}>
                <SmartImg src={g.url} seed={g.title} label={g.title} alt={g.title} className="h-full w-full transition-transform duration-700 group-hover:scale-[1.05]" />
              </figure>
            </Reveal>
          ))}
        </div>
      </section>

      {/* order band */}
      <section className="mx-auto max-w-[1240px] px-5 pt-24">
        <div className="relative overflow-hidden bg-espresso px-6 py-16 text-center text-foam">
          <BeanField n={8} light />
          <div className="relative">
            <h2 className="font-display text-4xl sm:text-5xl">{orderBand.title}</h2>
            <p className="mx-auto mt-3 max-w-md text-foam/70">{orderBand.sub}</p>
            <Link to="/menu" className="anim-glow mt-7 inline-block bg-gold px-10 py-4 text-[11px] font-semibold uppercase tracking-label text-espresso transition-colors hover:bg-foam">
              {orderBand.cta}
            </Link>
            <p className="mt-4 text-xs text-foam/50">
              {settings?.hours || 'Open daily · 8:00 am – 11:00 pm'} · {settings?.address || brand.address}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
