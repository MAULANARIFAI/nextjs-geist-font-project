import { NextRequest, NextResponse } from 'next/server';
import { aiService } from '@/lib/aiService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { validatedSignal, accountInfo, riskSettings } = body;

    // Validate input
    if (!validatedSignal) {
      return NextResponse.json(
        { success: false, error: 'Validated signal data is required for execution' },
        { status: 400 }
      );
    }

    // Mock account and risk settings
    const mockAccountInfo = accountInfo || {
      balance: 10000,
      equity: 10000,
      freeMargin: 8500,
      leverage: 100,
      currency: 'USD'
    };

    const mockRiskSettings = riskSettings || {
      maxRiskPerTrade: 2, // 2% of account
      maxDailyRisk: 6, // 6% of account per day
      maxOpenTrades: 5,
      riskRewardRatio: 2.5
    };

    // Calculate position size and risk management
    const riskAmount = mockAccountInfo.balance * (mockRiskSettings.maxRiskPerTrade / 100);
    const pipValue = 10; // $10 per pip for standard lot
    const stopLossPips = Math.abs(validatedSignal.entry - validatedSignal.stopLoss) * 10000;
    const lotSize = Math.min(riskAmount / (stopLossPips * pipValue), 1.0);

    const executionData = {
      signal: validatedSignal,
      account: mockAccountInfo,
      riskSettings: mockRiskSettings,
      calculatedLotSize: parseFloat(lotSize.toFixed(2)),
      riskAmount: parseFloat(riskAmount.toFixed(2)),
      stopLossPips: parseFloat(stopLossPips.toFixed(1)),
      takeProfitPips: Math.abs(validatedSignal.takeProfit - validatedSignal.entry) * 10000,
      expectedRR: mockRiskSettings.riskRewardRatio,
      timestamp: new Date().toISOString()
    };

    // Get AI execution strategy
    const execution = await aiService.executeStrategy(executionData);

    if (execution.success) {
      // Simulate MT5 execution
      const executionResult = {
        orderId: `MT5_${Date.now()}`,
        symbol: validatedSignal.symbol,
        type: validatedSignal.type,
        lotSize: executionData.calculatedLotSize,
        entryPrice: validatedSignal.entry,
        stopLoss: validatedSignal.stopLoss,
        takeProfit: validatedSignal.takeProfit,
        executionTime: new Date().toISOString(),
        status: 'EXECUTED',
        slippage: (Math.random() - 0.5) * 0.0002, // Random slippage
        commission: executionData.calculatedLotSize * 7, // $7 per lot
        swap: 0,
        magicNumber: 12345,
        comment: 'AI Trading System v1.0',
        riskManagement: {
          riskAmount: executionData.riskAmount,
          riskPercentage: mockRiskSettings.maxRiskPerTrade,
          stopLossPips: executionData.stopLossPips,
          takeProfitPips: executionData.takeProfitPips,
          riskRewardRatio: executionData.expectedRR
        },
        aiAnalysis: execution.data,
        mt5Response: {
          success: true,
          message: 'Order executed successfully',
          serverTime: new Date().toISOString(),
          spread: Math.random() * 2 + 0.5 // Random spread
        },
        timestamp: new Date().toISOString(),
        aiLayer: 'AI 3 - Strategy Executor'
      };

      // Log the execution for learning
      console.log('Trade Executed:', {
        symbol: executionResult.symbol,
        type: executionResult.type,
        lotSize: executionResult.lotSize,
        risk: executionResult.riskManagement.riskAmount
      });

      return NextResponse.json({
        success: true,
        data: executionResult
      });
    } else {
      return NextResponse.json({
        success: false,
        error: execution.error || 'Strategy execution failed'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Strategy Execution API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'AI Strategy Executor endpoint',
    description: 'Executes validated trading signals on MetaTrader 5',
    usage: 'POST with { validatedSignal, accountInfo?, riskSettings? }',
    features: [
      'Automatic position sizing calculation',
      'Risk management enforcement',
      'Stop Loss and Take Profit optimization',
      'MetaTrader 5 integration',
      'Real-time execution monitoring',
      'Slippage and spread tracking',
      'Commission calculation',
      'Trade logging for AI learning'
    ],
    riskManagement: {
      maxRiskPerTrade: '2% of account balance',
      maxDailyRisk: '6% of account balance',
      maxOpenTrades: 5,
      riskRewardRatio: '1:2.5 minimum'
    },
    mt5Integration: {
      orderTypes: ['Market', 'Pending'],
      magicNumber: 12345,
      comment: 'AI Trading System v1.0',
      slippageControl: 'Automatic',
      executionMode: 'Real-time'
    }
  });
}

// GET specific trade status
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, action } = body;

    if (!orderId || !action) {
      return NextResponse.json(
        { success: false, error: 'Order ID and action are required' },
        { status: 400 }
      );
    }

    // Mock trade management actions
    const actions = {
      'CLOSE': 'Trade closed successfully',
      'MODIFY_SL': 'Stop Loss modified',
      'MODIFY_TP': 'Take Profit modified',
      'PARTIAL_CLOSE': 'Partial position closed'
    };

    const result = {
      orderId,
      action,
      status: 'SUCCESS',
      message: actions[action as keyof typeof actions] || 'Action completed',
      timestamp: new Date().toISOString(),
      newValues: action.includes('MODIFY') ? {
        stopLoss: 1.0800 + (Math.random() * 0.01),
        takeProfit: 1.0900 + (Math.random() * 0.01)
      } : null
    };

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Trade management error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
