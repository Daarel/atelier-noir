'use client';

import {
  ArrowRightIcon,
  CheckCircle2Icon,
  EyeIcon,
  EyeOffIcon,
  KeyIcon,
  LockIcon,
  MailIcon,
  ShieldIcon,
} from 'lucide-react';
import * as React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useToggle } from '@/hooks/use-toggle';
import { authClient } from '@/services/auth-client';

export default function TokenReset() {
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get('token');

  const [step, setStep] = React.useState<'email' | 'token' | 'password' | 'complete'>(() =>
    tokenFromUrl ? 'password' : 'email',
  );

  const [showPassword, toggleShowPassword] = useToggle();

  const [email, setEmail] = React.useState('');
  const [token, setToken] = React.useState(() => tokenFromUrl || '');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSendResetEmail = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email) return toast.error('Masukkan email kamu');

    setIsLoading(true);
    const { error } = await authClient.requestPasswordReset({
      email,
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setIsLoading(false);

    if (error) {
      toast.error(error.message || 'Gagal mengirim email reset password');
      return;
    }

    toast.success('Instruksi reset password telah dikirim ke email kamu!');
    setStep('token');
  };

  const handleVerifyToken = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!token.trim()) return toast.error('Masukkan kode token dari email');
    setStep('password');
  };

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      return toast.error('Password minimal 8 karakter');
    }
    if (newPassword !== confirmPassword) {
      return toast.error('Password konfirmasi tidak cocok');
    }

    setIsLoading(true);
    const { error } = await authClient.resetPassword({
      newPassword,
      token,
    });
    setIsLoading(false);
    if (error) {
      toast.error(error.message || 'Gagal mereset password');
      return;
    }
    toast.success('Password berhasil diperbarui!');
    setStep('complete');
  };

  return (
    <div className="container mx-auto px-4 py-12 md:px-6 md:py-16">
      <Card className="mx-auto max-w-md">
        <CardHeader className="space-y-1">
          {step === 'email' && (
            <>
              <div className="bg-primary/10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
                <MailIcon className="text-primary h-6 w-6" />
              </div>
              <CardTitle className="text-center text-2xl">Reset Password</CardTitle>
              <CardDescription className="text-center">
                Masukkan email kamu untuk menerima kode verifikasi
              </CardDescription>
            </>
          )}

          {step === 'token' && (
            <>
              <div className="bg-primary/10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
                <KeyIcon className="text-primary h-6 w-6" />
              </div>
              <CardTitle className="text-center text-2xl">Verify Reset Code</CardTitle>
              <CardDescription className="text-center">
                Masukkan kode verifikasi token dari email kamu
              </CardDescription>
            </>
          )}

          {step === 'password' && (
            <>
              <div className="bg-primary/10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
                <LockIcon className="text-primary h-6 w-6" />
              </div>
              <CardTitle className="text-center text-2xl">Create New Password</CardTitle>
              <CardDescription className="text-center">
                Buat password baru yang aman untuk akun kamu
              </CardDescription>
            </>
          )}

          {step === 'complete' && (
            <>
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                <CheckCircle2Icon className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-center text-2xl">Password Updated</CardTitle>
              <CardDescription className="text-center">
                Password akun kamu telah berhasil diperbarui
              </CardDescription>
            </>
          )}
        </CardHeader>

        <CardContent>
          {/* Step indicators */}
          <div className="mb-6 flex items-center justify-center">
            <div className="flex w-2/3 items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${
                  step !== 'email'
                    ? 'bg-primary text-primary-foreground'
                    : 'border-primary text-primary border-2 font-bold'
                }`}
              >
                1
              </div>
              <div className={`h-1 flex-1 ${step !== 'email' ? 'bg-primary' : 'bg-muted'}`}></div>
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${
                  step === 'password' || step === 'complete'
                    ? 'bg-primary text-primary-foreground'
                    : step === 'token'
                      ? 'border-primary text-primary border-2 font-bold'
                      : 'border-input bg-background border'
                }`}
              >
                2
              </div>
              <div
                className={`h-1 flex-1 ${
                  step === 'password' || step === 'complete' ? 'bg-primary' : 'bg-muted'
                }`}
              ></div>
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${
                  step === 'complete'
                    ? 'bg-primary text-primary-foreground'
                    : step === 'password'
                      ? 'border-primary text-primary border-2 font-bold'
                      : 'border-input bg-background border'
                }`}
              >
                3
              </div>
            </div>
          </div>

          {step === 'email' && (
            <form onSubmit={handleSendResetEmail} className="space-y-4">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="email">Email Address</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <FieldDescription>
                    Kami akan mengirimkan link dan kode verifikasi ke email ini
                  </FieldDescription>
                </Field>
              </FieldGroup>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? 'Mengirim...' : 'Kirim Kode Reset'}{' '}
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </Button>
            </form>
          )}

          {step === 'token' && (
            <form onSubmit={handleVerifyToken} className="space-y-4">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="token">Reset Code</FieldLabel>
                  <Input
                    id="token"
                    placeholder="Masukkan kode token"
                    className="text-center font-mono text-lg tracking-widest"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    required
                  />
                  <FieldDescription className="text-center">
                    Cek email kamu untuk kode verifikasi yang telah kami kirimkan
                  </FieldDescription>
                </Field>
              </FieldGroup>
              <Button type="submit" className="w-full">
                Verifikasi Kode <ArrowRightIcon className="ml-2 h-4 w-4" />
              </Button>
            </form>
          )}

          {step === 'password' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <Alert className="mb-4 bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                <ShieldIcon className="h-4 w-4" />
                <AlertDescription>
                  Identitas terverifikasi. Sekarang buat password baru yang aman.
                </AlertDescription>
              </Alert>

              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="password">Password Baru</FieldLabel>
                  <div className="relative">
                    <Input
                      id="password"
                      placeholder="••••••••"
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent dark:hover:bg-transparent"
                      onClick={toggleShowPassword}
                    >
                      {showPassword ? (
                        <EyeOffIcon className="h-4 w-4" />
                      ) : (
                        <EyeIcon className="h-4 w-4" />
                      )}
                      <span className="sr-only">Toggle password visibility</span>
                    </Button>
                  </div>
                  <FieldDescription>Minimal 8 karakter</FieldDescription>
                </Field>

                <Field>
                  <FieldLabel htmlFor="confirmPassword">Konfirmasi Password Baru</FieldLabel>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      placeholder="••••••••"
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent dark:hover:bg-transparent"
                      onClick={toggleShowPassword}
                    >
                      {showPassword ? (
                        <EyeOffIcon className="h-4 w-4" />
                      ) : (
                        <EyeIcon className="h-4 w-4" />
                      )}
                      <span className="sr-only">Toggle confirm password visibility</span>
                    </Button>
                  </div>
                </Field>
              </FieldGroup>

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? 'Menyimpan...' : 'Simpan Password Baru'}
              </Button>
            </form>
          )}

          {step === 'complete' && (
            <div className="space-y-4 text-center">
              <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/30">
                <p className="text-green-800 dark:text-green-300">
                  Password kamu telah berhasil diperbarui. Akun kamu sekarang sudah aman.
                </p>
              </div>
              <Button className="w-full" render={<Link to="/login" />} nativeButton={false}>
                Masuk dengan Password Baru
              </Button>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-center">
          {step !== 'complete' && (
            <p className="text-muted-foreground text-sm">
              Ingat password kamu?{' '}
              <Link to="/login" className="text-primary underline">
                Masuk
              </Link>
            </p>
          )}

          {step === 'complete' && (
            <p className="text-muted-foreground text-sm">
              Butuh bantuan?{' '}
              <Link to="#" className="text-primary underline">
                Hubungi support
              </Link>
            </p>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
