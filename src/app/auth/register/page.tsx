"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { validateEmail, validatePhone, validatePassword } from "@/lib/utils";
import { setLocalStorage } from "@/lib/utils";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [otpCode, setOtpCode] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name || formData.name.length < 2) {
      newErrors.name = "Nama harus minimal 2 karakter";
    }

    if (!formData.email) {
      newErrors.email = "Email wajib diisi";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Format email tidak valid";
    }

    if (formData.phone && !validatePhone(formData.phone)) {
      newErrors.phone = "Format nomor telepon tidak valid (contoh: +6281234567890)";
    }

    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      newErrors.password = passwordValidation.message;
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Konfirmasi password tidak cocok";
    }

    if (!agreeTerms) {
      newErrors.terms = "Anda harus menyetujui syarat dan ketentuan";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: data.message });
        
        // Show OTP verification (mock)
        setShowOTP(true);
        
        // Store user data and token
        setLocalStorage('user', data.user);
        setLocalStorage('token', data.token);
        
      } else {
        setMessage({ type: 'error', text: data.error });
      }
    } catch (error) {
      console.error('Register error:', error);
      setMessage({ type: 'error', text: 'Terjadi kesalahan sistem. Silakan coba lagi.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otpCode || otpCode.length !== 6) {
      setMessage({ type: 'error', text: 'Kode OTP harus 6 digit' });
      return;
    }

    setIsLoading(true);

    try {
      // Mock OTP verification
      if (otpCode === '123456') {
        setMessage({ type: 'success', text: 'Email berhasil diverifikasi! Mengarahkan ke dashboard...' });
        
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      } else {
        setMessage({ type: 'error', text: 'Kode OTP salah. Gunakan: 123456' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Terjadi kesalahan verifikasi' });
    } finally {
      setIsLoading(false);
    }
  };

  const resendOTP = async () => {
    setMessage({ type: 'success', text: 'Kode OTP baru telah dikirim ke email Anda' });
  };

  if (showOTP) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">MR</span>
              </div>
              <span className="text-xl font-bold text-white">Maulana Rifai Trending 01</span>
            </Link>
            <h1 className="text-3xl font-bold text-white mb-2">Verifikasi Email</h1>
            <p className="text-gray-400">Masukkan kode OTP yang dikirim ke email Anda</p>
          </div>

          <Card className="bg-black/50 border-gray-800 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Kode Verifikasi</CardTitle>
              <CardDescription className="text-gray-400">
                Kode OTP telah dikirim ke {formData.email}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleOTPVerification} className="space-y-4">
                {message && (
                  <Alert className={message.type === 'error' ? 'border-red-500 bg-red-500/10' : 'border-green-500 bg-green-500/10'}>
                    <AlertDescription className={message.type === 'error' ? 'text-red-400' : 'text-green-400'}>
                      {message.text}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="otp" className="text-white">Kode OTP (6 digit)</Label>
                  <Input
                    id="otp"
                    name="otp"
                    type="text"
                    placeholder="123456"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="bg-gray-900 border-gray-700 text-white placeholder-gray-500 text-center text-2xl tracking-widest"
                    maxLength={6}
                    disabled={isLoading}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Memverifikasi..." : "Verifikasi"}
                </Button>

                <div className="text-center">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={resendOTP}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    Kirim Ulang Kode OTP
                  </Button>
                </div>
              </form>

              <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-xs text-gray-300">Demo: Gunakan kode OTP <strong className="text-blue-400">123456</strong></p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">MR</span>
            </div>
            <span className="text-xl font-bold text-white">Maulana Rifai Trending 01</span>
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Buat Akun Baru</h1>
          <p className="text-gray-400">Bergabung dengan platform trading AI terdepan</p>
        </div>

        <Card className="bg-black/50 border-gray-800 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Registrasi</CardTitle>
            <CardDescription className="text-gray-400">
              Isi data diri untuk membuat akun trading
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {message && (
                <Alert className={message.type === 'error' ? 'border-red-500 bg-red-500/10' : 'border-green-500 bg-green-500/10'}>
                  <AlertDescription className={message.type === 'error' ? 'text-red-400' : 'text-green-400'}>
                    {message.text}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="name" className="text-white">Nama Lengkap *</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Masukkan nama lengkap"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="bg-gray-900 border-gray-700 text-white placeholder-gray-500"
                  disabled={isLoading}
                />
                {errors.name && (
                  <p className="text-sm text-red-400">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="nama@email.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="bg-gray-900 border-gray-700 text-white placeholder-gray-500"
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="text-sm text-red-400">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-white">Nomor Telepon</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+6281234567890"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="bg-gray-900 border-gray-700 text-white placeholder-gray-500"
                  disabled={isLoading}
                />
                {errors.phone && (
                  <p className="text-sm text-red-400">{errors.phone}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">Password *</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Minimal 6 karakter"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="bg-gray-900 border-gray-700 text-white placeholder-gray-500"
                  disabled={isLoading}
                />
                {errors.password && (
                  <p className="text-sm text-red-400">{errors.password}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-white">Konfirmasi Password *</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Ulangi password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="bg-gray-900 border-gray-700 text-white placeholder-gray-500"
                  disabled={isLoading}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-red-400">{errors.confirmPassword}</p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  checked={agreeTerms}
                  onCheckedChange={(checked) => setAgreeTerms(checked as boolean)}
                />
                <Label htmlFor="terms" className="text-sm text-gray-300">
                  Saya menyetujui{" "}
                  <Link href="/terms" className="text-blue-400 hover:text-blue-300">
                    syarat dan ketentuan
                  </Link>{" "}
                  serta{" "}
                  <Link href="/privacy" className="text-blue-400 hover:text-blue-300">
                    kebijakan privasi
                  </Link>
                </Label>
              </div>
              {errors.terms && (
                <p className="text-sm text-red-400">{errors.terms}</p>
              )}

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? "Memproses..." : "Daftar Sekarang"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-400">
                Sudah punya akun?{" "}
                <Link href="/auth/login" className="text-blue-400 hover:text-blue-300 font-medium">
                  Masuk di sini
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link href="/" className="text-gray-400 hover:text-white transition-colors">
            ← Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
