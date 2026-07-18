'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { signUp } from 'aws-amplify/auth';

import { Button } from '@/components/design/button';
import { Field, FieldError, FieldLabel } from '@/components/design/field';
import { Input } from '@/components/design/input';
import { PasswordFields } from '@/components/molecules/password-fields';
import { StatusAlert } from '@/components/molecules/status-alert';
import { AuthCard } from '@/components/templates/auth-card';

const signUpSchema = z
  .object({
    email: z.string().trim().min(1, 'Email is required.'),
    password: z.string().min(1, 'Password is required.'),
    confirmPassword: z.string().min(1, 'Confirm your password.'),
  })
  .superRefine((values, ctx) => {
    if (values.password !== values.confirmPassword) {
      ctx.addIssue({ code: 'custom', path: ['confirmPassword'], message: 'Passwords do not match.' });
    }
  });

type SignUpValues = z.infer<typeof signUpSchema>;

export function SignUpForm() {
  const router = useRouter();

  const form = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { email: '', password: '', confirmPassword: '' },
  });

  async function handleValid(values: SignUpValues) {
    try {
      const { nextStep } = await signUp({
        username: values.email,
        password: values.password,
        options: { userAttributes: { email: values.email } },
      });

      if (nextStep.signUpStep === 'CONFIRM_SIGN_UP') {
        router.push(`/confirm-sign-up?email=${encodeURIComponent(values.email)}`);
      } else {
        router.push('/sign-in');
      }
    } catch (err) {
      form.setError('root', {
        message: err instanceof Error ? err.message : 'Something went wrong.',
      });
    }
  }

  return (
    <AuthCard title="Create your account">
      <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(handleValid)}>
        <Field data-invalid={!!form.formState.errors.email}>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input id="email" type="email" autoComplete="email" {...form.register('email')} />
          <FieldError errors={form.formState.errors.email ? [form.formState.errors.email] : undefined} />
        </Field>

        <PasswordFields
          idPrefix="sign-up"
          passwordRegister={form.register('password')}
          confirmRegister={form.register('confirmPassword')}
          passwordError={form.formState.errors.password}
          confirmError={form.formState.errors.confirmPassword}
        />

        <StatusAlert variant="destructive" message={form.formState.errors.root?.message} />
        <Button type="submit" disabled={form.formState.isSubmitting} className="w-full">
          {form.formState.isSubmitting ? 'Creating account…' : 'Sign up'}
        </Button>
      </form>
      <p className="mt-6 text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/sign-in" className="font-medium text-foreground underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </AuthCard>
  );
}
