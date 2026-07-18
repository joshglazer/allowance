'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/design/button';
import { Checkbox } from '@/components/design/checkbox';
import { Field, FieldError, FieldLabel } from '@/components/design/field';
import { Input } from '@/components/design/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/design/select';
import { StatusAlert } from '@/components/molecules/status-alert';
import { centsToDollarsInput, dollarsInputToCents } from '@/utils/money';
import type { KidRecord } from '@/utils/kid';

export type ChoreFormValues = {
  name: string;
  description: string;
  valueCents: number;
  active: boolean;
  kidId: string;
};

const choreFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required.'),
  description: z.string(),
  value: z.string().transform((val, ctx) => {
    const cents = dollarsInputToCents(val);
    if (cents === null || cents <= 0) {
      ctx.addIssue({ code: 'custom', message: 'Enter a value greater than $0.' });
      return z.NEVER;
    }
    return cents;
  }),
  active: z.boolean(),
  kidId: z.string().min(1, 'Choose which kid this chore is for.'),
});

type ChoreFormInput = z.input<typeof choreFormSchema>;
type ChoreFormOutput = z.output<typeof choreFormSchema>;

export function ChoreForm({
  idPrefix,
  kids,
  initialName = '',
  initialDescription = '',
  initialValueCents,
  initialActive = true,
  initialKidId = '',
  submitLabel,
  onSubmit,
  onCancel,
}: {
  idPrefix: string;
  kids: KidRecord[];
  initialName?: string;
  initialDescription?: string;
  initialValueCents?: number;
  initialActive?: boolean;
  initialKidId?: string;
  submitLabel: string;
  onSubmit: (values: ChoreFormValues) => Promise<void>;
  onCancel?: () => void;
}) {
  const form = useForm<ChoreFormInput, unknown, ChoreFormOutput>({
    resolver: zodResolver(choreFormSchema),
    defaultValues: {
      name: initialName,
      description: initialDescription,
      value: initialValueCents !== undefined ? centsToDollarsInput(initialValueCents) : '',
      active: initialActive,
      kidId: initialKidId || kids[0]?.id || '',
    },
  });

  const kidItems = kids.map((kid) => ({
    value: kid.id,
    label: `${kid.avatarKey} ${kid.name}`,
  }));

  async function handleValid(values: ChoreFormOutput) {
    try {
      await onSubmit({
        name: values.name,
        description: values.description,
        valueCents: values.value,
        active: values.active,
        kidId: values.kidId,
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
        <FieldLabel htmlFor={`${idPrefix}-description`}>Description (optional)</FieldLabel>
        <Input id={`${idPrefix}-description`} {...form.register('description')} />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field data-invalid={!!form.formState.errors.value}>
          <FieldLabel htmlFor={`${idPrefix}-value`}>Value ($)</FieldLabel>
          <Input
            id={`${idPrefix}-value`}
            type="number"
            min="0.01"
            step="0.01"
            {...form.register('value')}
          />
          <FieldError errors={form.formState.errors.value ? [form.formState.errors.value] : undefined} />
        </Field>

        <Field data-invalid={!!form.formState.errors.kidId}>
          <FieldLabel htmlFor={`${idPrefix}-kid`}>Assigned to</FieldLabel>
          <Controller
            control={form.control}
            name="kidId"
            render={({ field }) => (
              <Select
                items={kidItems}
                value={field.value || null}
                onValueChange={(value) => field.onChange(value ?? '')}
              >
                <SelectTrigger id={`${idPrefix}-kid`} className="w-full">
                  <SelectValue placeholder="Choose a kid" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {kidItems.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          />
          <FieldError errors={form.formState.errors.kidId ? [form.formState.errors.kidId] : undefined} />
        </Field>
      </div>

      <Field orientation="horizontal">
        <Controller
          control={form.control}
          name="active"
          render={({ field }) => (
            <Checkbox
              id={`${idPrefix}-active`}
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />
        <FieldLabel htmlFor={`${idPrefix}-active`}>Active</FieldLabel>
      </Field>

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
