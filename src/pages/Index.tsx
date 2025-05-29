
import React, { useState, useEffect } from 'react';
import { TransactionForm } from '@/components/TransactionForm';
import { WeeklyView } from '@/components/WeeklyView';
import { TransactionList } from '@/components/TransactionList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Calendar, TrendingUp, DollarSign } from 'lucide-react';

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  description: string;
  createdAt: string;
}

const Index = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currentWeekTotal, setCurrentWeekTotal] = useState(0);

  // Load transactions from localStorage on component mount
  useEffect(() => {
    const savedTransactions = localStorage.getItem('dailySalesTransactions');
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    }
  }, []);

  // Save transactions to localStorage whenever transactions change
  useEffect(() => {
    localStorage.setItem('dailySalesTransactions', JSON.stringify(transactions));
    calculateCurrentWeekTotal();
  }, [transactions]);

  const addTransaction = (transactionData: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newTransaction: Transaction = {
      ...transactionData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setTransactions(prev => [newTransaction, ...prev]);
  };

  const getCurrentWeekRange = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    // Calculate days since last Saturday (0 = Sunday, 6 = Saturday)
    const daysSinceSaturday = dayOfWeek === 0 ? 1 : (dayOfWeek + 1) % 7;
    
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - daysSinceSaturday);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    
    return { start: weekStart, end: weekEnd };
  };

  const calculateCurrentWeekTotal = () => {
    const { start, end } = getCurrentWeekRange();
    const weekTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= start && transactionDate <= end;
    });
    const total = weekTransactions.reduce((sum, t) => sum + t.amount, 0);
    setCurrentWeekTotal(total);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(amount);
  };

  const { start: weekStart, end: weekEnd } = getCurrentWeekRange();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-5xl font-bold text-gray-800 mb-2">
            D'FASHION HARIAN
          </h1>
          <h2 className="text-3xl font-semibold text-gray-700 flex items-center justify-center gap-3">
            <TrendingUp className="h-8 w-8 text-blue-600" />
            Daily Sales Tracker
          </h2>
          <p className="text-gray-600">Track your sales from Saturday to Friday</p>
        </div>

        {/* Current Week Summary */}
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Calendar className="h-5 w-5" />
              Current Week Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-blue-100 text-sm">Week Period</p>
                <p className="text-xl font-semibold">
                  {weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
              </div>
              <div className="text-center">
                <p className="text-blue-100 text-sm">Total Sales</p>
                <p className="text-3xl font-bold">
                  {formatCurrency(currentWeekTotal)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-blue-100 text-sm">Transactions</p>
                <p className="text-xl font-semibold">
                  {transactions.filter(t => {
                    const transactionDate = new Date(t.date);
                    return transactionDate >= weekStart && transactionDate <= weekEnd;
                  }).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs defaultValue="add" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white shadow-sm">
            <TabsTrigger value="add" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Add Transaction
            </TabsTrigger>
            <TabsTrigger value="weekly" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Weekly View
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Transaction History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="add">
            <TransactionForm onAddTransaction={addTransaction} />
          </TabsContent>

          <TabsContent value="weekly">
            <WeeklyView transactions={transactions} />
          </TabsContent>

          <TabsContent value="history">
            <TransactionList transactions={transactions} setTransactions={setTransactions} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
