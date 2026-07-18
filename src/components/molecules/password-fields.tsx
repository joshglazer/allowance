import type { FieldError, UseFormRegisterReturn } from 'react-hook-form';

import { Field, FieldError as FieldErrorText, FieldLabel } from '@/components/design/field';
import { Input } from '@/components/design/input';

export function PasswordFields({
  idPrefix,
  passwordLabel = 'Password',
  confirmLabel = 'Confirm password',
  passwordRegister,
  confirmRegister,
  passwordError,
  confirmError,
}: {
  idPrefix: string;
  passwordLabel?: string;
  confirmLabel?: string;
  passwordRegister: UseFormRegisterReturn;
  confirmRegister: UseFormRegisterReturn;
  passwordError?: FieldError;
  confirmError?: FieldError;
}) {
  return (
    <>
      <Field data-invalid={!!passwordError}>
        <FieldLabel htmlFor={`${idPrefix}-password`}>{passwordLabel}</FieldLabel>
        <Input
          id={`${idPrefix}-password`}
          type="password"
          autoComplete="new-password"
          required
          {...passwordRegister}
        />
        <FieldErrorText errors={passwordError ? [passwordError] : undefined} />
      </Field>
      <Field data-invalid={!!confirmError}>
        <FieldLabel htmlFor={`${idPrefix}-confirm-password`}>{confirmLabel}</FieldLabel>
        <Input
          id={`${idPrefix}-confirm-password`}
          type="password"
          autoComplete="new-password"
          required
          {...confirmRegister}
        />
        <FieldErrorText errors={confirmError ? [confirmError] : undefined} />
      </Field>
    </>
  );
}
