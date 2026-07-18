'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/design/button';
import { Field, FieldError, FieldLabel } from '@/components/design/field';
import { Input } from '@/components/design/input';
import { AvatarPicker } from '@/components/molecules/avatar-picker';
import { PinFields } from '@/components/molecules/pin-fields';
import { StatusAlert } from '@/components/molecules/status-alert';
import { DEFAULT_AVATAR } from '@/utils/avatars';
import { hashPin, isValidPin } from '@/utils/pin';

export type KidFormValues = {
  name: string;
  avatarKey: string;
  pinHash?: string;
};

function buildKidSchema(requirePin: boolean) {
  return z
    .object({
      name: z.string().trim().min(1, 'Name is required.'),
      avatarKey: z.string(),
      pin: z.string(),
      confirmPin: z.string(),
    })
    .superRefine((values, ctx) => {
      const settingPin = requirePin || values.pin.length > 0 || values.confirmPin.length > 0;
      if (!settingPin) return;
      if (!isValidPin(values.pin)) {
        ctx.addIssue({ code: 'custom', path: ['pin'], message: 'PIN must be 4-6 digits.' });
      }
      if (values.pin !== values.confirmPin) {
        ctx.addIssue({ code: 'custom', path: ['confirmPin'], message: 'PINs do not match.' });
      }
    });
}

export function KidForm({
  idPrefix,
  initialName = '',
  initialAvatarKey = DEFAULT_AVATAR,
  requirePin,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  idPrefix: string;
  initialName?: string;
  initialAvatarKey?: string;
  requirePin: boolean;
  submitLabel: string;
  onSubmit: (values: KidFormValues) => Promise<void>;
  onCancel?: () => void;
}) {
  const schema = buildKidSchema(requirePin);
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initialName,
      avatarKey: initialAvatarKey,
      pin: '',
      confirmPin: '',
    },
  });

  async function handleValid(values: z.infer<typeof schema>) {
    try {
      await onSubmit({
        name: values.name,
        avatarKey: values.avatarKey,
        pinHash: values.pin ? await hashPin(values.pin) : undefined,
      });
    } catch (err) {
      form.setError('root', {
        message: err instanceof Error ? err.message : 'Something went wrong.',
      });
    }
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(handleValid)}>
      <Field data-invalid={!!form.formState.errors.name}>
        <FieldLabel htmlFor={`${idPrefix}-name`}>Name</FieldLabel>
        <Input id={`${idPrefix}-name`} {...form.register('name')} />
        <FieldError errors={form.formState.errors.name ? [form.formState.errors.name] : undefined} />
      </Field>

      <Field>
        <FieldLabel>Avatar</FieldLabel>
        <Controller
          control={form.control}
          name="avatarKey"
          render={({ field }) => <AvatarPicker value={field.value} onChange={field.onChange} />}
        />
      </Field>

      <PinFields
        idPrefix={idPrefix}
        pinLabel={requirePin ? 'PIN' : 'New PIN (optional)'}
        required={requirePin}
        pinRegister={form.register('pin')}
        confirmPinRegister={form.register('confirmPin')}
        pinError={form.formState.errors.pin}
        confirmPinError={form.formState.errors.confirmPin}
      />

      <StatusAlert variant="destructive" message={form.formState.errors.root?.message} />

      <div className="flex gap-3">
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Saving…' : submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
