'use client';

import { useQueryClient } from '@tanstack/react-query';
import { Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authTokenStorage } from '@/services/api/axios';
import {
  authQueryKeys,
  fetchProfile,
  getApiErrorMessage,
  useRegisterMutation,
} from '@/services/queries/auth';

type FieldErrors = Partial<
  Record<'name' | 'email' | 'phone' | 'password' | 'confirmPassword', string>
>;

const DEMO_FILL = {
  name: 'John Doe',
  email: 'johndoe@email.com',
  phone: '081234567890',
  password: 'johdoe123',
  confirmPassword: 'johdoe123',
};

const RegisterForm = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const registerMutation = useRegisterMutation();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [localErrors, setLocalErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<string>('');

  const mergedErrors = useMemo(() => localErrors, [localErrors]);

  const validate = (): FieldErrors => {
    const next: FieldErrors = {};

    const n = name.trim();
    const e = email.trim();
    const p = phone.trim();

    if (!n) next.name = 'Name must be filled in.';
    else if (n.length < 2) next.name = 'Name terlalu pendek.';

    if (!e) next.email = 'Email must be filled in.';
    else if (!/^\S+@\S+\.\S+$/.test(e))
      next.email = 'Format email tidak valid.';

    if (!p) next.phone = 'Phone number must be filled in.';
    else if (!/^\d+$/.test(p)) next.phone = 'Phone hanya boleh angka.';
    else if (p.length < 10) next.phone = 'Phone minimal 10 digit.';

    if (!password) next.password = 'Password must be filled in.';
    else if (password.length < 6)
      next.password = 'Password minimal 6 karakter.';

    if (!confirmPassword)
      next.confirmPassword = 'Confirm password wajib diisi.';
    else if (confirmPassword !== password)
      next.confirmPassword = 'Confirm password tidak sama.';

    return next;
  };

  const clearFieldError = (key: keyof FieldErrors) => {
    setLocalErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const runRegister = async () => {
    setServerError('');

    const res = await registerMutation.mutateAsync({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      password,
    });

    // Swagger returns token → auto-login MVP
    // No "remember me" in register design. We store persistently by default for MVP.
    authTokenStorage.set(res.data.token, true);

    try {
      await queryClient.fetchQuery({
        queryKey: authQueryKeys.profile,
        queryFn: fetchProfile,
      });
    } catch {
      // Best effort, do not block.
    }

    router.replace('/');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nextErrors = validate();
    const hasErrors = Boolean(
      nextErrors.name ||
      nextErrors.email ||
      nextErrors.phone ||
      nextErrors.password ||
      nextErrors.confirmPassword
    );

    if (hasErrors) {
      setLocalErrors(nextErrors);
      setServerError('');
      return;
    }

    try {
      await runRegister();
    } catch (err) {
      setServerError(getApiErrorMessage(err));
    }
  };

  const loading = registerMutation.isPending;

  return (
    <section className='flex flex-col gap-6'>
      {/* Header */}
      <header className='flex flex-col gap-3'>
        <div className='flex items-center gap-3'>
          <Image
            src='/assets/icons/logo.svg'
            alt='Foody logo'
            width={32}
            height={32}
            priority
          />
          <span className='text-xl font-semibold text-foreground'>Foody</span>
        </div>

        <div className='flex flex-col gap-1'>
          <h1 className='text-2xl font-semibold text-foreground'>
            Welcome Back
          </h1>
          <p className='text-sm text-muted-foreground'>
            Good to see you again! Let’s eat
          </p>
        </div>
      </header>

      {/* Tabs */}
      <div className='rounded-full bg-muted p-1'>
        <div className='grid grid-cols-2 gap-1'>
          <button
            type='button'
            onClick={() => router.push('/auth/login')}
            className='h-10 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground'
          >
            Sign in
          </button>

          <button
            type='button'
            className='h-10 rounded-full bg-card text-sm font-medium text-foreground shadow-sm'
            aria-current='page'
          >
            Sign up
          </button>
        </div>
      </div>

      {/* Server error */}
      {serverError ? (
        <div className='rounded-xl border border-destructive/40 bg-destructive/5 px-4 py-3'>
          <p className='text-sm text-destructive'>{serverError}</p>
        </div>
      ) : null}

      {/* Form */}
      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
        {/* Name */}
        <div className='space-y-2'>
          <Input
            value={name}
            onChange={(e) => {
              const v = e.target.value;
              setName(v);
              setServerError('');
              clearFieldError('name');
            }}
            placeholder='Name'
            aria-invalid={Boolean(mergedErrors.name)}
            className={[
              'h-12 rounded-xl bg-card',
              mergedErrors.name
                ? 'border-destructive focus-visible:ring-destructive'
                : '',
            ].join(' ')}
          />
          {mergedErrors.name ? (
            <p className='text-xs text-destructive'>{mergedErrors.name}</p>
          ) : null}
        </div>

        {/* Email */}
        <div className='space-y-2'>
          <Input
            type='email'
            value={email}
            onChange={(e) => {
              const v = e.target.value;
              setEmail(v);
              setServerError('');
              clearFieldError('email');
            }}
            placeholder='Email'
            aria-invalid={Boolean(mergedErrors.email)}
            className={[
              'h-12 rounded-xl bg-card',
              mergedErrors.email
                ? 'border-destructive focus-visible:ring-destructive'
                : '',
            ].join(' ')}
          />
          {mergedErrors.email ? (
            <p className='text-xs text-destructive'>{mergedErrors.email}</p>
          ) : null}
        </div>

        {/* Phone */}
        <div className='space-y-2'>
          <Input
            value={phone}
            onChange={(e) => {
              const v = e.target.value;
              setPhone(v);
              setServerError('');
              clearFieldError('phone');
            }}
            placeholder='Number Phone'
            inputMode='numeric'
            aria-invalid={Boolean(mergedErrors.phone)}
            className={[
              'h-12 rounded-xl bg-card',
              mergedErrors.phone
                ? 'border-destructive focus-visible:ring-destructive'
                : '',
            ].join(' ')}
          />
          {mergedErrors.phone ? (
            <p className='text-xs text-destructive'>{mergedErrors.phone}</p>
          ) : null}
        </div>

        {/* Password */}
        <div className='space-y-2'>
          <div className='relative'>
            <Input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                const v = e.target.value;
                setPassword(v);
                setServerError('');
                clearFieldError('password');
              }}
              placeholder='Password'
              aria-invalid={Boolean(mergedErrors.password)}
              className={[
                'h-12 rounded-xl bg-card pr-12',
                mergedErrors.password
                  ? 'border-destructive focus-visible:ring-destructive'
                  : '',
              ].join(' ')}
            />
            <button
              type='button'
              onClick={() => setShowPassword((s) => !s)}
              className='absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-2 text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring'
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff className='h-4 w-4' />
              ) : (
                <Eye className='h-4 w-4' />
              )}
            </button>
          </div>
          {mergedErrors.password ? (
            <p className='text-xs text-destructive'>{mergedErrors.password}</p>
          ) : null}
        </div>

        {/* Confirm Password */}
        <div className='space-y-2'>
          <div className='relative'>
            <Input
              type={showConfirm ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => {
                const v = e.target.value;
                setConfirmPassword(v);
                setServerError('');
                clearFieldError('confirmPassword');
              }}
              placeholder='Confirm Password'
              aria-invalid={Boolean(mergedErrors.confirmPassword)}
              className={[
                'h-12 rounded-xl bg-card pr-12',
                mergedErrors.confirmPassword
                  ? 'border-destructive focus-visible:ring-destructive'
                  : '',
              ].join(' ')}
            />
            <button
              type='button'
              onClick={() => setShowConfirm((s) => !s)}
              className='absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-2 text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring'
              aria-label={showConfirm ? 'Hide password' : 'Show password'}
            >
              {showConfirm ? (
                <EyeOff className='h-4 w-4' />
              ) : (
                <Eye className='h-4 w-4' />
              )}
            </button>
          </div>
          {mergedErrors.confirmPassword ? (
            <p className='text-xs text-destructive'>
              {mergedErrors.confirmPassword}
            </p>
          ) : null}
        </div>

        {/* (Optional) Demo fill for design testing */}
        <div className='flex items-center justify-between'>
          <button
            type='button'
            className='text-xs text-muted-foreground hover:text-foreground underline underline-offset-4'
            onClick={() => {
              setName(DEMO_FILL.name);
              setEmail(DEMO_FILL.email);
              setPhone(DEMO_FILL.phone);
              setPassword(DEMO_FILL.password);
              setConfirmPassword(DEMO_FILL.confirmPassword);
              setLocalErrors({});
              setServerError('');
            }}
          >
            Fill demo
          </button>
          <span className='text-xs text-muted-foreground'>
            {/* spacer for layout balance */}
          </span>
        </div>

        <Button
          type='submit'
          disabled={loading}
          className='h-12 w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90'
        >
          {loading ? 'Registering...' : 'Register'}
        </Button>
      </form>
    </section>
  );
};

export default RegisterForm;
