'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { signIn } from 'aws-amplify/auth';

import { Button } from '@/components/design/button';
import { Field, FieldError, FieldLabel } from '@/components/design/field';
import { Input } from '@/components/design/input';
import { StatusAlert } from '@/components/molecules/status-alert';
import { AuthCard } from '@/components/templates/auth-card';

const signInSchema = z.object({
  email: z.string().trim().min(1, 'Email is required.'),
  password: z.string().min(1, 'Password is required.'),
});

type SignInValues = z.infer<typeof signInSchema>;

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') ?? '/';

  const form = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
  });

  async function handleValid(values: SignInValues) {
    try {
      const { nextStep } = await signIn({ username: values.email, password: values.password });

      if (nextStep.signInStep === 'DONE') {
        router.push(redirectTo);
        router.refresh();
      } else if (nextStep.signInStep === 'CONFIRM_SIGN_UP') {
        router.push(`/confirm-sign-up?email=${encodeURIComponent(values.email)}`);
      } else {
        form.setError('root', {
          message: 'Additional verification is required for this account.',
        });
      }
    } catch (err) {
      form.setError('root', {
        message: err instanceof Error ? err.message : 'Something went wrong.',
      });
    }
  }

  return (
    <AuthCard title="Sign in">
      <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(handleValid)}>
        <Field data-invalid={!!form.formState.errors.email}>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input id="email" type="email" autoComplete="email" {...form.register('email')} />
          <FieldError errors={form.formState.errors.email ? [form.formState.errors.email] : undefined} />
        </Field>
        <Field data-invalid={!!form.formState.errors.password}>
          <div className="flex items-center justify-between">
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Link href="/forgot-password" className="text-xs underline underline-offset-4">
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            {...form.register('password')}
          />
          <FieldError
            errors={form.formState.errors.password ? [form.formState.errors.password] : undefined}
          />
        </Field>
        <StatusAlert variant="destructive" message={form.formState.errors.root?.message} />
        <Button type="submit" disabled={form.formState.isSubmitting} className="w-full">
          {form.formState.isSubmitting ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
      <p className="mt-6 text-sm text-muted-foreground">
        Don&apos;t have an account?{' '}
        <Link href="/sign-up" className="font-medium text-foreground underline underline-offset-4">
          Sign up
        </Link>
      </p>
    </AuthCard>
  );
}
