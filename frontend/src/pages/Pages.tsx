import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Loader2, MessageCircle, Plus, Store, Bike } from 'lucide-react';
import { pages, brand } from '../data/site';
import { apiGet, apiPost } from '../lib/api';
import { useCart } from '../lib/cart';
import type { MenuItem, PublicSettings } from '../lib/types';
import { SmartImg, Reveal, money, BeanField } from '../ui';

function PageHead({ title, intro }: { title: string; intro: string }) {
  return (
    <header className="relative overflow-hidden bg-espresso px-5 py-16 text-center text-foam">
      <BeanField n={6} light />
      <div className="relative">
        <h1 className="font-display text-4xl sm:text-6xl">{title}</h1>
        <p className="mx-auto mt-3 max-w-xl text-foam/70">{intro}</p>
      </div>
    </header>
  );
}

/* ---------------- menu ---------------- */
export function MenuPage() {
  const { add } = useCart();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [params, setParams] = useSearchParams();
  const cat = params.get('cat') || 'All';

  useEffect(() => {
    apiGet<MenuItem[]>('/api/menu').then((r) => r.ok && setItems(r.data)).finally(() => setLoading(false));
  }, []);

  const categories = ['All', ...new Set(items.map((m) => m.category))];
  const visible = cat === 'All' ? items : items.filter((m) => m.category === cat);

  return (
    <div>
      <PageHead title={pages.menu.title} intro={pages.menu.intro} />
      <div className="mx-auto max-w-[1240px] px-5 py-12">
        <div className="mb-8 flex flex-wrap justify-center gap-2">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setParams(c === 'All' ? {} : { cat: c })}
              className={`px-4 py-2 text-[11px] uppercase tracking-label transition-colors ${cat === c ? 'bg-espresso text-foam' : 'border border-line hover:border-espresso'}`}
            >
              {c}
            </button>
          ))}
        </div>
        {loading ? (
          <p className="text-center text-smoke">Grinding through the menu…</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((m, i) => (
              <Reveal key={m.id} delay={Math.min(i, 6) * 30}>
                <div className={`group flex h-full flex-col overflow-hidden border border-line bg-foam transition-shadow hover:shadow-[0_24px_50px_-28px_rgba(36,22,16,.45)] ${m.soldOut ? 'opacity-70' : ''}`}>
                  <div className="relative aspect-[4/3] overflow-hidden" style={{ containerType: 'inline-size' }}>
                    <SmartImg src={m.image} seed={m.name} label={m.category} alt={m.name} className="h-full w-full transition-transform duration-700 group-hover:scale-[1.08]" />
                    {m.soldOut ? (
                      <span className="absolute left-3 top-3 bg-espresso px-2.5 py-1 text-[10px] uppercase tracking-label text-foam">Sold out today</span>
                    ) : m.tag ? (
                      <span className="absolute left-3 top-3 bg-espresso px-2.5 py-1 text-[10px] uppercase tracking-label text-gold">{m.tag}</span>
                    ) : null}
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-display text-2xl leading-tight">{m.name}</h3>
                      <span className="font-semibold">{money(m.price)}</span>
                    </div>
                    <p className="mt-1.5 text-sm leading-relaxed text-smoke">{m.description}</p>
                    <button
                      disabled={m.soldOut}
                      onClick={() => add({ id: m.id, name: m.name, price: m.price })}
                      className="mt-4 flex items-center justify-center gap-2 bg-espresso py-3 text-[11px] uppercase tracking-label text-foam transition-colors hover:bg-gold hover:text-espresso disabled:cursor-not-allowed disabled:bg-line disabled:text-smoke"
                    >
                      <Plus className="h-4 w-4" /> {m.soldOut ? 'Back tomorrow' : 'Add to order'}
                    </button>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- checkout ---------------- */
export function CheckoutPage({ settings }: { settings: PublicSettings | null }) {
  const { lines, subtotal, setQty, remove, clear } = useCart();
  const navigate = useNavigate();
  const [type, setType] = useState<'Pickup' | 'Delivery'>('Pickup');
  const [form, setForm] = useState({ name: '', phone: '', address: '', notes: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ id: string; total: number } | null>(null);

  const deliveryFee = useMemo(() => {
    if (type !== 'Delivery' || !settings) return 0;
    return subtotal >= settings.freeOver ? 0 : settings.deliveryFee;
  }, [type, subtotal, settings]);
  const total = subtotal + deliveryFee;
  const input = 'w-full border border-line bg-foam px-4 py-3 text-sm outline-none focus:border-espresso';
  const wa = settings?.whatsapp || brand.whatsapp;

  const submit = async () => {
    if (lines.length === 0) return setErr('Your order is empty — add something from the menu first.');
    if (!form.name.trim()) return setErr('Please enter your name.');
    if (!form.phone.trim()) return setErr('Please enter your phone number.');
    if (type === 'Delivery' && !form.address.trim()) return setErr('Please enter your delivery address.');
    setErr('');
    setBusy(true);
    const r = await apiPost<{ ok: boolean; id: string; total: number; error?: string }>('/api/orders', {
      type,
      customer: form,
      items: lines.map((l) => ({ id: l.id, qty: l.qty })),
    }).catch(() => ({ ok: false, status: 0, data: {} }) as const);
    setBusy(false);
    if (!r.ok) return setErr((r.data as { error?: string }).error || 'Could not place the order — is the backend running?');
    setDone({ id: (r.data as { id: string }).id, total: (r.data as { total: number }).total });
    clear();
  };

  if (done)
    return (
      <div className="mx-auto max-w-xl px-5 py-24 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-gold" />
        <h1 className="mt-4 font-display text-4xl">Order in, {form.name.split(' ')[0]}!</h1>
        <p className="mt-3 text-espresso/75">
          Order <span className="font-semibold">#{done.id.slice(0, 8).toUpperCase()}</span> for{' '}
          <span className="font-semibold">{money(done.total)}</span> is with our baristas.{' '}
          {type === 'Pickup' ? 'It should be ready in about 15 minutes.' : 'The rider will call when nearby — pay cash on delivery.'}
        </p>
        <div className="mt-7 flex flex-col items-center gap-3">
          <a
            href={`https://wa.me/${wa}?text=${encodeURIComponent(`Hello! I just placed order #${done.id.slice(0, 8).toUpperCase()} (${money(done.total)}, ${type}).`)}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 bg-espresso px-8 py-3.5 text-[11px] uppercase tracking-label text-foam hover:bg-gold hover:text-espresso"
          >
            <MessageCircle className="h-4 w-4" /> Track on WhatsApp
          </a>
          <button onClick={() => navigate('/menu')} className="text-xs text-smoke underline underline-offset-2 hover:text-gold">
            Order something else
          </button>
        </div>
      </div>
    );

  return (
    <div>
      <PageHead title={pages.checkout.title} intro={pages.checkout.intro} />
      {settings && !settings.openForOrders && (
        <p className="mx-auto mt-6 max-w-[1000px] border border-copper/40 bg-copper/10 px-4 py-3 text-center text-sm text-copper">
          Online ordering is paused right now — call or WhatsApp us instead.
        </p>
      )}
      <div className="mx-auto grid max-w-[1000px] gap-10 px-5 py-12 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-6">
          <div>
            <p className="mb-3 text-[11px] uppercase tracking-label text-smoke">How do you want it?</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {([['Pickup', Store, 'Ready in ~15 min — skip the queue.'], ['Delivery', Bike, settings ? `Rs.${settings.deliveryFee} · free over ${money(settings.freeOver)}` : 'City-wide, cash on delivery.']] as const).map(([t, Icon, sub]) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`border px-4 py-3.5 text-left transition-colors ${type === t ? 'border-espresso bg-espresso text-foam' : 'border-line hover:border-espresso'}`}
                >
                  <span className="flex items-center gap-2 text-[11px] uppercase tracking-label"><Icon className="h-4 w-4" /> {t}</span>
                  <span className={`mt-0.5 block text-xs ${type === t ? 'text-foam/70' : 'text-smoke'}`}>{sub}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-3 text-[11px] uppercase tracking-label text-smoke">Your details</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <input className={input} placeholder="Full name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <input className={input} placeholder="Phone / WhatsApp *" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            {type === 'Delivery' && (
              <input className={`${input} mt-3`} placeholder="Delivery address *" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            )}
            <input className={`${input} mt-3`} placeholder="Notes — oat milk, extra shot, less ice… (optional)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>

          {err && <p className="border border-copper/40 bg-copper/10 px-4 py-3 text-sm text-copper">{err}</p>}
          <button
            onClick={submit}
            disabled={busy || (settings ? !settings.openForOrders : false)}
            className="anim-glow flex w-full items-center justify-center gap-2 bg-gold py-4 text-[11px] font-semibold uppercase tracking-label text-espresso transition-colors hover:bg-espresso hover:text-foam disabled:opacity-50"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />} Place order · {money(total)}
          </button>
          <p className="text-center text-xs text-smoke">Pay at the counter or cash on delivery. We confirm every order on WhatsApp.</p>
        </div>

        <aside className="h-fit border border-line bg-foam p-5 lg:sticky lg:top-28">
          <p className="text-[11px] uppercase tracking-label text-smoke">Order summary</p>
          {lines.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-smoke">Nothing here yet.</p>
              <Link to="/menu" className="mt-3 inline-block border border-espresso px-6 py-2.5 text-[11px] uppercase tracking-label hover:bg-espresso hover:text-foam">
                Browse the menu
              </Link>
            </div>
          ) : (
            <>
              <div className="mt-3 divide-y divide-line">
                {lines.map((l) => (
                  <div key={l.id} className="flex items-center gap-3 py-3">
                    <div className="flex-1">
                      <p className="font-display leading-tight">{l.name}</p>
                      <p className="text-xs text-smoke">{money(l.price)} each</p>
                    </div>
                    <div className="flex items-center border border-line text-sm">
                      <button className="h-7 w-7 hover:bg-cream" onClick={() => setQty(l.id, l.qty - 1)}>−</button>
                      <span className="w-7 text-center">{l.qty}</span>
                      <button className="h-7 w-7 hover:bg-cream" onClick={() => setQty(l.id, l.qty + 1)}>+</button>
                    </div>
                    <button className="text-xs text-smoke underline hover:text-copper" onClick={() => remove(l.id)}>remove</button>
                  </div>
                ))}
              </div>
              <div className="mt-4 space-y-1.5 border-t border-line pt-4 text-sm">
                <div className="flex justify-between"><span className="text-smoke">Subtotal</span><span>{money(subtotal)}</span></div>
                <div className="flex justify-between"><span className="text-smoke">{type === 'Delivery' ? 'Delivery' : 'Pickup'}</span><span>{deliveryFee === 0 ? 'Free' : money(deliveryFee)}</span></div>
                <div className="flex justify-between pt-1.5 font-display text-xl"><span>Total</span><span>{money(total)}</span></div>
              </div>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}

/* ---------------- contact ---------------- */
export function ContactPage({ settings }: { settings: PublicSettings | null }) {
  const [form, setForm] = useState({ name: '', phone: '', message: '' });
  const [state, setState] = useState<'idle' | 'busy' | 'done'>('idle');
  const [err, setErr] = useState('');
  const input = 'w-full border border-line bg-foam px-4 py-3 text-sm outline-none focus:border-espresso';
  const submit = async () => {
    if (!form.name.trim() || !form.message.trim()) return setErr('Please add your name and a message.');
    setErr('');
    setState('busy');
    const r = await apiPost('/api/contact', form).catch(() => ({ ok: false }) as const);
    if (r.ok) setState('done');
    else { setErr('Could not send right now — WhatsApp us instead.'); setState('idle'); }
  };
  const wa = settings?.whatsapp || brand.whatsapp;
  return (
    <div>
      <PageHead title={pages.contact.title} intro={pages.contact.intro} />
      <div className="mx-auto grid max-w-[1000px] gap-10 px-5 py-12 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <div className="aspect-[4/3] overflow-hidden" style={{ containerType: 'inline-size' }}>
            <SmartImg src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80" seed="find-the-roastery" label="Find us" alt="The roastery on MM Alam Road" className="h-full w-full transition-transform duration-700 hover:scale-[1.06]" />
          </div>
          <ul className="mt-6 space-y-2.5 text-sm">
            <li><span className="text-smoke">Address · </span>{settings?.address || brand.address}</li>
            <li><span className="text-smoke">Phone · </span>{settings?.phone || brand.phoneDisplay}</li>
            <li><span className="text-smoke">Email · </span>{settings?.email || brand.email}</li>
            <li><span className="text-smoke">Hours · </span>{settings?.hours || 'Open daily · 8:00 am – 11:00 pm'}</li>
          </ul>
        </div>
        <div>
          {state === 'done' ? (
            <p className="border border-gold/40 bg-gold/10 px-4 py-4 text-sm">Thanks — your message is in. We reply within a working day (usually much faster).</p>
          ) : (
            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <input className={input} placeholder="Your name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                <input className={input} placeholder="Phone / WhatsApp" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <textarea className={input} rows={6} placeholder="How can we help? *" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
              {err && <p className="text-sm text-copper">{err}</p>}
              <div className="flex flex-wrap gap-3">
                <button onClick={submit} className="flex items-center gap-2 bg-espresso px-8 py-3.5 text-[11px] uppercase tracking-label text-foam hover:bg-gold hover:text-espresso">
                  {state === 'busy' && <Loader2 className="h-4 w-4 animate-spin" />} Send message
                </button>
                <a href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 border border-espresso px-8 py-3.5 text-[11px] uppercase tracking-label hover:bg-espresso hover:text-foam">
                  <MessageCircle className="h-4 w-4" /> WhatsApp us
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------- 404 ---------------- */
export function NotFound() {
  return (
    <div className="mx-auto max-w-[1240px] px-5 py-28 text-center">
      <p className="text-[11px] uppercase tracking-label text-smoke">404</p>
      <h1 className="mt-2 font-display text-5xl">This page went for a coffee break.</h1>
      <Link to="/" className="mt-7 inline-block border border-espresso px-8 py-3 text-[11px] uppercase tracking-label hover:bg-espresso hover:text-foam">
        Back to home
      </Link>
    </div>
  );
}
