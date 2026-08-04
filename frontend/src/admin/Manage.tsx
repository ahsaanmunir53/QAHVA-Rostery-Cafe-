import { useEffect, useState } from 'react';
import { Loader2, Plus, Trash2, Pencil, Check, X, Star } from 'lucide-react';
import { adminGet, adminPost, adminPatch, adminDelete } from '../lib/api';
import type { MenuItem, GalleryItem, Testimonial, Message, AdminSettings } from '../lib/types';
import { money, SmartImg } from '../ui';
import { card, inputCls, btnDark, btnGhost } from './Admin';

/* ---------------- menu ---------------- */
const emptyItem = { name: '', category: 'Espresso Bar', price: '', description: '', featured: false, soldOut: false, tag: '', image: '' };

export function MenuAdmin() {
  const [list, setList] = useState<MenuItem[]>([]);
  const [form, setForm] = useState<typeof emptyItem>(emptyItem);
  const [editing, setEditing] = useState<string | null>(null);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const fetchList = () => adminGet<MenuItem[]>('/api/menu').then((r) => r.ok && setList(r.data));
  useEffect(() => { fetchList(); }, []);

  const save = async () => {
    setErr(''); setBusy(true);
    const body = { ...form, price: Number(form.price) };
    const r = editing
      ? await adminPatch<MenuItem>(`/api/admin/menu/${editing}`, body)
      : await adminPost<MenuItem>('/api/admin/menu', body);
    setBusy(false);
    if (!r.ok) return setErr((r.data as { error?: string }).error || 'Could not save.');
    setForm(emptyItem); setEditing(null); fetchList();
  };

  const startEdit = (m: MenuItem) => {
    setEditing(m.id);
    setForm({ name: m.name, category: m.category, price: String(m.price), description: m.description, featured: m.featured, soldOut: m.soldOut, tag: m.tag, image: m.image });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleSoldOut = async (m: MenuItem) => {
    const r = await adminPatch<MenuItem>(`/api/admin/menu/${m.id}`, { soldOut: !m.soldOut });
    if (r.ok) setList((xs) => xs.map((x) => (x.id === m.id ? { ...x, soldOut: !m.soldOut } : x)));
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this item from the menu?')) return;
    const r = await adminDelete(`/api/admin/menu/${id}`);
    if (r.ok) setList((xs) => xs.filter((m) => m.id !== id));
  };

  const categories = ['Espresso Bar', 'Slow Brews', 'Iced & Cold Brew', 'Qahva & Chai', 'Bakery', ...new Set(list.map((m) => m.category))].filter((v, i, a) => a.indexOf(v) === i);

  return (
    <>
      <div className={`${card} mb-6 p-5`}>
        <h2 className="mb-4 font-display text-xl">{editing ? 'Edit item' : 'Add a menu item'}</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <input className={inputCls} placeholder="Item name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <div className="flex gap-2">
            <select className={inputCls} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {categories.map((c) => <option key={c}>{c}</option>)}
            </select>
            <input className={`${inputCls} w-24`} placeholder="New…" onBlur={(e) => e.target.value.trim() && setForm({ ...form, category: e.target.value.trim() })} />
          </div>
          <input className={inputCls} type="number" placeholder="Price (Rs) *" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          <input className={inputCls} placeholder="Tag (new / bestseller)" value={form.tag} onChange={(e) => setForm({ ...form, tag: e.target.value })} />
        </div>
        <textarea className={`${inputCls} mt-3`} rows={2} placeholder="Short description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <input className={`${inputCls} mt-3`} placeholder="Image URL (optional — placeholder art shows until set)" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
        <div className="mt-3 flex flex-wrap gap-5 text-sm text-smoke">
          <label className="flex items-center gap-2"><input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} /> Featured on homepage</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={form.soldOut} onChange={(e) => setForm({ ...form, soldOut: e.target.checked })} /> Sold out today</label>
        </div>
        {err && <p className="mt-2 text-sm text-copper">{err}</p>}
        <div className="mt-4 flex gap-2">
          <button onClick={save} disabled={busy} className={`${btnDark} flex items-center gap-2`}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} {editing ? 'Save changes' : 'Add item'}
          </button>
          {editing && <button className={btnGhost} onClick={() => { setEditing(null); setForm(emptyItem); }}>Cancel</button>}
        </div>
      </div>

      <div className={`${card} overflow-x-auto`}>
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b border-line text-left text-[10px] uppercase tracking-label text-smoke">
              <th className="px-4 py-3">Item</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Featured</th>
              <th className="px-4 py-3">Availability</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {list.map((m) => (
              <tr key={m.id} className={m.soldOut ? 'opacity-60' : ''}>
                <td className="px-4 py-3">
                  <p className="font-medium">{m.name} {m.tag && <span className="ml-1 rounded bg-cream px-1.5 py-0.5 text-[10px] uppercase tracking-label text-gold">{m.tag}</span>}</p>
                  <p className="max-w-[300px] text-xs text-smoke">{m.description}</p>
                </td>
                <td className="px-4 py-3">{m.category}</td>
                <td className="px-4 py-3">{money(m.price)}</td>
                <td className="px-4 py-3">{m.featured ? <Check className="h-4 w-4 text-gold" /> : <X className="h-4 w-4 text-line" />}</td>
                <td className="px-4 py-3">
                  <button onClick={() => toggleSoldOut(m)} className={`rounded px-2 py-1 text-[11px] font-medium ${m.soldOut ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-800'}`}>
                    {m.soldOut ? 'Sold out' : 'Available'}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1.5">
                    <button className={btnGhost} onClick={() => startEdit(m)} aria-label="Edit"><Pencil className="h-3.5 w-3.5" /></button>
                    <button className={`${btnGhost} text-copper`} onClick={() => remove(m.id)} aria-label="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* ---------------- gallery ---------------- */
export function GalleryAdmin() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [form, setForm] = useState({ title: '', url: '' });
  const [err, setErr] = useState('');
  useEffect(() => { adminGet<GalleryItem[]>('/api/gallery').then((r) => r.ok && setItems(r.data)); }, []);
  const add = async () => {
    setErr('');
    const r = await adminPost<GalleryItem>('/api/admin/gallery', form);
    if (!r.ok) return setErr((r.data as { error?: string }).error || 'Could not add.');
    setItems((xs) => [r.data, ...xs]);
    setForm({ title: '', url: '' });
  };
  const remove = async (id: string) => {
    if (!confirm('Remove this photo?')) return;
    const r = await adminDelete(`/api/admin/gallery/${id}`);
    if (r.ok) setItems((xs) => xs.filter((g) => g.id !== id));
  };
  return (
    <>
      <div className={`${card} mb-6 p-5`}>
        <h2 className="mb-1 font-display text-xl">Add a photo</h2>
        <p className="mb-4 text-xs text-smoke">Paste an image URL. Leave it empty and elegant coffee-toned art shows until the real photo is ready.</p>
        <div className="grid gap-3 sm:grid-cols-[1fr_1.6fr_auto]">
          <input className={inputCls} placeholder="Title * (e.g. Latte art)" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <input className={inputCls} placeholder="Image URL (optional)" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
          <button onClick={add} className={`${btnDark} flex items-center gap-2`}><Plus className="h-4 w-4" /> Add</button>
        </div>
        {err && <p className="mt-2 text-sm text-copper">{err}</p>}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((g) => (
          <figure key={g.id} className={`${card} group relative overflow-hidden`}>
            <div className="aspect-square" style={{ containerType: 'inline-size' }}>
              <SmartImg src={g.url} seed={g.title} label={g.title} alt={g.title} className="h-full w-full" />
            </div>
            <button onClick={() => remove(g.id)} className="absolute right-2 top-2 rounded bg-espresso/70 p-1.5 text-foam opacity-0 transition-opacity hover:bg-copper group-hover:opacity-100" aria-label="Delete">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </figure>
        ))}
      </div>
    </>
  );
}

/* ---------------- testimonials ---------------- */
export function TestimonialsAdmin() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [form, setForm] = useState({ name: '', text: '', stars: 5, approved: true });
  const [err, setErr] = useState('');
  useEffect(() => { adminGet<Testimonial[]>('/api/admin/testimonials').then((r) => r.ok && setItems(r.data)); }, []);
  const add = async () => {
    setErr('');
    const r = await adminPost<Testimonial>('/api/admin/testimonials', form);
    if (!r.ok) return setErr((r.data as { error?: string }).error || 'Could not add.');
    setItems((xs) => [r.data, ...xs]);
    setForm({ name: '', text: '', stars: 5, approved: true });
  };
  const toggle = async (t: Testimonial) => {
    const r = await adminPatch<Testimonial>(`/api/admin/testimonials/${t.id}`, { approved: !t.approved });
    if (r.ok) setItems((xs) => xs.map((x) => (x.id === t.id ? { ...x, approved: !t.approved } : x)));
  };
  const remove = async (id: string) => {
    if (!confirm('Delete this review?')) return;
    const r = await adminDelete(`/api/admin/testimonials/${id}`);
    if (r.ok) setItems((xs) => xs.filter((x) => x.id !== id));
  };
  return (
    <>
      <div className={`${card} mb-6 p-5`}>
        <h2 className="mb-4 font-display text-xl">Add a review</h2>
        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <input className={inputCls} placeholder="Customer name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <select className={inputCls} value={form.stars} onChange={(e) => setForm({ ...form, stars: Number(e.target.value) })}>
            {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} stars</option>)}
          </select>
        </div>
        <textarea className={`${inputCls} mt-3`} rows={2} placeholder="Review text *" value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} />
        {err && <p className="mt-2 text-sm text-copper">{err}</p>}
        <button onClick={add} className={`${btnDark} mt-4 flex items-center gap-2`}><Plus className="h-4 w-4" /> Add review</button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {items.map((t) => (
          <div key={t.id} className={`${card} p-5`}>
            <div className="flex items-center justify-between">
              <span className="inline-flex gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => <Star key={i} className={`h-4 w-4 ${i <= t.stars ? 'fill-gold text-gold' : 'text-line'}`} />)}
              </span>
              <span className={`rounded px-2 py-0.5 text-[11px] font-medium ${t.approved ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'}`}>
                {t.approved ? 'Live on site' : 'Hidden'}
              </span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-espresso/80">“{t.text}”</p>
            <p className="mt-2 text-[11px] uppercase tracking-label text-smoke">{t.name}</p>
            <div className="mt-3 flex gap-2">
              <button className={btnGhost} onClick={() => toggle(t)}>{t.approved ? 'Hide' : 'Publish'}</button>
              <button className={`${btnGhost} text-copper`} onClick={() => remove(t.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

/* ---------------- messages ---------------- */
export function MessagesAdmin() {
  const [items, setItems] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    adminGet<Message[]>('/api/admin/messages').then((r) => { if (r.ok) setItems(r.data); setLoading(false); });
  }, []);
  const remove = async (id: string) => {
    if (!confirm('Delete this message?')) return;
    const r = await adminDelete(`/api/admin/messages/${id}`);
    if (r.ok) setItems((xs) => xs.filter((m) => m.id !== id));
  };
  return (
    <div className="space-y-3">
      {loading ? (
        <p className="text-smoke">Loading…</p>
      ) : items.length === 0 ? (
        <p className={`${card} px-5 py-8 text-sm text-smoke`}>No messages yet — contact-form submissions land here.</p>
      ) : (
        items.map((m) => (
          <div key={m.id} className={`${card} p-5`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-medium">{m.name} {m.phone && <span className="text-xs font-normal text-smoke">· {m.phone}</span>}</p>
              <div className="flex items-center gap-3">
                <span className="text-xs text-smoke">{new Date(m.at).toLocaleString()}</span>
                <button className={`${btnGhost} text-copper`} onClick={() => remove(m.id)}><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-espresso/80">{m.message}</p>
          </div>
        ))
      )}
    </div>
  );
}

/* ---------------- settings ---------------- */
export function SettingsAdmin() {
  const [s, setS] = useState<AdminSettings | null>(null);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState('');
  const [pw, setPw] = useState({ current: '', next: '' });
  const [pwMsg, setPwMsg] = useState('');

  useEffect(() => { adminGet<AdminSettings>('/api/admin/settings').then((r) => r.ok && setS(r.data)); }, []);
  if (!s) return <p className="text-smoke">Loading…</p>;
  const upd = (k: keyof AdminSettings, v: string | number | boolean) => setS({ ...s, [k]: v } as AdminSettings);

  const save = async () => {
    setErr(''); setSaved(false);
    const r = await adminPatch<AdminSettings>('/api/admin/settings', s);
    if (!r.ok) return setErr('Could not save settings.');
    setS(r.data); setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };
  const changePw = async () => {
    setPwMsg('');
    const r = await adminPost<{ error?: string }>('/api/admin/change-password', pw);
    if (!r.ok) return setPwMsg((r.data as { error?: string }).error || 'Could not change password.');
    setPw({ current: '', next: '' });
    setPwMsg('Password updated. You stay signed in on this device.');
  };
  const L = ({ children }: { children: string }) => <label className="mb-1 block text-[10px] uppercase tracking-label text-smoke">{children}</label>;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className={`${card} p-5`}>
        <h2 className="mb-4 font-display text-xl">Café details</h2>
        <div className="space-y-3">
          <div><L>Phone (display)</L><input className={inputCls} value={s.phone} onChange={(e) => upd('phone', e.target.value)} /></div>
          <div><L>WhatsApp (digits only, intl format)</L><input className={inputCls} value={s.whatsapp} onChange={(e) => upd('whatsapp', e.target.value)} /></div>
          <div><L>Email</L><input className={inputCls} value={s.email} onChange={(e) => upd('email', e.target.value)} /></div>
          <div><L>Address</L><input className={inputCls} value={s.address} onChange={(e) => upd('address', e.target.value)} /></div>
          <div><L>Opening hours (shown site-wide)</L><input className={inputCls} value={s.hours} onChange={(e) => upd('hours', e.target.value)} /></div>
        </div>
      </div>

      <div className={`${card} p-5`}>
        <h2 className="mb-4 font-display text-xl">Ordering</h2>
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div><L>Delivery fee (Rs)</L><input className={inputCls} type="number" min={0} value={s.deliveryFee} onChange={(e) => upd('deliveryFee', Number(e.target.value))} /></div>
            <div><L>Free delivery over (Rs)</L><input className={inputCls} type="number" min={0} value={s.freeOver} onChange={(e) => upd('freeOver', Number(e.target.value))} /></div>
          </div>
          <label className="flex items-center gap-2 border border-line px-4 py-3 text-sm">
            <input type="checkbox" checked={s.openForOrders} onChange={(e) => upd('openForOrders', e.target.checked)} />
            Online ordering is <span className={s.openForOrders ? 'font-semibold text-emerald-700' : 'font-semibold text-copper'}>{s.openForOrders ? 'OPEN' : 'PAUSED'}</span>
          </label>
          <p className="text-xs text-smoke">Pause ordering at closing time or when the kitchen is slammed — the website shows a friendly notice instantly.</p>
        </div>
        {err && <p className="mt-3 text-sm text-copper">{err}</p>}
        <button onClick={save} className={`${btnDark} mt-4`}>Save settings</button>
        {saved && <span className="ml-3 text-sm text-emerald-700">Saved ✓</span>}
      </div>

      <div className={`${card} p-5 lg:col-span-2`}>
        <h2 className="mb-4 font-display text-xl">Change password</h2>
        <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
          <input className={inputCls} type="password" placeholder="Current password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} />
          <input className={inputCls} type="password" placeholder="New password (min 8 chars)" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} />
          <button onClick={changePw} className={btnDark}>Update</button>
        </div>
        {pwMsg && <p className="mt-2 text-sm text-smoke">{pwMsg}</p>}
      </div>
    </div>
  );
}
