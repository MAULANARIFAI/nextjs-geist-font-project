"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function HomePage() {
  const [currentTime, setCurrentTime] = useState<string>("");
  const [marketStatus, setMarketStatus] = useState<"OPEN" | "CLOSED">("OPEN");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('id-ID', { 
        hour12: false,
        timeZone: 'Asia/Jakarta'
      }));
      
      // Simple market hours check (5 days a week, 24 hours)
      const day = now.getDay();
      const hour = now.getHours();
      setMarketStatus((day >= 1 && day <= 5) ? "OPEN" : "CLOSED");
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      title: "🔵 AI 1 - Technical Analysis",
      description: "Analisis 10 indikator teknis: MA, RSI, MACD, Bollinger Bands, Stochastic, Fibonacci, ATR, Ichimoku, Volume, Parabolic SAR",
      status: "Active"
    },
    {
      title: "🟡 AI 2 - Signal Validator", 
      description: "Validasi sinyal dari AI 1 dengan diskusi antar AI untuk meningkatkan akurasi prediksi",
      status: "Active"
    },
    {
      title: "🔴 AI 3 - Strategy Executor",
      description: "Eksekusi otomatis ke MetaTrader 5 dengan perhitungan SL, TP, dan manajemen risiko",
      status: "Active"
    },
    {
      title: "🟢 AI 4 - News Assistant",
      description: "Analisis sentimen berita dan asisten pribadi untuk diskusi strategi trading",
      status: "Active"
    }
  ];

  const stats = [
    { label: "Total Signals", value: "1,247", change: "+12.5%" },
    { label: "Success Rate", value: "78.3%", change: "+2.1%" },
    { label: "Active Trades", value: "23", change: "+5" },
    { label: "Monthly Profit", value: "$12,450", change: "+18.7%" }
  ];

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
                <p className="text-sm text-gray-400">AI Trading Platform</p>
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
              <div className="flex space-x-2">
                <Link href="/auth/login">
                  <Button variant="outline" size="sm">Login</Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="sm">Register</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-5xl font-bold text-white mb-6 leading-tight">
              Platform Trading AI
              <span className="bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent"> Terdepan</span>
            </h2>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Sistem AI berlapis 4 tingkat dengan integrasi MetaTrader 5 dan TradingView. 
              Analisis otomatis, eksekusi sinyal, dan diskusi real-time dengan AI assistant.
            </p>
            <div className="flex justify-center space-x-4">
              <Link href="/auth/register">
                <Button size="lg" className="px-8 py-3 text-lg">
                  Mulai Trading Sekarang
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" size="lg" className="px-8 py-3 text-lg">
                  Lihat Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-gray-900/50">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="bg-black/50 border-gray-800">
                <CardContent className="p-6 text-center">
                  <p className="text-sm text-gray-400 mb-2">{stat.label}</p>
                  <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
                  <p className="text-sm text-green-400">{stat.change}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* AI Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-white mb-4">4 Lapisan AI Trading</h3>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Setiap AI bekerja secara berurutan dan saling berdiskusi untuk menghasilkan sinyal trading terbaik
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-gradient-to-br from-gray-900 to-black border-gray-800 hover:border-gray-700 transition-colors">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl text-white">{feature.title}</CardTitle>
                    <Badge variant="outline" className="text-green-400 border-green-400">
                      {feature.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-300 text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Integration Section */}
      <section className="py-20 px-4 bg-gray-900/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-white mb-4">Integrasi Platform</h3>
            <p className="text-xl text-gray-300">Terhubung dengan platform trading terpercaya</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-black/50 border-gray-800 text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">TV</span>
                </div>
                <h4 className="text-xl font-bold text-white mb-2">TradingView</h4>
                <p className="text-gray-300">Real-time market data dan analisis teknis</p>
              </CardContent>
            </Card>
            
            <Card className="bg-black/50 border-gray-800 text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">MT5</span>
                </div>
                <h4 className="text-xl font-bold text-white mb-2">MetaTrader 5</h4>
                <p className="text-gray-300">Eksekusi trading otomatis dan manajemen posisi</p>
              </CardContent>
            </Card>
            
            <Card className="bg-black/50 border-gray-800 text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">AI</span>
                </div>
                <h4 className="text-xl font-bold text-white mb-2">AI Chat Room</h4>
                <p className="text-gray-300">Diskusi real-time dengan 4 AI specialist</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-4xl font-bold text-white mb-6">
              Siap Memulai Trading dengan AI?
            </h3>
            <p className="text-xl text-gray-300 mb-8">
              Bergabunglah dengan platform trading AI terdepan dan rasakan pengalaman trading yang berbeda
            </p>
            <div className="flex justify-center space-x-4">
              <Link href="/auth/register">
                <Button size="lg" className="px-8 py-3 text-lg">
                  Daftar Gratis
                </Button>
              </Link>
              <Link href="/ai-room">
                <Button variant="outline" size="lg" className="px-8 py-3 text-lg">
                  Coba AI Chat
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-black/50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">MR</span>
              </div>
              <p className="text-gray-400">© 2024 Maulana Rifai Trending 01. All rights reserved.</p>
            </div>
            <div className="flex space-x-6">
              <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">
                Dashboard
              </Link>
              <Link href="/ai-room" className="text-gray-400 hover:text-white transition-colors">
                AI Room
              </Link>
              <Link href="/trading-log" className="text-gray-400 hover:text-white transition-colors">
                Trading Log
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
