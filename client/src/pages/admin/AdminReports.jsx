import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { Download, TrendingUp, ShoppingCart, Users, Tag } from 'lucide-react';
import useAuthStore from '../../stores/authStore';

const COLORS = ['#1a1a1a', '#4b5563', '#9ca3af', '#d1d5db', '#6366f1', '#0ea5e9', '#22c55e', '#f59e0b'];
const STATUS_COLORS = {
  pending:    '#f59e0b',
  confirmed:  '#6366f1',
  processing: '#0ea5e9',
  shipped:    '#22c55e',
  delivered:  '#16a34a',
  cancelled:  '#ef4444',
};

function StatCard({ title, value, icon: Icon, color = 'brand' }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">{title}</p>
          <p className="mt-1 text-2xl font-bold text-neutral-900">{value}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100">
          <Icon className="h-5 w-5 text-neutral-600" />
        </div>
      </div>
    </div>
  );
}

const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

function today() { return new Date().toISOString().slice(0, 10); }
function daysAgo(n) { return new Date(Date.now() - n * 864e5).toISOString().slice(0, 10); }

export default function AdminReports() {
  const { token } = useAuthStore();
  const [from, setFrom] = useState(daysAgo(30));
  const [to,   setTo]   = useState(today());
  const [preset, setPreset] = useState('30d');

  function applyPreset(p) {
    setPreset(p);
    const presetDays = { '7d': 7, '30d': 30, '90d': 90, '1y': 365 };
    setFrom(daysAgo(presetDays[p] || 30));
    setTo(today());
  }

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['admin-reports', from, to],
    queryFn: async () => {
      const params = new URLSearchParams({ from, to });
      const res = await fetch(`/api/admin/reports?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message);
      return d.data;
    },
    staleTime: 60_000,
    keepPreviousData: true,
  });

  function exportCSV() {
    const params = new URLSearchParams({ from, to, export: 'csv' });
    const a = document.createElement('a');
    a.href = `/api/admin/reports?${params}`;
    a.setAttribute('data-token', token);
    // fetch with auth then trigger download
    fetch(`/api/admin/reports?${params}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.blob())
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `report-${from}-to-${to}.csv`;
        link.click();
        URL.revokeObjectURL(url);
      });
  }

  const overview    = data?.overview    || {};
  const revenueByDay = data?.revenueByDay || [];
  const topProducts  = data?.topProducts  || [];
  const topCats      = data?.topCategories || [];
  const byStatus     = (data?.ordersByStatus || []).map((s) => ({ name: s.status, value: s.count }));
  const byMethod     = data?.revenueByMethod || [];
  const newCustomers = data?.newCustomers || [];

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Analytics & Reports</h1>
          <p className="mt-0.5 text-sm text-neutral-500">Detailed business insights and trends</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Preset buttons */}
          {['7d', '30d', '90d', '1y'].map((p) => (
            <button
              key={p}
              onClick={() => applyPreset(p)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                preset === p ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {p}
            </button>
          ))}

          {/* Date range */}
          <input
            type="date"
            value={from}
            max={to}
            onChange={(e) => { setFrom(e.target.value); setPreset(''); }}
            className="rounded-lg border border-neutral-200 px-2 py-1 text-xs focus:border-brand-500 focus:outline-none"
          />
          <span className="text-xs text-neutral-400">to</span>
          <input
            type="date"
            value={to}
            min={from}
            max={today()}
            onChange={(e) => { setTo(e.target.value); setPreset(''); }}
            className="rounded-lg border border-neutral-200 px-2 py-1 text-xs focus:border-brand-500 focus:outline-none"
          />

          {/* Export */}
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-neutral-700"
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24 text-neutral-400">Loading…</div>
      ) : (
        <div className="space-y-6">
          {/* Overview cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Total Revenue" value={fmt(overview.totalRevenue)} icon={TrendingUp} />
            <StatCard title="Total Orders" value={(overview.totalOrders || 0).toLocaleString()} icon={ShoppingCart} />
            <StatCard title="Avg Order Value" value={fmt(overview.avgOrderValue)} icon={Tag} />
            <StatCard title="Total Discount Given" value={fmt(overview.totalDiscount)} icon={Users} />
          </div>

          {/* Revenue over time */}
          <div className="rounded-xl border border-neutral-200 bg-white p-5">
            <h2 className="mb-4 text-sm font-semibold text-neutral-900">Revenue Over Time</h2>
            {revenueByDay.length === 0 ? (
              <p className="py-8 text-center text-sm text-neutral-400">No data for selected range</p>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={revenueByDay} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#1a1a1a" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#1a1a1a" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="_id" tick={{ fontSize: 11 }} tickLine={false} />
                  <YAxis tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip formatter={(v) => [`₹${v.toLocaleString()}`, 'Revenue']} />
                  <Area type="monotone" dataKey="revenue" stroke="#1a1a1a" strokeWidth={2} fill="url(#revGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Orders + Customers row */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Orders by status (pie) */}
            <div className="rounded-xl border border-neutral-200 bg-white p-5">
              <h2 className="mb-4 text-sm font-semibold text-neutral-900">Orders by Status</h2>
              {byStatus.length === 0 ? (
                <p className="py-8 text-center text-sm text-neutral-400">No data</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={byStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name} (${value})`} labelLine={false}>
                      {byStatus.map((entry) => (
                        <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || '#9ca3af'} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* New customers per day */}
            <div className="rounded-xl border border-neutral-200 bg-white p-5">
              <h2 className="mb-4 text-sm font-semibold text-neutral-900">New Customers</h2>
              {newCustomers.length === 0 ? (
                <p className="py-8 text-center text-sm text-neutral-400">No data</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={newCustomers} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="_id" tick={{ fontSize: 11 }} tickLine={false} />
                    <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#6366f1" name="New Customers" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Top products + categories row */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Top products */}
            <div className="rounded-xl border border-neutral-200 bg-white p-5">
              <h2 className="mb-4 text-sm font-semibold text-neutral-900">Top Products by Revenue</h2>
              {topProducts.length === 0 ? (
                <p className="py-8 text-center text-sm text-neutral-400">No data</p>
              ) : (
                <div className="space-y-2">
                  {topProducts.map((p, i) => (
                    <div key={p._id} className="flex items-center gap-3">
                      <span className="w-5 text-xs font-medium text-neutral-400">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-medium text-neutral-900">{p.name}</p>
                        <p className="text-xs text-neutral-400">{p.unitsSold} units sold</p>
                      </div>
                      <span className="text-sm font-semibold text-neutral-900">{fmt(p.revenue)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Revenue by category */}
            <div className="rounded-xl border border-neutral-200 bg-white p-5">
              <h2 className="mb-4 text-sm font-semibold text-neutral-900">Revenue by Category</h2>
              {topCats.length === 0 ? (
                <p className="py-8 text-center text-sm text-neutral-400">No data</p>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={topCats} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                    <XAxis type="number" tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                    <YAxis type="category" dataKey="category" tick={{ fontSize: 11 }} tickLine={false} width={90} />
                    <Tooltip formatter={(v) => [`₹${v.toLocaleString()}`, 'Revenue']} />
                    <Bar dataKey="revenue" fill="#1a1a1a" name="Revenue" radius={[0, 3, 3, 0]}>
                      {topCats.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Revenue by payment method */}
          <div className="rounded-xl border border-neutral-200 bg-white p-5">
            <h2 className="mb-4 text-sm font-semibold text-neutral-900">Revenue by Payment Method</h2>
            <div className="flex flex-wrap gap-6">
              {byMethod.map((m) => (
                <div key={m.method} className="rounded-lg bg-neutral-50 px-5 py-3 text-center">
                  <p className="text-xs uppercase tracking-wide text-neutral-500">{m.method}</p>
                  <p className="mt-1 text-lg font-bold text-neutral-900">{fmt(m.revenue)}</p>
                  <p className="text-xs text-neutral-400">{m.count} orders</p>
                </div>
              ))}
              {byMethod.length === 0 && <p className="text-sm text-neutral-400">No data</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
