import type { FieldError, UseFormRegisterReturn } from 'react-hook-form';

import { Field, FieldError as FieldErrorText, FieldLabel } from '@/components/design/field';
import { Input } from '@/components/design/input';

export function PinFields({
  idPrefix,
  pinLabel = 'PIN',
  required,
  pinRegister,
  confirmPinRegister,
  pinError,
  confirmPinError,
}: {
  idPrefix: string;
  pinLabel?: string;
  required: boolean;
  pinRegister: UseFormRegisterReturn;
  confirmPinRegister: UseFormRegisterReturn;
  pinError?: FieldError;
  confirmPinError?: FieldError;
}) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Field data-invalid={!!pinError}>
        <FieldLabel htmlFor={`${idPrefix}-pin`}>{pinLabel}</FieldLabel>
        <Input
          id={`${idPrefix}-pin`}
          type="password"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="off"
          required={required}
          {...pinRegister}
        />
        <FieldErrorText errors={pinError ? [pinError] : undefined} />
      </Field>
      <Field data-invalid={!!confirmPinError}>
        <FieldLabel htmlFor={`${idPrefix}-confirm-pin`}>Confirm PIN</FieldLabel>
        <Input
          id={`${idPrefix}-confirm-pin`}
          type="password"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="off"
          required={required}
          {...confirmPinRegister}
        />
        <FieldErrorText errors={confirmPinError ? [confirmPinError] : undefined} />
      </Field>
    </div>
  );
}
