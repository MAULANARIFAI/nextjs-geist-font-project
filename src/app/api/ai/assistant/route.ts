import { NextRequest, NextResponse } from 'next/server';
import { aiService } from '@/lib/aiService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, context, newsUrls, analysisType } = body;

    // Validate input
    if (!message) {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
        { status: 400 }
      );
    }

    // Determine analysis type
    const type = analysisType || detectAnalysisType(message);
    
    let responseData;

    switch (type) {
      case 'news_sentiment':
        responseData = await handleNewsSentiment(message, newsUrls);
        break;
      case 'market_insight':
        responseData = await handleMarketInsight(message, context);
        break;
      case 'chat_assistance':
        responseData = await handleChatAssistance(message, context);
        break;
      default:
        responseData = await handleGeneralAssistance(message, context);
    }

    return NextResponse.json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error('AI Assistant API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function detectAnalysisType(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('news') || lowerMessage.includes('sentiment') || lowerMessage.includes('berita')) {
    return 'news_sentiment';
  }
  if (lowerMessage.includes('market') || lowerMessage.includes('analysis') || lowerMessage.includes('pasar')) {
    return 'market_insight';
  }
  if (lowerMessage.includes('help') || lowerMessage.includes('bantuan') || lowerMessage.includes('bagaimana')) {
    return 'chat_assistance';
  }
  
  return 'general_assistance';
}

async function handleNewsSentiment(message: string, newsUrls?: string[]) {
  // Mock news sentiment analysis
  const mockNews = [
    {
      title: "Fed Maintains Interest Rates, Signals Cautious Approach",
      source: "Reuters",
      sentiment: "NEUTRAL",
      impact: "MEDIUM",
      relevantPairs: ["EURUSD", "GBPUSD", "USDJPY"],
      summary: "Federal Reserve keeps rates unchanged, market shows mixed reaction"
    },
    {
      title: "ECB President Hints at Potential Rate Cuts",
      source: "Bloomberg",
      sentiment: "BEARISH_EUR",
      impact: "HIGH",
      relevantPairs: ["EURUSD", "EURGBP"],
      summary: "European Central Bank considers monetary easing amid economic concerns"
    },
    {
      title: "Strong US Employment Data Boosts Dollar",
      source: "MarketWatch",
      sentiment: "BULLISH_USD",
      impact: "HIGH",
      relevantPairs: ["EURUSD", "GBPUSD", "USDJPY", "AUDUSD"],
      summary: "Non-farm payrolls exceed expectations, strengthening USD outlook"
    }
  ];

  const overallSentiment = {
    market: "CAUTIOUSLY_OPTIMISTIC",
    usd: "BULLISH",
    eur: "BEARISH",
    gbp: "NEUTRAL",
    confidence: 78
  };

  const aiResponse = await aiService.assistantChat(
    `Analyze market sentiment based on recent news: ${JSON.stringify(mockNews)}`
  );

  return {
    type: 'news_sentiment',
    analysis: aiResponse.data,
    newsItems: mockNews,
    overallSentiment,
    recommendations: [
      "Monitor USD strength across major pairs",
      "Consider EUR weakness in trading decisions",
      "Watch for volatility around economic announcements"
    ],
    timestamp: new Date().toISOString(),
    aiLayer: 'AI 4 - News Assistant'
  };
}

async function handleMarketInsight(message: string, context?: any) {
  // Mock market insight data
  const marketData = {
    majorPairs: {
      EURUSD: { price: 1.0845, change: -0.0012, trend: "BEARISH" },
      GBPUSD: { price: 1.2634, change: +0.0008, trend: "BULLISH" },
      USDJPY: { price: 149.85, change: +0.45, trend: "BULLISH" },
      AUDUSD: { price: 0.6789, change: -0.0023, trend: "BEARISH" }
    },
    marketSession: "London",
    volatility: "MEDIUM",
    volume: "ABOVE_AVERAGE",
    keyLevels: {
      EURUSD: { support: 1.0820, resistance: 1.0870 },
      GBPUSD: { support: 1.2600, resistance: 1.2680 }
    }
  };

  const aiResponse = await aiService.assistantChat(
    `Provide market insights based on current data: ${message}. Market context: ${JSON.stringify(marketData)}`
  );

  return {
    type: 'market_insight',
    analysis: aiResponse.data,
    marketData,
    insights: [
      "USD showing strength across major pairs",
      "European currencies under pressure",
      "Asian session volatility expected",
      "Key economic data releases pending"
    ],
    tradingOpportunities: [
      {
        pair: "EURUSD",
        direction: "SELL",
        confidence: 75,
        reason: "Technical breakdown + fundamental weakness"
      },
      {
        pair: "GBPUSD", 
        direction: "BUY",
        confidence: 68,
        reason: "Bullish momentum + positive sentiment"
      }
    ],
    timestamp: new Date().toISOString(),
    aiLayer: 'AI 4 - News Assistant'
  };
}

