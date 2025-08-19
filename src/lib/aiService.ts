interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface AIResponse {
  success: boolean;
  data?: string;
  error?: string;
}

export class AIService {
  private apiKey: string;
  private baseUrl: string;
  private model: string;

  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY || '';
    this.baseUrl = 'https://openrouter.ai/api/v1/chat/completions';
    this.model = process.env.AI_MODEL || 'anthropic/claude-sonnet-4';
  }

  async chat(messages: ChatMessage[]): Promise<AIResponse> {
    try {
      // Mock implementation for now - replace with real API call when key is available
      if (!this.apiKey || this.apiKey === 'your-openrouter-api-key-here') {
        return this.mockAIResponse(messages);
      }

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
          'X-Title': 'Maulana Rifai Trading AI'
        },
        body: JSON.stringify({
          model: this.model,
          messages: messages,
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        throw new Error(`AI API error: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data.choices[0]?.message?.content || 'No response from AI'
      };
    } catch (error) {
      console.error('AI Service Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown AI error'
      };
    }
  }

  private mockAIResponse(messages: ChatMessage[]): AIResponse {
    const lastMessage = messages[messages.length - 1];
    const userInput = lastMessage.content.toLowerCase();

    // Mock responses based on context
    if (userInput.includes('technical') || userInput.includes('analysis')) {
      return {
        success: true,
        data: `🔵 AI 1 - Technical Analysis Result:
        
Based on current market indicators:
- RSI: 65.2 (Neutral to Overbought)
- MACD: Bullish crossover detected
- Moving Average: Price above 20-day MA
- Bollinger Bands: Price near upper band
- Volume: Above average

SIGNAL: BUY with caution
Confidence: 75%
Recommended action: Wait for AI 2 validation`
      };
    }

    if (userInput.includes('validate') || userInput.includes('signal')) {
      return {
        success: true,
        data: `🟡 AI 2 - Signal Validation:
        
After cross-checking AI 1 analysis:
- Confirmed bullish momentum
- Risk/reward ratio: 1:2.5
- Market sentiment: Positive
- News impact: Neutral

VALIDATION: APPROVED
Forwarding to AI 3 for execution planning`
      };
    }

    if (userInput.includes('execute') || userInput.includes('trade')) {
      return {
        success: true,
        data: `🔴 AI 3 - Strategy Execution:
        
Trade Setup:
- Entry: Current market price
- Stop Loss: -2.5%
- Take Profit: +6.2%
- Position Size: 2% of portfolio
- Expected Pips: 45-50

STATUS: Ready for MT5 execution
Risk Level: Medium`
      };
    }

    if (userInput.includes('news') || userInput.includes('sentiment')) {
      return {
        success: true,
        data: `🟢 AI 4 - News & Sentiment Analysis:
        
Market Sentiment Summary:
- Overall sentiment: Cautiously optimistic
- Key news: Fed meeting minutes released
- Economic indicators: Mixed signals
- Social sentiment: 62% bullish

Recommendation: Monitor closely for next 2-4 hours
Impact on current signals: Minimal`
      };
    }

    // Default assistant response
    return {
      success: true,
      data: `🟢 AI Assistant: I'm here to help with your trading analysis. I can provide:

- Technical analysis of market indicators
- Signal validation and risk assessment  
- Trade execution planning
- News sentiment analysis
- Real-time market insights

What would you like me to analyze for you?`
    };
  }

  // Specialized methods for each AI layer
  async technicalAnalysis(marketData: any): Promise<AIResponse> {
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: 'You are AI 1 - Technical Analysis Expert. Analyze market data using 10 key indicators: MA, RSI, MACD, Bollinger Bands, Stochastic, Fibonacci, ATR, Ichimoku Cloud, Volume, and Parabolic SAR. Provide clear BUY/SELL signals with confidence levels.'
      },
      {
        role: 'user',
        content: `Analyze this market data: ${JSON.stringify(marketData)}`
      }
    ];

    return this.chat(messages);
  }

  async validateSignal(signalData: any): Promise<AIResponse> {
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: 'You are AI 2 - Signal Validator. Cross-check and validate signals from AI 1. Discuss with AI 1 to improve accuracy. Only approve signals with high probability of success.'
      },
      {
        role: 'user',
        content: `Validate this signal: ${JSON.stringify(signalData)}`
      }
    ];

    return this.chat(messages);
  }

  async executeStrategy(validatedSignal: any): Promise<AIResponse> {
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: 'You are AI 3 - Strategy Executor. Calculate SL, TP, pip values, and execute trades via MT5. Learn from historical performance and optimize strategies.'
      },
      {
        role: 'user',
        content: `Execute strategy for: ${JSON.stringify(validatedSignal)}`
      }
    ];

    return this.chat(messages);
  }

  async assistantChat(userMessage: string, context?: any): Promise<AIResponse> {
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: 'You are AI 4 - Personal Trading Assistant. Analyze news sentiment, provide market insights, and engage in helpful discussions about trading strategies. Be conversational and supportive.'
      },
      {
        role: 'user',
        content: userMessage
      }
    ];

    if (context) {
      messages.splice(1, 0, {
        role: 'assistant',
        content: `Context: ${JSON.stringify(context)}`
      });
    }

    return this.chat(messages);
  }
}

export const aiService = new AIService();
