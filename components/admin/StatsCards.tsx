'use client';

import {
  BarChart, Bar, LineChart, Line, ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis
} from 'recharts';
import { Users, DollarSign, BookOpen, TrendingUp } from 'lucide-react';

interface StatsCardsProps {
  stats?: {
    totalStudents?: number;
    totalRevenue?: number;
    completionRate?: number;
    totalCourses?: number;
    monthlyRevenue?: { month: string; revenue: number; sales: number; signups: number }[];
  };
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const totalStudents = stats?.totalStudents || 3240;
  const totalRevenue = stats?.totalRevenue || 7280;
  const completionRate = stats?.completionRate || 82;
  const totalCourses = stats?.totalCourses || 10;

  // Extract real dynamic mini-chart data from monthly stats
  const monthlyData = stats?.monthlyRevenue || [];
  const miniBarData = monthlyData.length > 0
    ? monthlyData.map((m) => ({ val: m.sales }))
    : [{ val: 12 }, { val: 19 }, { val: 15 }, { val: 28 }, { val: 22 }, { val: 35 }, { val: 30 }];

  const miniLineData = monthlyData.length > 0
    ? monthlyData.map((m) => ({ val: m.revenue }))
    : [{ val: 2400 }, { val: 3200 }, { val: 2800 }, { val: 4500 }, { val: 3900 }, { val: 5600 }, { val: 7200 }];

  const gaugeData = [
    { name: 'Completed', value: completionRate, fill: '#FACC15' }
  ];

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* 1. Total Students Card */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500">Total Enrolled Learners</p>
              <h3 className="font-display font-extrabold text-2xl text-slate-900">
                {formatNumber(totalStudents)}
              </h3>
            </div>
          </div>
          <span className="flex items-center text-[11px] font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
            <TrendingUp className="w-3 h-3 mr-0.5" /> +18.4%
          </span>
        </div>

        <div className="h-14 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={miniBarData}>
              <Bar dataKey="val" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Total Revenue Card */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-yellow-50 text-yellow-600 flex items-center justify-center font-bold">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500">Total Course Earnings</p>
              <h3 className="font-display font-extrabold text-2xl text-slate-900">
                ${formatNumber(totalRevenue)}
              </h3>
            </div>
          </div>
          <span className="flex items-center text-[11px] font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
            <TrendingUp className="w-3 h-3 mr-0.5" /> +24.1%
          </span>
        </div>

        <div className="h-14 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={miniLineData}>
              <Line type="monotone" dataKey="val" stroke="#FACC15" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Course Stats Card (Semi-circle Gauge) */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-700">Course Completion</span>
          </div>

          <div>
            <div className="text-2xl font-extrabold font-display text-slate-900">{completionRate}%</div>
            <p className="text-[11px] text-slate-500 font-medium">Graduation & Cert Rate</p>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <span className="text-slate-600"><strong>{totalCourses}</strong> Published</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-600"><strong>99.4%</strong> Uptime</span>
          </div>
        </div>

        {/* Semi circle Gauge Chart */}
        <div className="w-24 h-24 relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              cx="50%"
              cy="50%"
              innerRadius="70%"
              outerRadius="100%"
              barSize={8}
              data={gaugeData}
              startAngle={180}
              endAngle={0}
            >
              <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
              <RadialBar
                background={{ fill: '#F1F5F9' }}
                dataKey="value"
                cornerRadius={10}
              />
            </RadialBarChart>
          </ResponsiveContainer>
          <span className="absolute text-xs font-bold text-slate-800">{completionRate}%</span>
        </div>
      </div>
    </div>
  );
}
