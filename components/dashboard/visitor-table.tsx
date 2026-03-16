
"use client";

import React, { useState, useMemo } from 'react';
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
import { 
  Search, 
  Download, 
  Circle
} from 'lucide-react';
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
  const filteredVisitors = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return visitors.filter(v => 
      v.name.toLowerCase().includes(query) || 
      v.program.toLowerCase().includes(query) || 
      v.reason.toLowerCase().includes(query)
    );
  }, [visitors, searchQuery]);

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      <div className="p-6 border-b flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold">Real-time Visitor Logs</h2>
          <p className="text-sm text-muted-foreground">Showing {filteredVisitors.length} live entries</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search Name, Program or Reason..." 
              className="pl-9 h-10 border-slate-200"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button 
            onClick={() => exportVisitorsToPDF(filteredVisitors)}
            className="bg-primary hover:bg-primary/90 gap-2 h-10"
          >
            <Download className="h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead className="font-semibold text-slate-700">Visitor Details</TableHead>
              <TableHead className="font-semibold text-slate-700">Program / Year</TableHead>
              <TableHead className="font-semibold text-slate-700">Reason</TableHead>
              <TableHead className="font-semibold text-slate-700">Check-in</TableHead>
              <TableHead className="font-semibold text-slate-700">Check-out</TableHead>
              <TableHead className="font-semibold text-slate-700">Presence</TableHead>
              <TableHead className="font-semibold text-slate-700 text-right">Block</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredVisitors.length > 0 ? (
              filteredVisitors.map((visitor) => {
                const user = users.find(u => u.id === visitor.userId);
                const isActive = !visitor.checkOutTime;
                
                return (
                  <TableRow key={visitor.id} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell>
                      <div className="font-medium text-slate-900">{visitor.name}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">ID: {visitor.userId}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-blue-50/50 border-blue-100 text-blue-700 font-medium text-[10px]">
                        {visitor.program}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[150px] truncate text-slate-600 text-xs">
                        {visitor.reason}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-slate-600">
                      {format(visitor.timestamp, 'MMM d, h:mm a')}
                    </TableCell>
                    <TableCell className="text-xs text-slate-600">
                      {visitor.checkOutTime ? format(visitor.checkOutTime, 'h:mm a') : '--:--'}
                    </TableCell>
                    <TableCell>
                      <Badge className={cn(
                        "hover:bg-opacity-100 border-none gap-1", 
                        isActive ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"
                      )}>
                        <Circle className={cn("h-2 w-2 fill-current", isActive ? "text-green-500" : "text-slate-400")} />
                        {isActive ? 'Active' : 'Left'}
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
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground italic">
                  No visitors found matching your search.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
