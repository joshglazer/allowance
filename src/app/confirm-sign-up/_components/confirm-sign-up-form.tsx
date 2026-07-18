'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { confirmSignUp, resendSignUpCode } from 'aws-amplify/auth';

import { Button } from '@/components/design/button';
import { Field, FieldError, FieldLabel } from '@/components/design/field';
import { Input } from '@/components/design/input';
import { StatusAlert } from '@/components/molecules/status-alert';
import { AuthCard } from '@/components/templates/auth-card';

const confirmSignUpSchema = z.object({
  email: z.string().trim().min(1, 'Email is required.'),
  code: z.string().trim().min(1, 'Confirmation code is required.'),
});

type ConfirmSignUpValues = z.infer<typeof confirmSignUpSchema>;

export function ConfirmSignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [info, setInfo] = useState<string | null>(null);
  const [resending, setResending] = useState(false);

  const form = useForm<ConfirmSignUpValues>({
    resolver: zodResolver(confirmSignUpSchema),
    defaultValues: { email: searchParams.get('email') ?? '', code: '' },
  });

  const email = useWatch({ control: form.control, name: 'email' });

  async function handleValid(values: ConfirmSignUpValues) {
    setInfo(null);
    try {
      const { nextStep } = await confirmSignUp({
        username: values.email,
        confirmationCode: values.code,
      });

      if (nextStep.signUpStep === 'DONE') {
        router.push('/sign-in');
      }
    } catch (err) {
      form.setError('root', {
        message: err instanceof Error ? err.message : 'Something went wrong.',
      });
    }
  }

  async function handleResend() {
    setInfo(null);
    form.clearErrors('root');
    setResending(true);
    try {
      await resendSignUpCode({ username: email });
      setInfo('A new code has been sent to your email.');
    } catch (err) {
      form.setError('root', {
        message: err instanceof Error ? err.message : 'Something went wrong.',
      });
    } finally {
      setResending(false);
    }
  }

  return (
    <AuthCard title="Confirm your email">
      <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(handleValid)}>
        <Field data-invalid={!!form.formState.errors.email}>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input id="email" type="email" autoComplete="email" {...form.register('email')} />
          <FieldError errors={form.formState.errors.email ? [form.formState.errors.email] : undefined} />
        </Field>
        <Field data-invalid={!!form.formState.errors.code}>
          <FieldLabel htmlFor="code">Confirmation code</FieldLabel>
          <Input
            id="code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            {...form.register('code')}
          />
          <FieldError errors={form.formState.errors.code ? [form.formState.errors.code] : undefined} />
        </Field>
        <StatusAlert variant="destructive" message={form.formState.errors.root?.message} />
        <StatusAlert message={info} />
        <Button type="submit" disabled={form.formState.isSubmitting} className="w-full">
          {form.formState.isSubmitting ? 'Confirming…' : 'Confirm account'}
        </Button>
        <Button type="button" variant="link" disabled={resending || !email} onClick={handleResend}>
          {resending ? 'Resending…' : 'Resend code'}
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
