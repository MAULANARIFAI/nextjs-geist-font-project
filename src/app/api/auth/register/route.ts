import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, phone } = body;

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Nama, email, dan password wajib diisi' },
        { status: 400 }
      );
    }

    // Attempt registration
    const result = await authService.register(name, email, password, phone);

    if (result.success) {
      // Send OTP (mock implementation)
      await authService.sendOTP(email);
      
      return NextResponse.json(result, { status: 201 });
    } else {
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error) {
    console.error('Register API error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { message: 'Register endpoint. Use POST method.' },
    { status: 405 }
  );
}
