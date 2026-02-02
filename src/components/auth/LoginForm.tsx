'use client';

import { useQueryClient } from '@tanstack/react-query';
import { Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { authTokenStorage } from '@/services/api/axios';
import {
  authQueryKeys,
  fetchProfile,
  getApiErrorMessage,
  useLoginMutation,
} from '@/services/queries/auth';

type FieldErrors = Partial<Record<'email' | 'password', string>>;

type LoginFormProps = {
  email?: string;
  password?: string;
  rememberMe?: boolean;

  isLoading?: boolean;
  errors?: FieldErrors;

  onChangeEmail?: (value: string) => void;
  onChangePassword?: (value: string) => void;
  onChangeRememberMe?: (value: boolean) => void;

  onSubmit?: (payload: {
    email: string;
    password: string;
    rememberMe: boolean;
  }) => void;
};

const DEMO_FILL = {
  email: 'johndoe@email.com',
  password: 'johdoe123',
  rememberMe: true,
};

const LoginForm = ({
  email,
  password,
  rememberMe,
  isLoading,
  errors,
  onChangeEmail,
  onChangePassword,
  onChangeRememberMe,
  onSubmit,
}: LoginFormProps) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const loginMutation = useLoginMutation();

  // local state (fallback if parent doesn't control)
  const [localEmail, setLocalEmail] = useState(email ?? DEMO_FILL.email);
  const [localPassword, setLocalPassword] = useState(
    password ?? DEMO_FILL.password
  );
  const [localRemember, setLocalRemember] = useState(
    rememberMe ?? DEMO_FILL.rememberMe
  );

  const [showPassword, setShowPassword] = useState(false);

  // Local client-side field errors (used only if parent doesn't pass `errors`)
  const [localErrors, setLocalErrors] = useState<FieldErrors>({});

  // Server error is separated from client validation errors
  const [serverError, setServerError] = useState<string>('');

  const valueEmail = useMemo(
    () => (email !== undefined ? email : localEmail),
    [email, localEmail]
  );

  const valuePassword = useMemo(
    () => (password !== undefined ? password : localPassword),
    [password, localPassword]
  );

  const valueRemember = useMemo(
    () => (rememberMe !== undefined ? rememberMe : localRemember),
    [rememberMe, localRemember]
  );

  // Prioritize parent-provided errors to keep A2.4 behavior compatible
  const mergedErrors = errors ?? localErrors;
  const emailError = mergedErrors.email;
  const passwordError = mergedErrors.password;

  const validate = (): FieldErrors => {
    const next: FieldErrors = {};
    const e = valueEmail.trim();

    if (!e) next.email = 'Email must be filled in.';
    else if (!/^\S+@\S+\.\S+$/.test(e))
      next.email = 'Format email tidak valid.';

    if (!valuePassword) next.password = 'Password must be filled in.';
    else if (valuePassword.length < 6)
      next.password = 'Password minimal 6 karakter.';

    return next;
  };

  const runRealLogin = async (payload: {
    email: string;
    password: string;
    rememberMe: boolean;
  }) => {
    setServerError('');

    const res = await loginMutation.mutateAsync({
      email: payload.email,
      password: payload.password,
    });

    // Swagger token
    authTokenStorage.set(res.data.token, payload.rememberMe);

    // Prime/refetch profile so app knows user is logged in
    try {
      await queryClient.fetchQuery({
        queryKey: authQueryKeys.profile,
        queryFn: fetchProfile,
      });
    } catch {
      // Best effort. Login already success, don't block redirect.
    }

    router.replace('/');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation first
    const nextErrors = validate();
    const hasErrors = Boolean(nextErrors.email || nextErrors.password);

    if (hasErrors) {
      // Only set local errors if parent doesn't control them
      if (!errors) setLocalErrors(nextErrors);
      setServerError('');
      return;
    }

    const payload = {
      email: valueEmail,
      password: valuePassword,
      rememberMe: valueRemember,
    };

    // If parent wants to handle submit (compat), respect it.
    if (onSubmit) {
      onSubmit(payload);
      return;
    }

    try {
      await runRealLogin(payload);
    } catch (err) {
      setServerError(getApiErrorMessage(err));
    }
  };

  const loading = Boolean(isLoading) || loginMutation.isPending;

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

      {/* Tabs (UI only) */}
      <div className='rounded-full bg-muted p-1'>
        <div className='grid grid-cols-2 gap-1'>
          <button
            type='button'
            className='h-10 rounded-full bg-card text-sm font-medium text-foreground shadow-sm'
            aria-current='page'
          >
            Sign in
          </button>

          <button
            type='button'
            onClick={() => router.push('/auth/register')}
            className='h-10 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground'
          >
            Sign up
          </button>
        </div>
      </div>

      {/* Server error (distinct from validation errors) */}
      {serverError ? (
        <div className='rounded-xl border border-destructive/40 bg-destructive/5 px-4 py-3'>
          <p className='text-sm text-destructive'>{serverError}</p>
        </div>
      ) : null}

      {/* Form */}
      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
        {/* Email */}
        <div className='space-y-2'>
          <Input
            type='email'
            value={valueEmail}
            onChange={(e) => {
              const v = e.target.value;
              setLocalEmail(v);
              onChangeEmail?.(v);

              // when user edits, clear server error and local field error
              setServerError('');
              if (!errors) {
                setLocalErrors((prev) => ({ ...prev, email: undefined }));
              }
            }}
            placeholder='Email'
            aria-invalid={Boolean(emailError)}
            className={[
              'h-12 rounded-xl bg-card',
              emailError
                ? 'border-destructive focus-visible:ring-destructive'
                : '',
            ].join(' ')}
          />
          {emailError ? (
            <p className='text-xs text-destructive'>{emailError}</p>
          ) : null}
        </div>

        {/* Password */}
        <div className='space-y-2'>
          <div className='relative'>
            <Input
              type={showPassword ? 'text' : 'password'}
              value={valuePassword}
              onChange={(e) => {
                const v = e.target.value;
                setLocalPassword(v);
                onChangePassword?.(v);

                setServerError('');
                if (!errors) {
                  setLocalErrors((prev) => ({ ...prev, password: undefined }));
                }
              }}
              placeholder='Password'
              aria-invalid={Boolean(passwordError)}
              className={[
                'h-12 rounded-xl bg-card pr-12',
                passwordError
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

          {passwordError ? (
            <p className='text-xs text-destructive'>{passwordError}</p>
          ) : null}
        </div>

        {/* Remember Me */}
        <label className='flex cursor-pointer items-center gap-2 text-sm text-muted-foreground'>
          <Checkbox
            checked={valueRemember}
            onCheckedChange={(v) => {
              const next = Boolean(v);
              setLocalRemember(next);
              onChangeRememberMe?.(next);
            }}
            className='h-4 w-4 rounded-sm data-[state=checked]:bg-primary data-[state=checked]:border-primary'
          />
          Remember Me
        </label>

        {/* Submit */}
        <Button
          type='submit'
          disabled={loading}
          className='h-12 w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90'
        >
          {loading ? 'Logging in...' : 'Login'}
        </Button>
      </form>
    </section>
  );
};

export default LoginForm;
