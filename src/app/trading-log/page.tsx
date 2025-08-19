"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getLocalStorage, removeLocalStorage, formatCurrency, formatPercentage, formatDate, generateMockSignal, type TradingSignal } from "@/lib/utils";

interface TradeHistory extends TradingSignal {
  exitPrice?: number;
  exitTime?: Date;
  pips: number;
  duration: string;
  aiSource: string;
}

export default function TradingLogPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [trades, setTrades] = useState<TradeHistory[]>([]);
  const [filteredTrades, setFilteredTrades] = useState<TradeHistory[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterSymbol, setFilterSymbol] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [dateRange, setDateRange] = useState<string>("7d");

  useEffect(() => {
    // Check authentication
    const userData = getLocalStorage('user');
    const token = getLocalStorage('token');
    
    if (!userData || !token) {
      router.push('/auth/login');
      return;
    }
    
    setUser(userData);

    // Generate mock trading history
    generateMockTrades();
  }, [router]);

  useEffect(() => {
    // Apply filters
    let filtered = trades;

    if (filterStatus !== "all") {
      filtered = filtered.filter(trade => trade.status === filterStatus);
    }

    if (filterSymbol !== "all") {
      filtered = filtered.filter(trade => trade.symbol === filterSymbol);
    }

    if (searchTerm) {
      filtered = filtered.filter(trade => 
        trade.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trade.aiSource.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredTrades(filtered);
  }, [trades, filterStatus, filterSymbol, searchTerm]);

  const generateMockTrades = () => {
    const mockTrades: TradeHistory[] = [];
    const symbols = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'NZDUSD', 'USDCHF'];
    const aiSources = ['AI 1 + AI 2', 'AI 1 + AI 2 + AI 3', 'AI 4 Manual', 'Full AI Chain'];
    const statuses: Array<'CLOSED' | 'ACTIVE' | 'CANCELLED'> = ['CLOSED', 'ACTIVE', 'CANCELLED'];

    for (let i = 0; i < 50; i++) {
      const signal = generateMockSignal();
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const isProfit = Math.random() > 0.3; // 70% profit rate
      
      let exitPrice: number | undefined;
      let pnl: number | undefined;
      let exitTime: Date | undefined;

      if (status === 'CLOSED') {
        if (signal.type === 'BUY') {
          exitPrice = isProfit ? signal.takeProfit : signal.stopLoss;
        } else {
          exitPrice = isProfit ? signal.takeProfit : signal.stopLoss;
        }
        pnl = isProfit ? Math.random() * 500 + 50 : -(Math.random() * 200 + 20);
        exitTime = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);
      }

      const trade: TradeHistory = {
        ...signal,
        symbol: symbols[Math.floor(Math.random() * symbols.length)],
        status,
        exitPrice,
        exitTime,
        pnl,
        pips: Math.floor(Math.random() * 100) + 10,
        duration: status === 'CLOSED' ? `${Math.floor(Math.random() * 24)}h ${Math.floor(Math.random() * 60)}m` : '-',
        aiSource: aiSources[Math.floor(Math.random() * aiSources.length)],
        timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
      };

      mockTrades.push(trade);
    }

    // Sort by timestamp (newest first)
    mockTrades.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    setTrades(mockTrades);
  };

  const handleLogout = () => {
    removeLocalStorage('user');
    removeLocalStorage('token');
    router.push('/');
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Symbol', 'Type', 'Entry', 'Exit', 'SL', 'TP', 'Pips', 'P&L', 'Status', 'AI Source'];
    const csvContent = [
      headers.join(','),
      ...filteredTrades.map(trade => [
        formatDate(trade.timestamp, 'yyyy-MM-dd HH:mm'),
        trade.symbol,
        trade.type,
        trade.entry.toFixed(5),
        trade.exitPrice?.toFixed(5) || '-',
        trade.stopLoss.toFixed(5),
        trade.takeProfit.toFixed(5),
        trade.pips,
        trade.pnl?.toFixed(2) || '-',
        trade.status,
        trade.aiSource
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trading-log-${formatDate(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const stats = {
    totalTrades: trades.length,
    activeTrades: trades.filter(t => t.status === 'ACTIVE').length,
    closedTrades: trades.filter(t => t.status === 'CLOSED').length,
    totalPnL: trades.filter(t => t.pnl).reduce((sum, t) => sum + (t.pnl || 0), 0),
    winRate: trades.filter(t => t.status === 'CLOSED').length > 0 
      ? (trades.filter(t => t.status === 'CLOSED' && (t.pnl || 0) > 0).length / trades.filter(t => t.status === 'CLOSED').length) * 100 
      : 0,
    avgPips: trades.filter(t => t.status === 'CLOSED').length > 0
      ? trades.filter(t => t.status === 'CLOSED').reduce((sum, t) => sum + t.pips, 0) / trades.filter(t => t.status === 'CLOSED').length
      : 0
  };

  const uniqueSymbols = [...new Set(trades.map(t => t.symbol))];

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Header */}
      <header className="border-b border-gray-800 bg-black/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center cursor-pointer">
                  <span className="text-white font-bold text-lg">MR</span>
                </div>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-white">Trading Log</h1>
                <p className="text-sm text-gray-400">Complete trading history and analytics</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button onClick={exportToCSV} variant="outline" size="sm">
                Export CSV
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-black/30 border-r border-gray-800 min-h-screen">
          <nav className="p-4 space-y-2">
            <Link href="/dashboard">
              <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white">
                Dashboard
              </Button>
            </Link>
            <Link href="/ai-room">
              <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white">
                AI Room
              </Button>
            </Link>
            <Link href="/trading-log">
              <Button variant="ghost" className="w-full justify-start text-white bg-gray-800">
                Trading Log
              </Button>
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
            <Card className="bg-black/50 border-gray-800">
              <CardContent className="p-4 text-center">
                <p className="text-sm text-gray-400">Total Trades</p>
                <p className="text-2xl font-bold text-white">{stats.totalTrades}</p>
              </CardContent>
            </Card>
            <Card className="bg-black/50 border-gray-800">
              <CardContent className="p-4 text-center">
                <p className="text-sm text-gray-400">Active</p>
                <p className="text-2xl font-bold text-blue-400">{stats.activeTrades}</p>
              </CardContent>
            </Card>
            <Card className="bg-black/50 border-gray-800">
              <CardContent className="p-4 text-center">
                <p className="text-sm text-gray-400">Closed</p>
                <p className="text-2xl font-bold text-gray-300">{stats.closedTrades}</p>
              </CardContent>
            </Card>
            <Card className="bg-black/50 border-gray-800">
              <CardContent className="p-4 text-center">
                <p className="text-sm text-gray-400">Total P&L</p>
                <p className={`text-2xl font-bold ${stats.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatCurrency(stats.totalPnL)}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-black/50 border-gray-800">
              <CardContent className="p-4 text-center">
                <p className="text-sm text-gray-400">Win Rate</p>
                <p className="text-2xl font-bold text-green-400">{stats.winRate.toFixed(1)}%</p>
              </CardContent>
            </Card>
            <Card className="bg-black/50 border-gray-800">
              <CardContent className="p-4 text-center">
                <p className="text-sm text-gray-400">Avg Pips</p>
                <p className="text-2xl font-bold text-white">{stats.avgPips.toFixed(0)}</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="bg-black/50 border-gray-800 mb-6">
            <CardHeader>
              <CardTitle className="text-white">Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Status</label>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="CLOSED">Closed</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Symbol</label>
                  <Select value={filterSymbol} onValueChange={setFilterSymbol}>
                    <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Symbols</SelectItem>
                      {uniqueSymbols.map(symbol => (
                        <SelectItem key={symbol} value={symbol}>{symbol}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Search</label>
                  <Input
                    placeholder="Search symbol or AI..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-gray-900 border-gray-700 text-white placeholder-gray-500"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Date Range</label>
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1d">Last 24 Hours</SelectItem>
                      <SelectItem value="7d">Last 7 Days</SelectItem>
                      <SelectItem value="30d">Last 30 Days</SelectItem>
                      <SelectItem value="all">All Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Trading Table */}
          <Card className="bg-black/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Trading History</CardTitle>
              <CardDescription className="text-gray-400">
                Showing {filteredTrades.length} of {trades.length} trades
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-800">
                      <TableHead className="text-gray-300">Date/Time</TableHead>
                      <TableHead className="text-gray-300">Symbol</TableHead>
                      <TableHead className="text-gray-300">Type</TableHead>
                      <TableHead className="text-gray-300">Entry</TableHead>
                      <TableHead className="text-gray-300">Exit</TableHead>
                      <TableHead className="text-gray-300">SL/TP</TableHead>
                      <TableHead className="text-gray-300">Pips</TableHead>
                      <TableHead className="text-gray-300">P&L</TableHead>
                      <TableHead className="text-gray-300">Duration</TableHead>
                      <TableHead className="text-gray-300">Status</TableHead>
                      <TableHead className="text-gray-300">AI Source</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTrades.map((trade) => (
                      <TableRow key={trade.id} className="border-gray-800 hover:bg-gray-900/50">
                        <TableCell className="text-gray-300 text-sm">
                          {formatDate(trade.timestamp, 'dd/MM HH:mm')}
                        </TableCell>
                        <TableCell className="text-white font-medium">{trade.symbol}</TableCell>
                        <TableCell>
                          <Badge variant={trade.type === 'BUY' ? 'default' : 'destructive'}>
                            {trade.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-300">{trade.entry.toFixed(5)}</TableCell>
                        <TableCell className="text-gray-300">
                          {trade.exitPrice ? trade.exitPrice.toFixed(5) : '-'}
                        </TableCell>
                        <TableCell className="text-gray-300 text-sm">
                          {trade.stopLoss.toFixed(5)} / {trade.takeProfit.toFixed(5)}
                        </TableCell>
                        <TableCell className="text-gray-300">{trade.pips}</TableCell>
                        <TableCell className={trade.pnl && trade.pnl >= 0 ? 'text-green-400' : 'text-red-400'}>
                          {trade.pnl ? formatCurrency(trade.pnl) : '-'}
                        </TableCell>
                        <TableCell className="text-gray-300 text-sm">{trade.duration}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              trade.status === 'ACTIVE' ? 'default' : 
                              trade.status === 'CLOSED' ? 'secondary' : 'outline'
                            }
                          >
                            {trade.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-300 text-sm">{trade.aiSource}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