async function handleChatAssistance(message: string, context?: any) {
  const aiResponse = await aiService.assistantChat(message, context);

  // Add helpful resources based on message content
  const resources = [];
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('learn') || lowerMessage.includes('belajar')) {
    resources.push({
      title: "Trading Basics Guide",
      description: "Fundamental concepts of forex trading",
      type: "educational"
    });
  }

  if (lowerMessage.includes('strategy') || lowerMessage.includes('strategi')) {
    resources.push({
      title: "AI Trading Strategies",
      description: "How our 4-layer AI system works",
      type: "strategy"
    });
  }

  return {
    type: 'chat_assistance',
    response: aiResponse.data,
    helpful: true,
    resources,
    suggestedActions: [
      "Check current market analysis",
      "Review recent trading signals",
      "Explore AI Room features"
    ],
    timestamp: new Date().toISOString(),
    aiLayer: 'AI 4 - News Assistant'
  };
}

async function handleGeneralAssistance(message: string, context?: any) {
  const aiResponse = await aiService.assistantChat(message, context);

  return {
    type: 'general_assistance',
    response: aiResponse.data,
    context: context || null,
    capabilities: [
      "Market sentiment analysis",
      "News impact assessment", 
      "Trading strategy discussion",
      "Educational support",
      "Real-time market insights"
    ],
    timestamp: new Date().toISOString(),
    aiLayer: 'AI 4 - News Assistant'
  };
}

export async function GET() {
  return NextResponse.json({
    message: 'AI Assistant & News Analyzer endpoint',
    description: 'Personal trading assistant with news sentiment analysis',
    usage: 'POST with { message, context?, newsUrls?, analysisType? }',
    capabilities: [
      'News sentiment analysis from major financial sources',
      'Market insight and trend analysis',
      'Interactive chat assistance',
      'Educational support and guidance',
      'Real-time market commentary',
      'Trading strategy discussions',
      'Risk management advice',
      'Economic calendar impact analysis'
    ],
    analysisTypes: [
      'news_sentiment - Analyze market news and sentiment',
      'market_insight - Provide current market analysis',
      'chat_assistance - Interactive help and guidance',
      'general_assistance - General trading support'
    ],
    newsSources: [
      'Reuters Financial',
      'Bloomberg Markets',
      'MarketWatch',
      'Financial Times',
      'CNBC Markets',
      'Yahoo Finance'
    ],
    features: {
      sentiment: 'Real-time news sentiment scoring',
      impact: 'Market impact assessment (HIGH/MEDIUM/LOW)',
      pairs: 'Relevant currency pair identification',
      recommendations: 'Actionable trading insights',
      learning: 'Continuous improvement from user interactions'
    }
  });
}

// WebSocket endpoint for real-time news updates (mock)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, preferences } = body;

    if (action === 'subscribe_news') {
      return NextResponse.json({
        success: true,
        data: {
          subscribed: true,
          preferences: preferences || {
            sources: ['Reuters', 'Bloomberg', 'MarketWatch'],
            pairs: ['EURUSD', 'GBPUSD', 'USDJPY'],
            impactLevel: 'MEDIUM_HIGH',
            updateFrequency: '5_MINUTES'
          },
          message: 'Subscribed to real-time news updates',
          nextUpdate: new Date(Date.now() + 5 * 60 * 1000).toISOString()
        }
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid action'
    }, { status: 400 });

  } catch (error) {
    console.error('News subscription error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
