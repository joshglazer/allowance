'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { confirmResetPassword, resetPassword } from 'aws-amplify/auth';
import {
  AuthCard,
  authButtonClass,
  authInputClass,
  authLinkClass,
} from '@/components/AuthCard';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<'request' | 'confirm'>('request');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleRequestCode(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await resetPassword({ username: email });
      setStep('confirm');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleConfirmReset(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (newPassword !== confirmNewPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      await confirmResetPassword({
        username: email,
        confirmationCode: code,
        newPassword,
      });
      router.push('/sign-in');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  }

  if (step === 'request') {
    return (
      <AuthCard title="Reset your password">
        <form className="flex flex-col gap-4" onSubmit={handleRequestCode}>
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
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={submitting} className={authButtonClass}>
            {submitting ? 'Sending code…' : 'Send reset code'}
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

  return (
    <AuthCard title="Enter your new password">
      <form className="flex flex-col gap-4" onSubmit={handleConfirmReset}>
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
        <div className="flex flex-col gap-1.5">
          <label htmlFor="newPassword" className="text-sm font-medium">
            New password
          </label>
          <input
            id="newPassword"
            name="newPassword"
            type="password"
            autoComplete="new-password"
            required
            className={authInputClass}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="confirmNewPassword" className="text-sm font-medium">
            Confirm new password
          </label>
          <input
            id="confirmNewPassword"
            name="confirmNewPassword"
            type="password"
            autoComplete="new-password"
            required
            className={authInputClass}
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={submitting} className={authButtonClass}>
          {submitting ? 'Resetting…' : 'Reset password'}
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
