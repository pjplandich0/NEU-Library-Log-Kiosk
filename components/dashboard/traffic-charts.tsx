"use client";

import React from 'react';
import { 
  Line, 
  LineChart, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { cn } from '@/lib/utils';

const trafficData = {
  Daily: [
    { time: '08:00', visitors: 10 },
    { time: '10:00', visitors: 25 },
    { time: '12:00', visitors: 55 },
    { time: '14:00', visitors: 40 },
    { time: '16:00', visitors: 30 },
    { time: '18:00', visitors: 15 },
  ],
  Weekly: [
    { time: 'Mon', visitors: 45 },
    { time: 'Tue', visitors: 120 },
    { time: 'Wed', visitors: 280 },
    { time: 'Thu', visitors: 210 },
    { time: 'Fri', visitors: 160 },
    { time: 'Sat', visitors: 95 },
  ],
  Monthly: [
    { time: 'Week 1', visitors: 450 },
    { time: 'Week 2', visitors: 620 },
    { time: 'Week 3', visitors: 580 },
    { time: 'Week 4', visitors: 710 },
  ]
};

const deviceData = [
  { name: 'Desktop', value: 65, color: '#3B71F2' },
  { name: 'Mobile', value: 25, color: '#13BAD5' },
  { name: 'Tablet', value: 10, color: '#6366f1' },
];

const trafficConfig = {
  visitors: {
    label: "Visitors",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

interface TrafficChartsProps {
  activeFilter?: 'Daily' | 'Weekly' | 'Monthly';
  onFilterChange?: (filter: 'Daily' | 'Weekly' | 'Monthly') => void;
}

export function TrafficCharts({ activeFilter = 'Weekly', onFilterChange }: TrafficChartsProps) {
  const currentData = trafficData[activeFilter];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2 border-none shadow-sm overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-bold flex items-center justify-between">
            Traffic Overview
            <div className="flex gap-2">
              {(['Daily', 'Weekly', 'Monthly'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => onFilterChange?.(filter)}
                  className={cn(
                    "text-xs font-normal px-2 py-1 rounded transition-all",
                    activeFilter === filter 
                      ? "text-primary bg-primary/10 border border-primary/20" 
                      : "text-muted-foreground bg-slate-100 hover:bg-slate-200"
                  )}
                >
                  {filter}
                </button>
              ))}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 pt-4">
          <div className="h-[300px] w-full px-4">
            <ChartContainer config={trafficConfig}>
              <LineChart data={currentData} margin={{ left: -20, right: 10 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="time" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#64748b' }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#64748b' }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line 
                  type="monotone" 
                  dataKey="visitors" 
                  stroke="var(--color-visitors)" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#fff', strokeWidth: 2 }} 
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Device Tracking</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={deviceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {deviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  align="center"
                  iconType="circle"
                  wrapperStyle={{ paddingTop: '20px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            {deviceData.map((item) => (
              <div key={item.name}>
                <p className="text-xs text-muted-foreground">{item.name}</p>
                <p className="font-bold text-sm" style={{ color: item.color }}>{item.value}%</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
