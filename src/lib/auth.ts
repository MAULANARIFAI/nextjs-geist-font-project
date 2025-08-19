import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  createdAt: Date;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
  error?: string;
}

// Mock user database - replace with real database later
const mockUsers: (User & { password: string })[] = [
  {
    id: '1',
    name: 'Demo User',
    email: 'demo@trading.com',
    phone: '+62812345678',
    password: '$2a$10$rOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQ', // password: demo123
    createdAt: new Date()
  }
];

export class AuthService {
  private jwtSecret: string;

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key';
  }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  generateToken(user: User): string {
    return jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        name: user.name 
      },
      this.jwtSecret,
      { expiresIn: '7d' }
    );
  }

  verifyToken(token: string): any {
    try {
      return jwt.verify(token, this.jwtSecret);
    } catch (error) {
      return null;
    }
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      // Find user by email
      const user = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (!user) {
        return {
          success: false,
          error: 'Email tidak ditemukan'
        };
      }

      // Verify password
      const isValidPassword = await this.comparePassword(password, user.password);
      
      if (!isValidPassword) {
        return {
          success: false,
          error: 'Password salah'
        };
      }

      // Generate token
      const userWithoutPassword = {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        createdAt: user.createdAt
      };

      const token = this.generateToken(userWithoutPassword);

      return {
        success: true,
        user: userWithoutPassword,
        token,
        message: 'Login berhasil'
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: 'Terjadi kesalahan sistem'
      };
    }
  }

  async register(name: string, email: string, password: string, phone?: string): Promise<AuthResponse> {
    try {
      // Check if user already exists
      const existingUser = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (existingUser) {
        return {
          success: false,
          error: 'Email sudah terdaftar'
        };
      }

      // Validate input
      if (!name || name.length < 2) {
        return {
          success: false,
          error: 'Nama harus minimal 2 karakter'
        };
      }

      if (!this.isValidEmail(email)) {
        return {
          success: false,
          error: 'Format email tidak valid'
        };
      }

      if (!password || password.length < 6) {
        return {
          success: false,
          error: 'Password harus minimal 6 karakter'
        };
      }

      // Hash password
      const hashedPassword = await this.hashPassword(password);

      // Create new user
      const newUser = {
        id: (mockUsers.length + 1).toString(),
        name,
        email: email.toLowerCase(),
        phone,
        password: hashedPassword,
        createdAt: new Date()
      };

      // Add to mock database
      mockUsers.push(newUser);

      // Return user without password
      const userWithoutPassword = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        createdAt: newUser.createdAt
      };

      const token = this.generateToken(userWithoutPassword);

      return {
        success: true,
        user: userWithoutPassword,
        token,
        message: 'Registrasi berhasil'
      };
    } catch (error) {
      console.error('Register error:', error);
      return {
        success: false,
        error: 'Terjadi kesalahan sistem'
      };
    }
  }

  async getUserFromToken(token: string): Promise<User | null> {
    try {
      const decoded = this.verifyToken(token);
      if (!decoded) return null;

      const user = mockUsers.find(u => u.id === decoded.userId);
      if (!user) return null;

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        createdAt: user.createdAt
      };
    } catch (error) {
      console.error('Get user from token error:', error);
      return null;
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Mock OTP functionality
  async sendOTP(email: string): Promise<{ success: boolean; message: string }> {
    // In real implementation, integrate with email service
    console.log(`Sending OTP to ${email}: 123456`);
    return {
      success: true,
      message: 'Kode OTP telah dikirim ke email Anda'
    };
  }

  async verifyOTP(email: string, otp: string): Promise<{ success: boolean; message: string }> {
    // Mock verification - in real implementation, check against stored OTP
    if (otp === '123456') {
      return {
        success: true,
        message: 'OTP berhasil diverifikasi'
      };
    }
    return {
      success: false,
      message: 'Kode OTP salah'
    };
  }
}

export const authService = new AuthService();
