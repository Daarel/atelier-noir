'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeClosed, GalleryVerticalEndIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useSocialAuth } from '@/hooks/useSocialAuth';
import { useToggle } from '@/hooks/useToggle';
import { type loginFormValues, loginSchema } from '@/schemas/authSchemas';
import { signIn } from '@/services/auth-client';
import { cn } from '@/utils/cn';

export function LoginForm({ className, ...props }: React.ComponentProps<'div'>) {
  const [showPassword, togglePassword] = useToggle(false);
  const navigate = useNavigate();
  const { isLoading, loginWithGoogle } = useSocialAuth();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<loginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: loginFormValues) => {
    await signIn.email(
      { email: values.email, password: values.password },
      {
        onSuccess: () => {
          toast.success('berhasil masuk');
          navigate('/');
        },
        onError: (ctx) => {
          const message = ctx.error.message || 'Email atau password salah';

          setError('root', { message });

          toast.error(message);
        },
      },
    );
  };

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <Link to="#" className="flex flex-col items-center gap-2 font-medium">
              <div className="flex size-8 items-center justify-center rounded-md">
                <GalleryVerticalEndIcon className="size-6" />
              </div>
              <span className="sr-only">Acme Inc.</span>
            </Link>
            <h1 className="text-xl font-bold">Welcome to Acme Inc.</h1>
            {errors.root && (
              <div className="bg-destructive/10 text-destructive rounded-md p-3 text-center text-sm">
                {errors.root.message}
              </div>
            )}
            <FieldDescription>
              Don&apos;t have an account? <Link to="/signup">Sign up</Link>
            </FieldDescription>
          </div>
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input id="email" type="email" placeholder="m@example.com" {...register('email')} />
            {errors.email && <p className="text-destructive text-xs">{errors.email.message}</p>}
          </Field>
          <Field>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Your password"
                className="pr-10"
                {...register('password')}
              />
              <Button
                onClick={togglePassword}
                className="absolute top-0 right-2"
                size="icon"
                variant="ghost"
                type="button"
              >
                {showPassword ? <Eye size="4" /> : <EyeClosed size="4" />}
              </Button>
            </div>
            {errors.password && (
              <p className="text-destructive text-xs">{errors.password.message}</p>
            )}
          </Field>
          <Field>
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? 'Logging in...' : 'login'}
            </Button>
          </Field>
          <FieldSeparator>Or</FieldSeparator>
          <Field>
            <Button
              variant="outline"
              type="button"
              onClick={() => loginWithGoogle('/')}
              disabled={isLoading}
            >
              {!isLoading && (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <path
                    d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                    fill="currentColor"
                  />
                </svg>
              )}
              {isLoading ? 'Sign in...' : 'Continue with Google'}
            </Button>
          </Field>
          <FieldDescription className="text-center">
            Forgot your password?&nbsp;
            <Link to="/reset-password" className="underline">
              Let&apos;s reset it
            </Link>
          </FieldDescription>
        </FieldGroup>
      </form>
    </div>
  );
}
