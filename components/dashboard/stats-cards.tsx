
"use client";

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, TrendingUp, Clock, Activity } from 'lucide-react';
import { DashboardStats } from '@/lib/types';

interface StatsCardsProps {
  stats: DashboardStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: 'Total Visitors',
      value: stats.totalVisitors.toLocaleString(),
      icon: Users,
      trend: '+12.5%',
      color: 'bg-blue-50 text-blue-600'
    },
    {
      title: 'Bounce Rate',
      value: stats.bounceRate,
      icon: TrendingUp,
      trend: '-2.1%',
      color: 'bg-turquoise-50 text-[#13BAD5]'
    },
    {
      title: 'Avg. Session',
      value: stats.avgSession,
      icon: Clock,
      trend: '+10m',
      color: 'bg-indigo-50 text-indigo-600'
    },
    {
      title: 'Active Now',
      value: stats.activeNow.toLocaleString(),
      icon: Activity,
      trend: 'Live',
      color: 'bg-green-50 text-green-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card) => (
        <Card key={card.title} className="border-none shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${card.color.replace('text-', 'text-opacity-100 bg-')}`}>
                <card.icon className="h-6 w-6" />
              </div>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${card.trend.startsWith('+') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {card.trend}
              </span>
            </div>
            <div>
              <p className="text-muted-foreground text-sm font-medium">{card.title}</p>
              <h3 className="text-2xl font-bold mt-1">{card.value}</h3>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
