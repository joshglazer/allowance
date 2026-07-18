'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { confirmResetPassword, resetPassword } from 'aws-amplify/auth';

import { Button } from '@/components/design/button';
import { Field, FieldError, FieldLabel } from '@/components/design/field';
import { Input } from '@/components/design/input';
import { PasswordFields } from '@/components/molecules/password-fields';
import { StatusAlert } from '@/components/molecules/status-alert';
import { AuthCard } from '@/components/templates/auth-card';

const requestCodeSchema = z.object({
  email: z.string().trim().min(1, 'Email is required.'),
});

type RequestCodeValues = z.infer<typeof requestCodeSchema>;

const confirmResetSchema = z
  .object({
    code: z.string().trim().min(1, 'Confirmation code is required.'),
    newPassword: z.string().min(1, 'New password is required.'),
    confirmNewPassword: z.string().min(1, 'Confirm your new password.'),
  })
  .superRefine((values, ctx) => {
    if (values.newPassword !== values.confirmNewPassword) {
      ctx.addIssue({
        code: 'custom',
        path: ['confirmNewPassword'],
        message: 'Passwords do not match.',
      });
    }
  });

type ConfirmResetValues = z.infer<typeof confirmResetSchema>;

export function ForgotPasswordForm() {
  const router = useRouter();
  const [step, setStep] = useState<'request' | 'confirm'>('request');
  const [email, setEmail] = useState('');

  const requestForm = useForm<RequestCodeValues>({
    resolver: zodResolver(requestCodeSchema),
    defaultValues: { email: '' },
  });

  const confirmForm = useForm<ConfirmResetValues>({
    resolver: zodResolver(confirmResetSchema),
    defaultValues: { code: '', newPassword: '', confirmNewPassword: '' },
  });

  async function handleRequestCode(values: RequestCodeValues) {
    try {
      await resetPassword({ username: values.email });
      setEmail(values.email);
      setStep('confirm');
    } catch (err) {
      requestForm.setError('root', {
        message: err instanceof Error ? err.message : 'Something went wrong.',
      });
    }
  }

  async function handleConfirmReset(values: ConfirmResetValues) {
    try {
      await confirmResetPassword({
        username: email,
        confirmationCode: values.code,
        newPassword: values.newPassword,
      });
      router.push('/sign-in');
    } catch (err) {
      confirmForm.setError('root', {
        message: err instanceof Error ? err.message : 'Something went wrong.',
      });
    }
  }

  if (step === 'request') {
    return (
      <AuthCard title="Reset your password">
        <form className="flex flex-col gap-4" onSubmit={requestForm.handleSubmit(handleRequestCode)}>
          <Field data-invalid={!!requestForm.formState.errors.email}>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input id="email" type="email" autoComplete="email" {...requestForm.register('email')} />
            <FieldError
              errors={
                requestForm.formState.errors.email ? [requestForm.formState.errors.email] : undefined
              }
            />
          </Field>
          <StatusAlert variant="destructive" message={requestForm.formState.errors.root?.message} />
          <Button type="submit" disabled={requestForm.formState.isSubmitting} className="w-full">
            {requestForm.formState.isSubmitting ? 'Sending code…' : 'Send reset code'}
          </Button>
        </form>
        <p className="mt-6 text-sm text-muted-foreground">
          <Link href="/sign-in" className="font-medium text-foreground underline underline-offset-4">
            Back to sign in
          </Link>
        </p>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Enter your new password">
      <form className="flex flex-col gap-4" onSubmit={confirmForm.handleSubmit(handleConfirmReset)}>
        <Field data-invalid={!!confirmForm.formState.errors.code}>
          <FieldLabel htmlFor="code">Confirmation code</FieldLabel>
          <Input
            id="code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            {...confirmForm.register('code')}
          />
          <FieldError
            errors={confirmForm.formState.errors.code ? [confirmForm.formState.errors.code] : undefined}
          />
        </Field>

        <PasswordFields
          idPrefix="reset"
          passwordLabel="New password"
          confirmLabel="Confirm new password"
          passwordRegister={confirmForm.register('newPassword')}
          confirmRegister={confirmForm.register('confirmNewPassword')}
          passwordError={confirmForm.formState.errors.newPassword}
          confirmError={confirmForm.formState.errors.confirmNewPassword}
        />

        <StatusAlert variant="destructive" message={confirmForm.formState.errors.root?.message} />
        <Button type="submit" disabled={confirmForm.formState.isSubmitting} className="w-full">
          {confirmForm.formState.isSubmitting ? 'Resetting…' : 'Reset password'}
        </Button>
      </form>
      <p className="mt-6 text-sm text-muted-foreground">
        <Link href="/sign-in" className="font-medium text-foreground underline underline-offset-4">
          Back to sign in
        </Link>
      </p>
    </AuthCard>
  );
}
