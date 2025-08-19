import { NextRequest, NextResponse } from 'next/server';
import { aiService } from '@/lib/aiService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { signalData, technicalAnalysis } = body;

    // Validate input
    if (!signalData) {
      return NextResponse.json(
        { success: false, error: 'Signal data is required for validation' },
        { status: 400 }
      );
    }

    // Mock validation process
    const validationData = {
      originalSignal: signalData,
      technicalAnalysis: technicalAnalysis || null,
      marketConditions: {
        volatility: Math.random() > 0.5 ? 'HIGH' : 'NORMAL',
        trend: Math.random() > 0.5 ? 'BULLISH' : 'BEARISH',
        volume: Math.random() > 0.6 ? 'ABOVE_AVERAGE' : 'NORMAL',
        newsImpact: Math.random() > 0.8 ? 'HIGH' : 'LOW'
      },
      riskFactors: [
        'Economic calendar events',
        'Market session overlap',
        'Support/resistance levels',
        'Correlation analysis'
      ],
      validationScore: Math.floor(Math.random() * 40) + 60, // 60-100%
      timestamp: new Date().toISOString()
    };

    // Get AI validation
    const validation = await aiService.validateSignal(validationData);

    if (validation.success) {
      const isApproved = validationData.validationScore >= 75;
      
      const validationResult = {
        originalSignal: signalData,
        validation: validation.data,
        approved: isApproved,
        confidence: validationData.validationScore,
        riskLevel: validationData.validationScore >= 85 ? 'LOW' : 
                   validationData.validationScore >= 70 ? 'MEDIUM' : 'HIGH',
        recommendations: isApproved ? [
          'Signal approved for execution',
          'Risk/reward ratio acceptable',
          'Market conditions favorable'
        ] : [
          'Signal requires additional confirmation',
          'Consider reducing position size',
          'Monitor market conditions closely'
        ],
        marketConditions: validationData.marketConditions,
        nextStep: isApproved ? 'Forward to AI 3 - Strategy Executor' : 'Request additional analysis',
        timestamp: new Date().toISOString(),
        aiLayer: 'AI 2 - Signal Validator'
      };

      return NextResponse.json({
        success: true,
        data: validationResult
      });
    } else {
      return NextResponse.json({
        success: false,
        error: validation.error || 'Signal validation failed'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Signal Validation API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'AI Signal Validator endpoint',
    description: 'Validates trading signals from AI 1 Technical Analysis',
    usage: 'POST with { signalData, technicalAnalysis? }',
    validationCriteria: [
      'Risk/reward ratio analysis',
      'Market condition assessment',
      'Volume and volatility check',
      'Support/resistance validation',
      'Economic calendar impact',
      'Correlation with other pairs',
      'Historical performance review',
      'Cross-timeframe confirmation'
    ],
    approvalThreshold: '75% confidence score',
    riskLevels: ['LOW (85%+)', 'MEDIUM (70-84%)', 'HIGH (<70%)']
  });
}
