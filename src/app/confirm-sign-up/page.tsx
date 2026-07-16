'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { confirmSignUp, resendSignUpCode } from 'aws-amplify/auth';
import {
  AuthCard,
  authButtonClass,
  authInputClass,
  authLinkClass,
} from '@/components/AuthCard';

function ConfirmSignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState(searchParams.get('email') ?? '');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setInfo(null);
    setSubmitting(true);
    try {
      const { nextStep } = await confirmSignUp({
        username: email,
        confirmationCode: code,
      });

      if (nextStep.signUpStep === 'DONE') {
        router.push('/sign-in');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResend() {
    setError(null);
    setInfo(null);
    setResending(true);
    try {
      await resendSignUpCode({ username: email });
      setInfo('A new code has been sent to your email.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setResending(false);
    }
  }

  return (
    <AuthCard title="Confirm your email">
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className={authInputClass}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="code" className="text-sm font-medium">
            Confirmation code
          </label>
          <input
            id="code"
            name="code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            required
            className={authInputClass}
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {info && <p className="text-sm text-green-600">{info}</p>}
        <button type="submit" disabled={submitting} className={authButtonClass}>
          {submitting ? 'Confirming…' : 'Confirm account'}
        </button>
        <button
          type="button"
          disabled={resending || !email}
          onClick={handleResend}
          className="text-sm underline underline-offset-4 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {resending ? 'Resending…' : 'Resend code'}
        </button>
      </form>
      <p className="mt-6 text-sm text-zinc-600 dark:text-zinc-400">
        <Link href="/sign-in" className={authLinkClass}>
          Back to sign in
        </Link>
      </p>
    </AuthCard>
  );
}

export default function ConfirmSignUpPage() {
  return (
    <Suspense>
      <ConfirmSignUpForm />
    </Suspense>
  );
}
