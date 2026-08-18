'use client';

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

const chartData = [
  { month: 'Jan', revenue: 4200, sales: 38, signups: 52 },
  { month: 'Feb', revenue: 5800, sales: 54, signups: 68 },
  { month: 'Mar', revenue: 4900, sales: 47, signups: 61 },
  { month: 'Apr', revenue: 7200, sales: 72, signups: 89 },
  { month: 'May', revenue: 6100, sales: 61, signups: 74 },
  { month: 'Jun', revenue: 8400, sales: 88, signups: 103 },
];

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-[#1A0B2E] border border-purple-500/30 rounded-2xl p-4 shadow-2xl text-white text-xs space-y-2 min-w-[140px]">
      <div className="font-bold text-purple-300 mb-1">{label}</div>
      {payload.map((item: any) => (
        <div key={item.dataKey} className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full inline-block" style={{ background: item.color }} />
            <span className="text-white/70">{item.name}</span>
          </span>
          <span className="font-bold text-white">
            {item.dataKey === 'revenue' ? `$${item.value?.toLocaleString()}` : item.value}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function RevenueAreaChart() {
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display font-bold text-base text-slate-800">Revenue Overview</h3>
          <p className="text-xs text-slate-500 mt-0.5">Monthly performance: Jan – Jun 2026</p>
        </div>
        <div className="flex items-center gap-4 text-xs font-semibold">
          <span className="flex items-center gap-1.5 text-purple-600">
            <span className="w-3 h-1 rounded-full bg-purple-500 inline-block" /> Revenue
          </span>
          <span className="flex items-center gap-1.5 text-yellow-600">
            <span className="w-3 h-1 rounded-full bg-yellow-400 inline-block" /> Sales
          </span>
          <span className="flex items-center gap-1.5 text-green-600">
            <span className="w-3 h-1 rounded-full bg-green-400 inline-block" /> Signups
          </span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#FACC15" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#FACC15" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorSignups" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="revenue"
            name="Revenue"
            stroke="#7c3aed"
            strokeWidth={2.5}
            fill="url(#colorRevenue)"
            dot={{ r: 4, fill: '#7c3aed', strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: 6 }}
          />
          <Area
            type="monotone"
            dataKey="sales"
            name="Sales"
            stroke="#FACC15"
            strokeWidth={2.5}
            fill="url(#colorSales)"
            dot={{ r: 4, fill: '#FACC15', strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: 6 }}
          />
          <Area
            type="monotone"
            dataKey="signups"
            name="Signups"
            stroke="#22c55e"
            strokeWidth={2.5}
            fill="url(#colorSignups)"
            dot={{ r: 4, fill: '#22c55e', strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: 6 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
