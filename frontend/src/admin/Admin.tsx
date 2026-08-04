import { ReactNode, useEffect, useState } from 'react';
import { Link, NavLink, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import {
  ClipboardList, CupSoda, Images, MessageSquareQuote, Inbox, Settings as SettingsIcon,
  LayoutDashboard, LogOut, Loader2, Search, KeyRound,
} from 'lucide-react';
import { brand } from '../data/site';
import { adminGet, adminPatch, adminDelete, apiPost, getToken, setToken, clearToken } from '../lib/api';
import type { Order, Stats } from '../lib/types';
import { money } from '../ui';
import { MenuAdmin, GalleryAdmin, TestimonialsAdmin, MessagesAdmin, SettingsAdmin } from './Manage';

export const card = 'border border-line bg-foam';
export const inputCls = 'w-full border border-line bg-foam px-3.5 py-2.5 text-sm outline-none focus:border-espresso';
export const btnDark = 'bg-espresso px-5 py-2.5 text-[11px] uppercase tracking-label text-foam transition-colors hover:bg-gold hover:text-espresso disabled:opacity-50';
export const btnGhost = 'border border-line px-4 py-2 text-xs transition-colors hover:border-espresso';

export function StatusBadge({ s }: { s: Order['status'] }) {
  const map: Record<Order['status'], string> = {
    Pending: 'bg-amber-100 text-amber-800',
    Preparing: 'bg-sky-100 text-sky-800',
    Ready: 'bg-emerald-100 text-emerald-800',
    Completed: 'bg-stone-200 text-stone-700',
    Cancelled: 'bg-rose-100 text-rose-700',
  };
  return <span className={`inline-block rounded px-2 py-0.5 text-[11px] font-medium ${map[s]}`}>{s}</span>;
}

/* ---------------- login ---------------- */
function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [forgot, setForgot] = useState(false);
  const [reset, setReset] = useState({ resetKey: '', next: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const login = async () => {
    setBusy(true); setErr('');
    const r = await apiPost<{ token: string; error?: string }>('/api/admin/login', form).catch(() => ({ ok: false, data: {} }) as const);
    setBusy(false);
    if (!r.ok) return setErr((r.data as { error?: string }).error || 'Could not sign in — is the backend running?');
    setToken((r.data as { token: string }).token);
    navigate('/admin/dashboard');
  };
  const doReset = async () => {
    setBusy(true); setErr('');
    const r = await apiPost<{ error?: string }>('/api/admin/forgot-password', reset).catch(() => ({ ok: false, data: {} }) as const);
    setBusy(false);
    if (!r.ok) return setErr((r.data as { error?: string }).error || 'Reset failed.');
    setForgot(false);
    alert('Password updated — sign in with the new password.');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-5">
      <div className={`${card} w-full max-w-sm p-8`}>
        <p className="text-center font-display text-2xl tracking-[0.22em]">{brand.name}</p>
        <p className="mt-1 text-center text-[10px] uppercase tracking-label text-smoke">Café admin</p>
        {!forgot ? (
          <div className="mt-7 space-y-3">
            <input className={inputCls} placeholder="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
            <input className={inputCls} type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && login()} />
            {err && <p className="text-sm text-copper">{err}</p>}
            <button onClick={login} disabled={busy} className={`${btnDark} flex w-full items-center justify-center gap-2 py-3`}>
              {busy && <Loader2 className="h-4 w-4 animate-spin" />} Sign in
            </button>
            <button onClick={() => { setForgot(true); setErr(''); }} className="mx-auto block text-xs text-smoke underline underline-offset-2 hover:text-gold">Forgot password?</button>
          </div>
        ) : (
          <div className="mt-7 space-y-3">
            <p className="flex items-center gap-2 text-xs text-smoke"><KeyRound className="h-4 w-4" /> Enter the reset key from the server's .env file.</p>
            <input className={inputCls} placeholder="Reset key" value={reset.resetKey} onChange={(e) => setReset({ ...reset, resetKey: e.target.value })} />
            <input className={inputCls} type="password" placeholder="New password (min 8 chars)" value={reset.next} onChange={(e) => setReset({ ...reset, next: e.target.value })} />
            {err && <p className="text-sm text-copper">{err}</p>}
            <button onClick={doReset} disabled={busy} className={`${btnDark} flex w-full items-center justify-center gap-2 py-3`}>
              {busy && <Loader2 className="h-4 w-4 animate-spin" />} Reset password
            </button>
            <button onClick={() => { setForgot(false); setErr(''); }} className="mx-auto block text-xs text-smoke underline underline-offset-2 hover:text-gold">Back to sign in</button>
          </div>
        )}
        <Link to="/" className="mt-6 block text-center text-xs text-smoke hover:text-gold">← Back to website</Link>
      </div>
    </div>
  );
}

/* ---------------- layout ---------------- */
const links = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/orders', label: 'Orders', icon: ClipboardList },
  { to: '/admin/menu', label: 'Menu', icon: CupSoda },
  { to: '/admin/gallery', label: 'Gallery', icon: Images },
  { to: '/admin/testimonials', label: 'Reviews', icon: MessageSquareQuote },
  { to: '/admin/messages', label: 'Messages', icon: Inbox },
  { to: '/admin/settings', label: 'Settings', icon: SettingsIcon },
];

