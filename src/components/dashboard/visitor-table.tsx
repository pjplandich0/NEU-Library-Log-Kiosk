"use client";

import React, { useMemo } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Search, Download, Circle, User as UserIcon, BookOpen } from 'lucide-react';
import { Visitor, User } from '@/lib/types';
import { format } from 'date-fns';
import { exportVisitorsToPDF } from '@/lib/pdf-export';
import { cn } from '@/lib/utils';

interface VisitorTableProps {
  visitors: Visitor[];
  users: User[];
  onToggleBlock: (userId: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export function VisitorTable({ visitors, users, onToggleBlock, searchQuery, setSearchQuery }: VisitorTableProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      <div className="p-6 border-b flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-xl font-bold">Visitor Log History</h2>
          <p className="text-sm text-muted-foreground">Detailed list of library entries</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Filter list by name..." 
              className="pl-9 h-10 border-slate-200"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button onClick={() => exportVisitorsToPDF(visitors)} className="bg-primary hover:bg-primary/90 h-10 gap-2">
            <Download className="h-4 w-4" /> Export Report
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead>Visitor Details</TableHead>
              <TableHead>Role & College</TableHead>
              <TableHead>Purpose</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Block Access</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visitors.map((visitor) => {
              const user = users.find(u => u.id === visitor.userId);
              const isActive = !visitor.checkOutTime;
              const isEmployee = visitor.role === 'Professor' || visitor.role === 'Staff';
              
              return (
                <TableRow key={visitor.id} className="hover:bg-slate-50/50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className={cn("p-2 rounded-lg", isEmployee ? "bg-indigo-50 text-indigo-600" : "bg-blue-50 text-blue-600")}>
                        <UserIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{visitor.name}</div>
                        <div className="text-[10px] text-muted-foreground font-mono">{visitor.program}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <Badge variant="outline" className={cn("text-[9px] font-bold uppercase", isEmployee ? "bg-purple-50 text-purple-700" : "bg-blue-50 text-blue-700")}>
                        {isEmployee ? 'Professor/Staff' : visitor.role}
                      </Badge>
                      <div className="text-[10px] text-slate-500 font-medium px-1">{visitor.college}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-xs text-slate-600">
                      <BookOpen className="w-3 h-3" />
                      {visitor.reason}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs">
                      <p className="font-semibold">{format(visitor.timestamp, 'MMM d, h:mm a')}</p>
                      <p className="text-[10px] text-muted-foreground">{visitor.checkOutTime ? `Out: ${format(visitor.checkOutTime, 'h:mm a')}` : 'Active Session'}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={cn("hover:bg-opacity-100 border-none gap-1 py-1 px-3", isActive ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-600")}>
                      <Circle className={cn("h-1.5 w-1.5 fill-current", isActive ? "text-green-500" : "text-slate-400")} />
                      {isActive ? 'In Library' : 'Checked Out'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Switch 
                      checked={user?.isBlocked || false} 
                      onCheckedChange={() => onToggleBlock(visitor.userId)}
                      className="data-[state=checked]:bg-destructive"
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
