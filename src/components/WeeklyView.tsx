
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, TrendingUp, ArrowRight } from 'lucide-react';
import type { Transaction } from '@/pages/Index';

interface WeeklyViewProps {
  transactions: Transaction[];
}

interface WeekData {
  weekStart: Date;
  weekEnd: Date;
  transactions: Transaction[];
  total: number;
}

export const WeeklyView: React.FC<WeeklyViewProps> = ({ transactions }) => {
  const getWeeklyData = (): WeekData[] => {
    if (transactions.length === 0) return [];

    // Group transactions by week (Saturday to Friday)
    const weekGroups: { [key: string]: Transaction[] } = {};

    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const weekStart = getWeekStart(date);
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!weekGroups[weekKey]) {
        weekGroups[weekKey] = [];
      }
      weekGroups[weekKey].push(transaction);
    });

    return Object.entries(weekGroups)
      .map(([weekStartStr, weekTransactions]) => {
        const weekStart = new Date(weekStartStr);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        
        return {
          weekStart,
          weekEnd,
          transactions: weekTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
          total: weekTransactions.reduce((sum, t) => sum + t.amount, 0),
        };
      })
      .sort((a, b) => b.weekStart.getTime() - a.weekStart.getTime());
  };

  const getWeekStart = (date: Date): Date => {
    const dayOfWeek = date.getDay();
    const daysSinceSaturday = dayOfWeek === 0 ? 1 : (dayOfWeek + 1) % 7;
    
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - daysSinceSaturday);
    return weekStart;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDateRange = (start: Date, end: Date) => {
    const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${startStr} - ${endStr}`;
  };

  const isCurrentWeek = (weekStart: Date): boolean => {
    const today = new Date();
    const currentWeekStart = getWeekStart(today);
    return weekStart.getTime() === currentWeekStart.getTime();
  };

  const weeklyData = getWeeklyData();

  if (weeklyData.length === 0) {
    return (
      <Card className="max-w-4xl mx-auto shadow-lg border-0 bg-white">
        <CardContent className="p-12 text-center">
          <Calendar className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No Transactions Yet</h3>
          <p className="text-gray-500">Add your first transaction to see weekly summaries!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
          <TrendingUp className="h-6 w-6 text-blue-600" />
          Weekly Sales Summary
        </h2>
        <p className="text-gray-600 mt-2">Sales grouped by Saturday to Friday periods</p>
      </div>

      <div className="grid gap-6">
        {weeklyData.map((week, index) => (
          <Card key={week.weekStart.toISOString()} className={`shadow-lg border-0 transition-all duration-200 hover:shadow-xl ${isCurrentWeek(week.weekStart) ? 'ring-2 ring-blue-500 bg-blue-50' : 'bg-white'}`}>
            <CardHeader className={`${isCurrentWeek(week.weekStart) ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : 'bg-gradient-to-r from-gray-600 to-gray-700 text-white'} rounded-t-lg`}>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5" />
                  <span>{formatDateRange(week.weekStart, week.weekEnd)}</span>
                  {isCurrentWeek(week.weekStart) && (
                    <Badge variant="secondary" className="bg-white text-blue-600 font-medium">
                      Current Week
                    </Badge>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{formatCurrency(week.total)}</div>
                  <div className="text-sm opacity-90">{week.transactions.length} transactions</div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                {week.transactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{transaction.description}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(transaction.date).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-green-600">{formatCurrency(transaction.amount)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