export function Shell({ children, title }: { children: ReactNode; title: string }) {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-screen bg-cream">
      <aside className="hidden w-56 shrink-0 flex-col border-r border-line bg-foam md:flex">
        <div className="border-b border-line px-5 py-5">
          <p className="font-display text-lg tracking-[0.2em]">{brand.name}</p>
          <p className="text-[9px] uppercase tracking-label text-smoke">Café admin</p>
        </div>
        <nav className="flex-1 py-3">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} className={({ isActive }) => `flex items-center gap-3 px-5 py-2.5 text-sm transition-colors ${isActive ? 'bg-cream font-medium text-gold' : 'text-espresso/75 hover:bg-cream'}`}>
              <l.icon className="h-4 w-4" /> {l.label}
            </NavLink>
          ))}
        </nav>
        <button onClick={() => { clearToken(); navigate('/admin'); }} className="flex items-center gap-3 border-t border-line px-5 py-4 text-sm text-espresso/75 hover:text-copper">
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </aside>
      <div className="min-w-0 flex-1">
        <header className="flex items-center justify-between gap-3 border-b border-line bg-foam px-5 py-4">
          <h1 className="font-display text-2xl">{title}</h1>
          <div className="flex items-center gap-3">
            <Link to="/" className="text-xs text-smoke underline underline-offset-2 hover:text-gold">View website</Link>
            <button onClick={() => { clearToken(); navigate('/admin'); }} className="text-xs text-smoke underline underline-offset-2 hover:text-copper md:hidden">Sign out</button>
          </div>
        </header>
        <div className="flex gap-1 overflow-x-auto border-b border-line bg-foam px-3 py-2 md:hidden">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} className={({ isActive }) => `whitespace-nowrap rounded px-3 py-1.5 text-xs ${isActive ? 'bg-espresso text-foam' : 'text-espresso/70'}`}>
              {l.label}
            </NavLink>
          ))}
        </div>
        <main className="p-5">{children}</main>
      </div>
    </div>
  );
}

function Guard({ children }: { children: ReactNode }) {
  if (!getToken()) return <Navigate to="/admin" replace />;
  return <>{children}</>;
}

