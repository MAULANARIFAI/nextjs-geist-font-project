"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getLocalStorage, removeLocalStorage, formatCurrency, formatPercentage, generateMockSignal, type TradingSignal } from "@/lib/utils";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState<string>("");
  const [marketStatus, setMarketStatus] = useState<"OPEN" | "CLOSED">("OPEN");
  const [signals, setSignals] = useState<TradingSignal[]>([]);
  const [aiStatus, setAiStatus] = useState({
    ai1: { status: "active", lastUpdate: "2 min ago" },
    ai2: { status: "active", lastUpdate: "1 min ago" },
    ai3: { status: "processing", lastUpdate: "30 sec ago" },
    ai4: { status: "active", lastUpdate: "5 sec ago" }
  });

  useEffect(() => {
    // Check authentication
    const userData = getLocalStorage('user');
    const token = getLocalStorage('token');
    
    if (!userData || !token) {
      router.push('/auth/login');
      return;
    }
    
    setUser(userData);

    // Update time
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('id-ID', { 
        hour12: false,
        timeZone: 'Asia/Jakarta'
      }));
      
      const day = now.getDay();
      setMarketStatus((day >= 1 && day <= 5) ? "OPEN" : "CLOSED");
    };

    updateTime();
    const timeInterval = setInterval(updateTime, 1000);

    // Generate mock signals
    const generateSignals = () => {
      const newSignals = Array.from({ length: 5 }, () => generateMockSignal());
      setSignals(newSignals);
    };

    generateSignals();
    const signalInterval = setInterval(generateSignals, 30000); // Update every 30 seconds

    return () => {
      clearInterval(timeInterval);
      clearInterval(signalInterval);
    };
  }, [router]);

  const handleLogout = () => {
    removeLocalStorage('user');
    removeLocalStorage('token');
    router.push('/');
  };

  const stats = [
    { 
      title: "Total Profit", 
      value: "$12,450", 
      change: "+18.7%", 
      trend: "up",
      description: "Monthly performance"
    },
    { 
      title: "Active Signals", 
      value: "23", 
      change: "+5", 
      trend: "up",
      description: "Currently running"
    },
    { 
      title: "Success Rate", 
      value: "78.3%", 
      change: "+2.1%", 
      trend: "up",
      description: "Last 30 days"
    },
    { 
      title: "Total Trades", 
      value: "1,247", 
      change: "+12.5%", 
      trend: "up",
      description: "All time"
    }
  ];

  const aiLayers = [
    {
      id: "ai1",
      name: "AI 1 - Technical Analysis",
      icon: "🔵",
      description: "Analyzing 10 technical indicators",
      status: aiStatus.ai1.status,
      lastUpdate: aiStatus.ai1.lastUpdate,
      progress: 85
    },
    {
      id: "ai2", 
      name: "AI 2 - Signal Validator",
      icon: "🟡",
      description: "Cross-validating signals",
      status: aiStatus.ai2.status,
      lastUpdate: aiStatus.ai2.lastUpdate,
      progress: 92
    },
    {
      id: "ai3",
      name: "AI 3 - Strategy Executor", 
      icon: "🔴",
      description: "Executing trades on MT5",
      status: aiStatus.ai3.status,
      lastUpdate: aiStatus.ai3.lastUpdate,
      progress: 67
    },
    {
      id: "ai4",
      name: "AI 4 - News Assistant",
      icon: "🟢", 
      description: "Monitoring market sentiment",
      status: aiStatus.ai4.status,
      lastUpdate: aiStatus.ai4.lastUpdate,
      progress: 94
    }
  ];

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
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">MR</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Maulana Rifai Trending 01</h1>
                <p className="text-sm text-gray-400">Welcome back, {user.name}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-400">Jakarta Time</p>
                <p className="text-lg font-mono text-white">{currentTime}</p>
              </div>
              <Badge variant={marketStatus === "OPEN" ? "default" : "secondary"}>
                Market {marketStatus}
              </Badge>
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
              <Button variant="ghost" className="w-full justify-start text-white bg-gray-800">
                Dashboard
              </Button>
            </Link>
            <Link href="/ai-room">
              <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white">
                AI Room
              </Button>
            </Link>
            <Link href="/trading-log">
              <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white">
                Trading Log
              </Button>
            </Link>
            <Link href="/profile">
              <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white">
                Profile
              </Button>
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <Card key={index} className="bg-black/50 border-gray-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">{stat.title}</p>
                      <p className="text-2xl font-bold text-white">{stat.value}</p>
                      <p className="text-xs text-gray-500">{stat.description}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${stat.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                        {stat.change}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* AI Status */}
            <Card className="bg-black/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">AI System Status</CardTitle>
                <CardDescription className="text-gray-400">
                  Real-time status of all AI layers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {aiLayers.map((ai) => (
                  <div key={ai.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">{ai.icon}</span>
                        <div>
                          <p className="text-sm font-medium text-white">{ai.name}</p>
                          <p className="text-xs text-gray-400">{ai.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge 
                          variant={ai.status === 'active' ? 'default' : ai.status === 'processing' ? 'secondary' : 'outline'}
                          className="mb-1"
                        >
                          {ai.status}
                        </Badge>
                        <p className="text-xs text-gray-500">{ai.lastUpdate}</p>
                      </div>
                    </div>
                    <Progress value={ai.progress} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recent Signals */}
            <Card className="bg-black/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Recent Signals</CardTitle>
                <CardDescription className="text-gray-400">
                  Latest trading signals from AI analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {signals.slice(0, 5).map((signal) => (
                    <div key={signal.id} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Badge variant={signal.type === 'BUY' ? 'default' : 'destructive'}>
                          {signal.type}
                        </Badge>
                        <div>
                          <p className="text-sm font-medium text-white">{signal.symbol}</p>
                          <p className="text-xs text-gray-400">Entry: {signal.entry.toFixed(5)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-white">{signal.confidence}%</p>
                        <p className="text-xs text-gray-400">{signal.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <Link href="/trading-log">
                    <Button variant="outline" className="w-full">
                      View All Signals
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="mt-8">
            <Card className="bg-black/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Quick Actions</CardTitle>
                <CardDescription className="text-gray-400">
                  Access key features and tools
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Link href="/ai-room">
                    <Button className="w-full h-20 flex flex-col space-y-2">
                      <span className="text-2xl">🤖</span>
                      <span>Chat with AI</span>
                    </Button>
                  </Link>
                  <Button className="w-full h-20 flex flex-col space-y-2" variant="outline">
                    <span className="text-2xl">📊</span>
                    <span>Market Analysis</span>
                  </Button>
                  <Button className="w-full h-20 flex flex-col space-y-2" variant="outline">
                    <span className="text-2xl">⚙️</span>
                    <span>Settings</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Market Alert */}
          <div className="mt-6">
            <Alert className="border-blue-500 bg-blue-500/10">
              <AlertDescription className="text-blue-400">
                <strong>Market Update:</strong> AI 3 has executed 3 new trades based on validated signals. 
                Current success rate: 78.3%. <Link href="/trading-log" className="underline">View details</Link>
              </AlertDescription>
            </Alert>
          </div>
        </main>
      </div>
    </div>
  );
}
