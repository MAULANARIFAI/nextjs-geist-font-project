import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, formatDistanceToNow } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// API Helper Functions
export async function apiCall(
  endpoint: string, 
  options: RequestInit = {}
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const response = await fetch(endpoint, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || `HTTP ${response.status}: ${response.statusText}`
      };
    }

    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('API Call Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error'
    };
  }
}

// Date Formatting Functions
export function formatDate(date: Date | string, formatStr: string = 'dd/MM/yyyy HH:mm'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, formatStr);
}

export function formatRelativeTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return formatDistanceToNow(dateObj, { addSuffix: true });
}

// Trading Utility Functions
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatPercentage(value: number, decimals: number = 2): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
}

export function calculateProfitLoss(entry: number, exit: number, isLong: boolean = true): number {
  if (isLong) {
    return ((exit - entry) / entry) * 100;
  } else {
    return ((entry - exit) / entry) * 100;
  }
}

export function calculatePips(entry: number, exit: number, pairType: 'major' | 'minor' | 'exotic' = 'major'): number {
  const pipValue = pairType === 'major' ? 0.0001 : 0.01;
  return Math.abs(exit - entry) / pipValue;
}

// Validation Functions
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePhone(phone: string): boolean {
  const phoneRegex = /^(\+62|62|0)[0-9]{9,13}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

export function validatePassword(password: string): { isValid: boolean; message: string } {
  if (password.length < 6) {
    return { isValid: false, message: 'Password harus minimal 6 karakter' };
  }
  if (!/(?=.*[a-z])/.test(password)) {
    return { isValid: false, message: 'Password harus mengandung huruf kecil' };
  }
  if (!/(?=.*[A-Z])/.test(password)) {
    return { isValid: false, message: 'Password harus mengandung huruf besar' };
  }
  if (!/(?=.*\d)/.test(password)) {
    return { isValid: false, message: 'Password harus mengandung angka' };
  }
  return { isValid: true, message: 'Password valid' };
}

// Local Storage Helpers
export function setLocalStorage(key: string, value: any): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

export function getLocalStorage(key: string): any {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return null;
  }
}

export function removeLocalStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing from localStorage:', error);
  }
}

// Error Logging
export function logError(error: any, context?: string): void {
  const errorInfo = {
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    context,
    timestamp: new Date().toISOString(),
    url: typeof window !== 'undefined' ? window.location.href : undefined,
  };
  
  console.error('Application Error:', errorInfo);
  
  // In production, send to error tracking service
  // Example: Sentry, LogRocket, etc.
}

// Retry Logic for API Calls
export async function retryApiCall<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }
  }
  
  throw lastError!;
}

// Generate Random ID
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

// Debounce Function
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Trading Signal Types
export interface TradingSignal {
  id: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  entry: number;
  stopLoss: number;
  takeProfit: number;
  confidence: number;
  timestamp: Date;
  status: 'PENDING' | 'ACTIVE' | 'CLOSED' | 'CANCELLED';
  pnl?: number;
}

// Mock Trading Data Generator
export function generateMockSignal(): TradingSignal {
  const symbols = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD'];
  const symbol = symbols[Math.floor(Math.random() * symbols.length)];
  const type = Math.random() > 0.5 ? 'BUY' : 'SELL';
  const entry = 1.0000 + (Math.random() * 0.5);
  const stopLoss = type === 'BUY' ? entry - 0.0050 : entry + 0.0050;
  const takeProfit = type === 'BUY' ? entry + 0.0100 : entry - 0.0100;
  
  return {
    id: generateId(),
    symbol,
    type,
    entry,
    stopLoss,
    takeProfit,
    confidence: Math.floor(Math.random() * 40) + 60, // 60-100%
    timestamp: new Date(),
    status: 'PENDING'
  };
}
