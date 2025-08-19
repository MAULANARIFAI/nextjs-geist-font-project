"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getLocalStorage, removeLocalStorage } from "@/lib/utils";
import { aiService } from "@/lib/aiService";

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai1' | 'ai2' | 'ai3' | 'ai4';
  message: string;
  timestamp: Date;
  aiName?: string;
}

export default function AIRoomPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeAI, setActiveAI] = useState<'all' | 'ai1' | 'ai2' | 'ai3' | 'ai4'>('all');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const aiProfiles = {
    ai1: { name: "Technical Analyst", icon: "🔵", color: "blue" },
    ai2: { name: "Signal Validator", icon: "🟡", color: "yellow" },
    ai3: { name: "Strategy Executor", icon: "🔴", color: "red" },
    ai4: { name: "News Assistant", icon: "🟢", color: "green" }
  };

  useEffect(() => {
    // Check authentication
    const userData = getLocalStorage('user');
    const token = getLocalStorage('token');
    
    if (!userData || !token) {
      router.push('/auth/login');
      return;
    }
    
    setUser(userData);

    // Initialize with welcome messages
    const welcomeMessages: ChatMessage[] = [
      {
        id: '1',
        sender: 'ai4',
        message: `Selamat datang di AI Room, ${userData.name}! Saya AI 4 - News Assistant. Kami siap membantu analisis trading Anda.`,
        timestamp: new Date(),
        aiName: 'News Assistant'
      },
      {
        id: '2',
        sender: 'ai1',
        message: 'Halo! Saya AI 1 - Technical Analyst. Saya dapat menganalisis 10 indikator teknis untuk memberikan sinyal trading terbaik.',
        timestamp: new Date(),
        aiName: 'Technical Analyst'
      },
      {
        id: '3',
        sender: 'ai2',
        message: 'AI 2 - Signal Validator di sini. Saya akan memvalidasi setiap sinyal dari AI 1 untuk memastikan akurasi tinggi.',
        timestamp: new Date(),
        aiName: 'Signal Validator'
      },
      {
        id: '4',
        sender: 'ai3',
        message: 'AI 3 - Strategy Executor siap melakukan eksekusi trading otomatis ke MetaTrader 5 dengan manajemen risiko yang tepat.',
        timestamp: new Date(),
        aiName: 'Strategy Executor'
      }
    ];

    setMessages(welcomeMessages);
  }, [router]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleLogout = () => {
    removeLocalStorage('user');
    removeLocalStorage('token');
    router.push('/');
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      message: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      // Determine which AI should respond based on message content or active AI
      let targetAI = activeAI === 'all' ? 'ai4' : activeAI;
      
      // Smart routing based on message content
      const message = inputMessage.toLowerCase();
      if (message.includes('technical') || message.includes('indicator') || message.includes('chart')) {
        targetAI = 'ai1';
      } else if (message.includes('validate') || message.includes('signal') || message.includes('confirm')) {
        targetAI = 'ai2';
      } else if (message.includes('execute') || message.includes('trade') || message.includes('mt5')) {
        targetAI = 'ai3';
      } else if (message.includes('news') || message.includes('sentiment') || message.includes('market')) {
        targetAI = 'ai4';
      }

      // Get AI response
      let aiResponse;
      switch (targetAI) {
        case 'ai1':
          aiResponse = await aiService.technicalAnalysis({ message: inputMessage });
          break;
        case 'ai2':
          aiResponse = await aiService.validateSignal({ message: inputMessage });
          break;
        case 'ai3':
          aiResponse = await aiService.executeStrategy({ message: inputMessage });
          break;
        case 'ai4':
        default:
          aiResponse = await aiService.assistantChat(inputMessage);
          break;
      }

      if (aiResponse.success && aiResponse.data) {
        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: targetAI as any,
          message: aiResponse.data,
          timestamp: new Date(),
          aiName: aiProfiles[targetAI as keyof typeof aiProfiles].name
        };

        setMessages(prev => [...prev, aiMessage]);

        // Sometimes trigger additional AI responses for more dynamic conversation
        if (Math.random() > 0.7 && targetAI !== 'ai4') {
          setTimeout(async () => {
            const followUpResponse = await aiService.assistantChat(
              `Following up on the ${aiProfiles[targetAI as keyof typeof aiProfiles].name} analysis: ${aiResponse.data}`
            );
            
            if (followUpResponse.success && followUpResponse.data) {
              const followUpMessage: ChatMessage = {
                id: (Date.now() + 2).toString(),
                sender: 'ai4',
                message: followUpResponse.data,
                timestamp: new Date(),
                aiName: 'News Assistant'
              };
              setMessages(prev => [...prev, followUpMessage]);
            }
          }, 2000);
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai4',
        message: 'Maaf, terjadi kesalahan dalam memproses pesan Anda. Silakan coba lagi.',
        timestamp: new Date(),
        aiName: 'News Assistant'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickPrompts = [
    "Analisis teknis untuk EURUSD",
    "Validasi sinyal BUY GBPUSD",
    "Execute trade dengan SL 50 pips",
    "Sentiment berita hari ini",
    "Status semua AI layers",
    "Rekomendasi trading pair"
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
              <Link href="/dashboard">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center cursor-pointer">
                  <span className="text-white font-bold text-lg">MR</span>
                </div>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-white">AI Room</h1>
                <p className="text-sm text-gray-400">Chat with 4 AI Trading Specialists</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Badge variant="default" className="bg-green-600">
                4 AI Online
              </Badge>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <aside className="w-64 bg-black/30 border-r border-gray-800">
          <nav className="p-4 space-y-2">
            <Link href="/dashboard">
              <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white">
                Dashboard
              </Button>
            </Link>
            <Link href="/ai-room">
              <Button variant="ghost" className="w-full justify-start text-white bg-gray-800">
                AI Room
              </Button>
            </Link>
            <Link href="/trading-log">
              <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white">
                Trading Log
              </Button>
            </Link>
          </nav>

          {/* AI Status */}
          <div className="p-4 border-t border-gray-800">
            <h3 className="text-sm font-medium text-gray-400 mb-3">AI Status</h3>
            <div className="space-y-2">
              {Object.entries(aiProfiles).map(([key, ai]) => (
                <div key={key} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">{ai.icon}</span>
                    <span className="text-xs text-gray-300">{ai.name}</span>
                  </div>
                  <Badge variant="outline" className="text-green-400 border-green-400 text-xs">
                    Online
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Chat Area */}
        <main className="flex-1 flex flex-col">
          {/* AI Filter Tabs */}
          <div className="border-b border-gray-800 bg-black/30 p-4">
            <Tabs value={activeAI} onValueChange={(value) => setActiveAI(value as any)}>
              <TabsList className="bg-gray-900">
                <TabsTrigger value="all">All AI</TabsTrigger>
                <TabsTrigger value="ai1">🔵 Technical</TabsTrigger>
                <TabsTrigger value="ai2">🟡 Validator</TabsTrigger>
                <TabsTrigger value="ai3">🔴 Executor</TabsTrigger>
                <TabsTrigger value="ai4">🟢 Assistant</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Messages Area */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] ${msg.sender === 'user' ? 'order-2' : 'order-1'}`}>
                    {msg.sender !== 'user' && (
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-lg">{aiProfiles[msg.sender as keyof typeof aiProfiles]?.icon}</span>
                        <span className="text-xs text-gray-400">{msg.aiName}</span>
                        <span className="text-xs text-gray-500">
                          {msg.timestamp.toLocaleTimeString('id-ID', { hour12: false })}
                        </span>
                      </div>
                    )}
                    <div className={`p-3 rounded-lg ${
                      msg.sender === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-800 text-gray-100'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                      {msg.sender === 'user' && (
                        <p className="text-xs text-blue-200 mt-1">
                          {msg.timestamp.toLocaleTimeString('id-ID', { hour12: false })}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-800 text-gray-100 p-3 rounded-lg">
                    <p className="text-sm">AI sedang mengetik...</p>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Quick Prompts */}
          <div className="border-t border-gray-800 bg-black/30 p-4">
            <div className="flex flex-wrap gap-2 mb-4">
              {quickPrompts.map((prompt, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setInputMessage(prompt)}
                  className="text-xs"
                >
                  {prompt}
                </Button>
              ))}
            </div>
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-800 bg-black/50 p-4">
            <div className="flex space-x-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ketik pesan untuk AI..."
                className="flex-1 bg-gray-900 border-gray-700 text-white placeholder-gray-500"
                disabled={isLoading}
              />
              <Button onClick={sendMessage} disabled={isLoading || !inputMessage.trim()}>
                {isLoading ? "..." : "Kirim"}
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Tekan Enter untuk mengirim. AI akan merespons berdasarkan konteks pesan Anda.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