/* ---------------- dashboard ---------------- */
function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const navigate = useNavigate();
  useEffect(() => {
    adminGet<Stats>('/api/admin/stats').then((r) => {
      if (r.status === 401) return navigate('/admin');
      if (r.ok) setStats(r.data);
    });
  }, []);
  const tiles = stats
    ? [
        { label: 'Orders today', value: stats.today },
        { label: 'Pending', value: stats.pending },
        { label: 'Preparing', value: stats.preparing },
        { label: 'Ready for pickup', value: stats.ready },
        { label: 'Revenue this month', value: money(stats.monthRevenue) },
        { label: 'Messages', value: stats.messages },
      ]
    : [];
  return (
    <Shell title="Dashboard">
      {!stats ? (
        <p className="text-smoke">Loading…</p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tiles.map((t) => (
              <div key={t.label} className={`${card} p-5`}>
                <p className="text-[10px] uppercase tracking-label text-smoke">{t.label}</p>
                <p className="mt-1 font-display text-3xl">{t.value}</p>
              </div>
            ))}
          </div>
          <div className={`${card} mt-6`}>
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <h2 className="font-display text-xl">Latest orders</h2>
              <Link to="/admin/orders" className="text-xs text-smoke underline underline-offset-2 hover:text-gold">View all</Link>
            </div>
            {stats.recent.length === 0 ? (
              <p className="px-5 py-8 text-sm text-smoke">No orders yet — the moment someone orders online, it lands here.</p>
            ) : (
              <div className="divide-y divide-line">
                {stats.recent.map((o) => (
                  <div key={o.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3 text-sm">
                    <span className="font-mono text-xs text-smoke">#{o.id.slice(0, 8).toUpperCase()}</span>
                    <span className="w-36 font-medium">{o.customer.name}</span>
                    <span className="flex-1 text-smoke">{o.items.reduce((s, i) => s + i.qty, 0)} items · {o.type}</span>
                    <span className="font-medium">{money(o.total)}</span>
                    <StatusBadge s={o.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </Shell>
  );
}

/* ---------------- orders ---------------- */
function Orders() {
  const [list, setList] = useState<Order[]>([]);
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const load = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    if (q) params.set('q', q);
    adminGet<Order[]>(`/api/admin/orders?${params}`).then((r) => {
      if (r.status === 401) return navigate('/admin');
      if (r.ok) setList(r.data);
      setLoading(false);
    });
  };
  useEffect(load, [status]);

  const setStatusOf = async (id: string, next: Order['status']) => {
    const r = await adminPatch(`/api/admin/orders/${id}`, { status: next });
    if (r.ok) setList((xs) => xs.map((o) => (o.id === id ? { ...o, status: next } : o)));
  };
  const removeOrder = async (id: string) => {
    if (!confirm('Delete this order permanently?')) return;
    const r = await adminDelete(`/api/admin/orders/${id}`);
    if (r.ok) setList((xs) => xs.filter((o) => o.id !== id));
  };

  return (
    <Shell title="Orders">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <select className={`${inputCls} w-auto`} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {['Pending', 'Preparing', 'Ready', 'Completed', 'Cancelled'].map((s) => <option key={s}>{s}</option>)}
        </select>
        <div className="flex items-center gap-2">
          <input className={`${inputCls} w-56`} placeholder="Search name / phone / order id" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && load()} />
          <button onClick={load} className={btnGhost} aria-label="Search"><Search className="h-4 w-4" /></button>
        </div>
        {(status || q) && (
          <button className="text-xs text-smoke underline underline-offset-2" onClick={() => { setStatus(''); setQ(''); }}>Clear filters</button>
        )}
      </div>

      {loading ? (
        <p className="text-smoke">Loading…</p>
      ) : list.length === 0 ? (
        <p className={`${card} px-5 py-8 text-sm text-smoke`}>No orders match these filters.</p>
      ) : (
        <div className="space-y-3">
          {list.map((o) => (
            <div key={o.id} className={`${card} p-4`}>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <span className="font-mono text-xs text-smoke">#{o.id.slice(0, 8).toUpperCase()}</span>
                <span className="font-medium">{o.customer.name}</span>
                <span className="text-sm text-smoke">{o.customer.phone}</span>
                <span className="rounded bg-cream px-2 py-0.5 text-[11px] uppercase tracking-label text-smoke">{o.type}</span>
                <StatusBadge s={o.status} />
                <span className="ml-auto font-display text-lg">{money(o.total)}</span>
              </div>
              <p className="mt-2 text-sm text-espresso/80">
                {o.items.map((i) => `${i.qty}× ${i.name}`).join(' · ')}
                {o.deliveryFee > 0 && <span className="text-smoke"> · delivery {money(o.deliveryFee)}</span>}
              </p>
              {o.type === 'Delivery' && o.customer.address && <p className="mt-1 text-xs text-smoke">📍 {o.customer.address}</p>}
              {o.customer.notes && <p className="mt-1 text-xs italic text-smoke">"{o.customer.notes}"</p>}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {o.status === 'Pending' && (<><button className={btnGhost} onClick={() => setStatusOf(o.id, 'Preparing')}>Accept & prepare</button><button className={`${btnGhost} text-copper`} onClick={() => setStatusOf(o.id, 'Cancelled')}>Cancel</button></>)}
                {o.status === 'Preparing' && <button className={btnGhost} onClick={() => setStatusOf(o.id, 'Ready')}>Mark ready</button>}
                {o.status === 'Ready' && <button className={btnGhost} onClick={() => setStatusOf(o.id, 'Completed')}>Complete</button>}
                {(o.status === 'Completed' || o.status === 'Cancelled') && (
                  <button className={`${btnGhost} text-copper`} onClick={() => removeOrder(o.id)}>Delete</button>
                )}
                <span className="ml-auto self-center text-xs text-smoke">{new Date(o.createdAt).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Shell>
  );
}

/* ---------------- router ---------------- */
export default function Admin() {
  return (
    <Routes>
      <Route index element={getToken() ? <Navigate to="/admin/dashboard" replace /> : <Login />} />
      <Route path="dashboard" element={<Guard><Dashboard /></Guard>} />
      <Route path="orders" element={<Guard><Orders /></Guard>} />
      <Route path="menu" element={<Guard><Shell title="Menu"><MenuAdmin /></Shell></Guard>} />
      <Route path="gallery" element={<Guard><Shell title="Gallery"><GalleryAdmin /></Shell></Guard>} />
      <Route path="testimonials" element={<Guard><Shell title="Reviews"><TestimonialsAdmin /></Shell></Guard>} />
      <Route path="messages" element={<Guard><Shell title="Messages"><MessagesAdmin /></Shell></Guard>} />
      <Route path="settings" element={<Guard><Shell title="Settings"><SettingsAdmin /></Shell></Guard>} />
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}
