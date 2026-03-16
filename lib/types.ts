export interface Visitor {
  id: string;
  userId: string;
  name: string;
  program: string;
  reason: string;
  timestamp: Date;
  checkOutTime?: Date;
  device: 'Desktop' | 'Mobile' | 'Tablet' | 'Kiosk';
}

export interface User {
  id: string;
  name: string;
  email: string;
  program: string;
  rfidTag: string;
  isBlocked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalVisitors: number;
  dailyCount: number;
  weeklyCount: number;
  monthlyCount: number;
  activeNow: number;
  bounceRate: string;
  avgSession: string;
}
