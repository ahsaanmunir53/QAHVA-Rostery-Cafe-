import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import type { CartLine } from './types';

const KEY = 'qahva_cart_v1';

interface CartCtx {
  lines: CartLine[];
  count: number;
  subtotal: number;
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  add: (line: Omit<CartLine, 'qty'>, qty?: number) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
}

const Ctx = createContext<CartCtx | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(() => {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
  });
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(lines)); }, [lines]);

  const add: CartCtx['add'] = (line, qty = 1) => {
    setLines((xs) => {
      const i = xs.findIndex((x) => x.id === line.id);
      if (i >= 0) {
        const next = [...xs];
        next[i] = { ...next[i], qty: Math.min(20, next[i].qty + qty) };
        return next;
      }
      return [...xs, { ...line, qty }];
    });
    setDrawerOpen(true);
  };

  const value = useMemo<CartCtx>(() => ({
    lines,
    count: lines.reduce((s, x) => s + x.qty, 0),
    subtotal: lines.reduce((s, x) => s + x.price * x.qty, 0),
    drawerOpen,
    openDrawer: () => setDrawerOpen(true),
    closeDrawer: () => setDrawerOpen(false),
    add,
    setQty: (id, qty) => setLines((xs) => (qty <= 0 ? xs.filter((x) => x.id !== id) : xs.map((x) => (x.id === id ? { ...x, qty: Math.min(20, qty) } : x)))),
    remove: (id) => setLines((xs) => xs.filter((x) => x.id !== id)),
    clear: () => setLines([]),
  }), [lines, drawerOpen]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart(): CartCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useCart outside CartProvider');
  return ctx;
}
