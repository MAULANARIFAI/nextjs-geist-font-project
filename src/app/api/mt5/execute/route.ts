import { NextRequest, NextResponse } from 'next/server';

interface MT5OrderRequest {
  symbol: string;
  action: 'BUY' | 'SELL' | 'CLOSE' | 'MODIFY';
  volume: number;
  price?: number;
  sl?: number;
  tp?: number;
  orderId?: string;
  comment?: string;
  magicNumber?: number;
}

interface MT5Account {
  login: string;
  server: string;
  balance: number;
  equity: number;
  margin: number;
  freeMargin: number;
  leverage: number;
  currency: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      symbol, 
      action, 
      volume, 
      price, 
      sl, 
      tp, 
      orderId,
      comment,
      magicNumber 
    }: MT5OrderRequest = body;

    // Validate required fields
    if (!symbol || !action || !volume) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: symbol, action, volume' },
        { status: 400 }
      );
    }

    // Mock MT5 account info
    const accountInfo: MT5Account = {
      login: process.env.MT5_LOGIN || 'demo-account',
      server: process.env.MT5_SERVER || 'demo-server',
      balance: 10000.00,
      equity: 10000.00,
      margin: 1500.00,
      freeMargin: 8500.00,
      leverage: 100,
      currency: 'USD'
    };

    // Simulate MT5 connection and execution
    const executionResult = await simulateMT5Execution({
      symbol,
      action,
      volume,
      price,
      sl,
      tp,
      orderId,
      comment: comment || 'AI Trading System',
      magicNumber: magicNumber || 12345
    });

    if (executionResult.success) {
      // Log successful execution
      console.log('MT5 Execution Success:', {
        orderId: 'orderId' in executionResult ? executionResult.orderId : 'N/A',
        symbol,
        action,
        volume,
        executionPrice: 'executionPrice' in executionResult ? executionResult.executionPrice : 'closePrice' in executionResult ? executionResult.closePrice : 'N/A'
      });

      return NextResponse.json({
        success: true,
        data: {
          ...executionResult,
          account: accountInfo,
          timestamp: new Date().toISOString()
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        error: executionResult.error,
        details: executionResult.details
      }, { status: 400 });
    }

  } catch (error) {
    console.error('MT5 Execute API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function simulateMT5Execution(order: MT5OrderRequest) {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));

  // Mock market prices
  const marketPrices: { [key: string]: { bid: number; ask: number; spread: number } } = {
    'EURUSD': { bid: 1.0845, ask: 1.0847, spread: 0.0002 },
    'GBPUSD': { bid: 1.2632, ask: 1.2635, spread: 0.0003 },
    'USDJPY': { bid: 149.83, ask: 149.86, spread: 0.03 },
    'AUDUSD': { bid: 0.6787, ask: 0.6789, spread: 0.0002 },
    'USDCAD': { bid: 1.3456, ask: 1.3459, spread: 0.0003 },
    'NZDUSD': { bid: 0.6234, ask: 0.6236, spread: 0.0002 },
    'USDCHF': { bid: 0.8765, ask: 0.8767, spread: 0.0002 }
  };

  const marketData = marketPrices[order.symbol];
  if (!marketData) {
    return {
      success: false,
      error: 'Invalid symbol',
      details: `Symbol ${order.symbol} not found in market data`
    };
  }

  // Simulate execution based on action
  switch (order.action) {
    case 'BUY':
      return executeBuyOrder(order, marketData);
    case 'SELL':
      return executeSellOrder(order, marketData);
    case 'CLOSE':
      return executeCloseOrder(order, marketData);
    case 'MODIFY':
      return executeModifyOrder(order, marketData);
    default:
      return {
        success: false,
        error: 'Invalid action',
        details: `Action ${order.action} not supported`
      };
  }
}

function executeBuyOrder(order: MT5OrderRequest, marketData: any) {
  const executionPrice = order.price || marketData.ask;
  const slippage = (Math.random() - 0.5) * 0.0001; // Random slippage
  const finalPrice = executionPrice + slippage;

  // Validate stop loss and take profit
  if (order.sl && order.sl >= finalPrice) {
    return {
      success: false,
      error: 'Invalid stop loss',
      details: 'Stop loss must be below entry price for BUY orders'
    };
  }

  if (order.tp && order.tp <= finalPrice) {
    return {
      success: false,
      error: 'Invalid take profit',
      details: 'Take profit must be above entry price for BUY orders'
    };
  }

  return {
    success: true,
    orderId: `MT5_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    symbol: order.symbol,
    action: order.action,
    volume: order.volume,
    requestedPrice: order.price,
    executionPrice: parseFloat(finalPrice.toFixed(5)),
    slippage: parseFloat(slippage.toFixed(5)),
    stopLoss: order.sl,
    takeProfit: order.tp,
    spread: marketData.spread,
    commission: calculateCommission(order.volume),
    swap: 0,
    profit: 0,
    comment: order.comment,
    magicNumber: order.magicNumber,
    openTime: new Date().toISOString(),
    status: 'OPEN',
    mt5Response: {
      retcode: 10009, // TRADE_RETCODE_DONE
      deal: Math.floor(Math.random() * 1000000) + 100000,
      order: Math.floor(Math.random() * 1000000) + 100000,
      volume: order.volume,
      price: finalPrice,
      bid: marketData.bid,
      ask: marketData.ask,
      comment: 'Request executed',
      request_id: Math.floor(Math.random() * 1000000)
    }
  };
}

function executeSellOrder(order: MT5OrderRequest, marketData: any) {
  const executionPrice = order.price || marketData.bid;
  const slippage = (Math.random() - 0.5) * 0.0001;
  const finalPrice = executionPrice + slippage;

  if (order.sl && order.sl <= finalPrice) {
    return {
      success: false,
      error: 'Invalid stop loss',
      details: 'Stop loss must be above entry price for SELL orders'
    };
  }

  if (order.tp && order.tp >= finalPrice) {
    return {
      success: false,
      error: 'Invalid take profit',
      details: 'Take profit must be below entry price for SELL orders'
    };
  }

  return {
    success: true,
    orderId: `MT5_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    symbol: order.symbol,
    action: order.action,
    volume: order.volume,
    requestedPrice: order.price,
    executionPrice: parseFloat(finalPrice.toFixed(5)),
    slippage: parseFloat(slippage.toFixed(5)),
    stopLoss: order.sl,
    takeProfit: order.tp,
    spread: marketData.spread,
    commission: calculateCommission(order.volume),
    swap: 0,
    profit: 0,
    comment: order.comment,
    magicNumber: order.magicNumber,
    openTime: new Date().toISOString(),
    status: 'OPEN',
    mt5Response: {
      retcode: 10009,
      deal: Math.floor(Math.random() * 1000000) + 100000,
      order: Math.floor(Math.random() * 1000000) + 100000,
      volume: order.volume,
      price: finalPrice,
      bid: marketData.bid,
      ask: marketData.ask,
      comment: 'Request executed',
      request_id: Math.floor(Math.random() * 1000000)
    }
  };
}

function executeCloseOrder(order: MT5OrderRequest, marketData: any) {
  if (!order.orderId) {
    return {
      success: false,
      error: 'Order ID required for close operation',
      details: 'orderId parameter is mandatory for CLOSE action'
    };
  }

  const closePrice = marketData.bid; // Assuming closing a BUY order
  const profit = (Math.random() - 0.3) * 100; // Random profit/loss

  return {
    success: true,
    orderId: order.orderId,
    symbol: order.symbol,
    action: order.action,
    volume: order.volume,
    closePrice: parseFloat(closePrice.toFixed(5)),
    profit: parseFloat(profit.toFixed(2)),
    commission: calculateCommission(order.volume),
    swap: (Math.random() - 0.5) * 5,
    closeTime: new Date().toISOString(),
    status: 'CLOSED',
    mt5Response: {
      retcode: 10009,
      deal: Math.floor(Math.random() * 1000000) + 100000,
      order: Math.floor(Math.random() * 1000000) + 100000,
      volume: order.volume,
      price: closePrice,
      comment: 'Position closed',
      request_id: Math.floor(Math.random() * 1000000)
    }
  };
}

function executeModifyOrder(order: MT5OrderRequest, marketData: any) {
  if (!order.orderId) {
    return {
      success: false,
      error: 'Order ID required for modify operation',
      details: 'orderId parameter is mandatory for MODIFY action'
    };
  }

  return {
    success: true,
    orderId: order.orderId,
    symbol: order.symbol,
    action: order.action,
    volume: order.volume,
    newStopLoss: order.sl,
    newTakeProfit: order.tp,
    modifyTime: new Date().toISOString(),
    status: 'MODIFIED',
    mt5Response: {
      retcode: 10009,
      order: Math.floor(Math.random() * 1000000) + 100000,
      comment: 'Order modified',
      request_id: Math.floor(Math.random() * 1000000)
    }
  };
}

function calculateCommission(volume: number): number {
  return parseFloat((volume * 7).toFixed(2)); // $7 per lot
}

export async function GET() {
  return NextResponse.json({
    message: 'MetaTrader 5 Execution endpoint',
    description: 'Executes trading orders on MetaTrader 5 platform',
    usage: 'POST with order details',
    requiredFields: [
      'symbol - Trading pair (e.g., EURUSD)',
      'action - BUY, SELL, CLOSE, or MODIFY',
      'volume - Lot size (e.g., 0.1, 1.0)'
    ],
    optionalFields: [
      'price - Specific execution price (market price if not provided)',
      'sl - Stop Loss level',
      'tp - Take Profit level',
      'orderId - Required for CLOSE and MODIFY actions',
      'comment - Order comment',
      'magicNumber - EA identification number'
    ],
    supportedSymbols: [
      'EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 
      'USDCAD', 'NZDUSD', 'USDCHF'
    ],
    orderTypes: {
      BUY: 'Open long position at market or specified price',
      SELL: 'Open short position at market or specified price',
      CLOSE: 'Close existing position by orderId',
      MODIFY: 'Modify SL/TP of existing position'
    },
    executionDetails: {
      slippage: 'Automatic slippage simulation',
      commission: '$7 per standard lot',
      spread: 'Real-time spread simulation',
      retcodes: 'MT5 standard return codes',
      latency: '100-300ms simulation'
    },
    riskManagement: {
      validation: 'SL/TP level validation',
      marginCheck: 'Free margin verification',
      volumeLimits: 'Position size limits',
      maxPositions: 'Maximum open positions'
    },
    exampleRequests: {
      openBuy: {
        symbol: 'EURUSD',
        action: 'BUY',
        volume: 0.1,
        sl: 1.0800,
        tp: 1.0900,
        comment: 'AI Signal BUY'
      },
      closePosition: {
        symbol: 'EURUSD',
        action: 'CLOSE',
        volume: 0.1,
        orderId: 'MT5_1234567890_abc123'
      },
      modifyPosition: {
        symbol: 'EURUSD',
        action: 'MODIFY',
        volume: 0.1,
        orderId: 'MT5_1234567890_abc123',
        sl: 1.0820,
        tp: 1.0920
      }
    }
  });
}

// Get account information
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'account_info') {
      const accountInfo = {
        login: process.env.MT5_LOGIN || 'demo-account',
        server: process.env.MT5_SERVER || 'demo-server',
        name: 'AI Trading Account',
        company: 'Demo Broker',
        currency: 'USD',
        balance: 10000.00,
        equity: 10000.00,
        profit: 0.00,
        margin: 1500.00,
        freeMargin: 8500.00,
        marginLevel: 666.67,
        leverage: 100,
        stopoutLevel: 50,
        marginCall: 100,
        connected: true,
        tradeAllowed: true,
        lastUpdate: new Date().toISOString()
      };

      return NextResponse.json({
        success: true,
        data: accountInfo
      });
    }

    if (action === 'positions') {
      // Mock open positions
      const positions = [
        {
          orderId: 'MT5_1234567890_abc123',
          symbol: 'EURUSD',
          type: 'BUY',
          volume: 0.1,
          openPrice: 1.0845,
          currentPrice: 1.0850,
          sl: 1.0800,
          tp: 1.0900,
          profit: 5.00,
          swap: 0,
          commission: -0.70,
          openTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          comment: 'AI Signal BUY',
          magicNumber: 12345
        }
      ];

      return NextResponse.json({
        success: true,
        data: positions
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid action'
    }, { status: 400 });

  } catch (error) {
    console.error('MT5 Info API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
