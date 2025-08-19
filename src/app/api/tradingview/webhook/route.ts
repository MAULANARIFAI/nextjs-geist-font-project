import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      symbol, 
      action, 
      price, 
      time, 
      strategy, 
      webhook_secret,
      indicators 
    } = body;

    // Verify webhook secret
    const expectedSecret = process.env.TRADINGVIEW_WEBHOOK_SECRET || 'demo-webhook-secret';
    if (webhook_secret !== expectedSecret) {
      return NextResponse.json(
        { success: false, error: 'Invalid webhook secret' },
        { status: 401 }
      );
    }

    // Validate required fields
    if (!symbol || !action || !price) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: symbol, action, price' },
        { status: 400 }
      );
    }

    // Process TradingView signal
    const tradingViewSignal = {
      id: `TV_${Date.now()}`,
      source: 'TradingView',
      symbol: symbol.toUpperCase(),
      action: action.toUpperCase(), // BUY, SELL, CLOSE
      price: parseFloat(price),
      timestamp: time ? new Date(time) : new Date(),
      strategy: strategy || 'Unknown Strategy',
      indicators: indicators || {},
      processed: false,
      confidence: calculateConfidence(indicators),
      metadata: {
        receivedAt: new Date().toISOString(),
        webhook: true,
        version: '1.0'
      }
    };

    // Log the received signal
    console.log('TradingView Signal Received:', {
      symbol: tradingViewSignal.symbol,
      action: tradingViewSignal.action,
      price: tradingViewSignal.price,
      strategy: tradingViewSignal.strategy
    });

    // Forward to AI 1 for technical analysis
    try {
      const technicalResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/ai/technical`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symbol: tradingViewSignal.symbol,
          timeframe: '1H',
          indicators: tradingViewSignal.indicators,
          tradingViewSignal
        }),
      });

      if (technicalResponse.ok) {
        const technicalData = await technicalResponse.json();
        
        // If technical analysis is successful, forward to validator
        if (technicalData.success) {
          const validatorResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/ai/validator`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              signalData: tradingViewSignal,
              technicalAnalysis: technicalData.data
            }),
          });

          if (validatorResponse.ok) {
            const validatorData = await validatorResponse.json();
            
            // If validation is approved, forward to executor
            if (validatorData.success && validatorData.data.approved) {
              const executorResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/ai/executor`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  validatedSignal: {
                    ...tradingViewSignal,
                    entry: tradingViewSignal.price,
                    stopLoss: calculateStopLoss(tradingViewSignal),
                    takeProfit: calculateTakeProfit(tradingViewSignal),
                    type: tradingViewSignal.action
                  }
                }),
              });

              const executorData = executorResponse.ok ? await executorResponse.json() : null;

              return NextResponse.json({
                success: true,
                message: 'TradingView signal processed through full AI chain',
                data: {
                  originalSignal: tradingViewSignal,
                  technicalAnalysis: technicalData.data,
                  validation: validatorData.data,
                  execution: executorData?.data || null,
                  processingChain: ['TradingView', 'AI 1', 'AI 2', 'AI 3'],
                  finalStatus: executorData?.success ? 'EXECUTED' : 'VALIDATION_ONLY'
                }
              });
            } else {
              return NextResponse.json({
                success: true,
                message: 'TradingView signal processed but not approved for execution',
                data: {
                  originalSignal: tradingViewSignal,
                  technicalAnalysis: technicalData.data,
                  validation: validatorData.data,
                  processingChain: ['TradingView', 'AI 1', 'AI 2'],
                  finalStatus: 'REJECTED'
                }
              });
            }
          }
        }
      }
    } catch (aiError) {
      console.error('AI processing error:', aiError);
      // Continue with basic response even if AI processing fails
    }

    // Basic response if AI chain processing fails
    return NextResponse.json({
      success: true,
      message: 'TradingView signal received and logged',
      data: {
        signal: tradingViewSignal,
        status: 'RECEIVED',
        nextStep: 'Manual review or retry AI processing'
      }
    });

  } catch (error) {
    console.error('TradingView Webhook error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function calculateConfidence(indicators: any): number {
  if (!indicators || Object.keys(indicators).length === 0) {
    return 50; // Default confidence
  }

  let score = 0;
  let count = 0;

  // Simple confidence calculation based on indicators
  if (indicators.rsi) {
    if (indicators.rsi > 70 || indicators.rsi < 30) score += 20;
    else if (indicators.rsi > 60 || indicators.rsi < 40) score += 10;
    count++;
  }

  if (indicators.macd_signal) {
    if (indicators.macd_signal === 'BUY' || indicators.macd_signal === 'SELL') score += 25;
    count++;
  }

  if (indicators.ma_trend) {
    if (indicators.ma_trend === 'BULLISH' || indicators.ma_trend === 'BEARISH') score += 15;
    count++;
  }

  return count > 0 ? Math.min(Math.max(score / count * 2, 30), 95) : 50;
}

function calculateStopLoss(signal: any): number {
  const basePrice = signal.price;
  const slDistance = basePrice * 0.005; // 0.5% stop loss
  
  return signal.action === 'BUY' ? basePrice - slDistance : basePrice + slDistance;
}

function calculateTakeProfit(signal: any): number {
  const basePrice = signal.price;
  const tpDistance = basePrice * 0.015; // 1.5% take profit
  
  return signal.action === 'BUY' ? basePrice + tpDistance : basePrice - tpDistance;
}

export async function GET() {
  return NextResponse.json({
    message: 'TradingView Webhook endpoint',
    description: 'Receives trading signals from TradingView and processes through AI chain',
    usage: 'POST webhook from TradingView with signal data',
    requiredFields: [
      'symbol - Trading pair (e.g., EURUSD)',
      'action - BUY, SELL, or CLOSE',
      'price - Current market price',
      'webhook_secret - Authentication secret'
    ],
    optionalFields: [
      'time - Signal timestamp',
      'strategy - Strategy name',
      'indicators - Technical indicator values'
    ],
    processingChain: [
      '1. Receive TradingView signal',
      '2. Forward to AI 1 - Technical Analysis',
      '3. Forward to AI 2 - Signal Validator',
      '4. If approved, forward to AI 3 - Strategy Executor',
      '5. Return complete processing result'
    ],
    webhookSetup: {
      url: '/api/tradingview/webhook',
      method: 'POST',
      contentType: 'application/json',
      authentication: 'webhook_secret parameter'
    },
    examplePayload: {
      symbol: 'EURUSD',
      action: 'BUY',
      price: 1.0850,
      time: '2024-01-01T12:00:00Z',
      strategy: 'AI Trend Following',
      webhook_secret: 'your-webhook-secret',
      indicators: {
        rsi: 65,
        macd_signal: 'BUY',
        ma_trend: 'BULLISH'
      }
    }
  });
}
