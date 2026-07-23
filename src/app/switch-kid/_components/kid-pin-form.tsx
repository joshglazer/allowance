'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/design/button';
import { Field, FieldError, FieldLabel } from '@/components/design/field';
import { Input } from '@/components/design/input';
import { StatusAlert } from '@/components/molecules/status-alert';
import type { KidSummary } from '@/utils/kid';
import { isValidPin } from '@/utils/pin';
import { verifyKidPin } from '../actions';

const pinSchema = z.object({
  pin: z.string().refine(isValidPin, 'Enter your 4-6 digit PIN.'),
});

type PinValues = z.infer<typeof pinSchema>;

export function KidPinForm({ kid, onCancel }: { kid: KidSummary; onCancel: () => void }) {
  const form = useForm<PinValues>({
    resolver: zodResolver(pinSchema),
    defaultValues: { pin: '' },
  });

  async function handleValid(values: PinValues) {
    const result = await verifyKidPin(kid.id, values.pin);
    if (result?.error) {
      form.setError('root', { message: result.error });
    }
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(handleValid)}>
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-md border border-input text-2xl">
          {kid.avatarKey}
        </span>
        <span className="text-lg font-medium">{kid.name}</span>
      </div>

      <Field data-invalid={!!form.formState.errors.pin}>
        <FieldLabel htmlFor="kid-pin">Enter your PIN</FieldLabel>
        <Input
          id="kid-pin"
          type="password"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="off"
          autoFocus
          {...form.register('pin')}
        />
        <FieldError errors={form.formState.errors.pin ? [form.formState.errors.pin] : undefined} />
      </Field>

      <StatusAlert variant="destructive" message={form.formState.errors.root?.message} />

      <div className="flex gap-3">
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Checking…' : 'Go'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Not you?
        </Button>
      </div>
    </form>
  );
}
