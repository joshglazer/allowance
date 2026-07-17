'use client';

import { useState } from 'react';
import { buttonClass, inputClass, secondaryButtonClass } from '@/components/ui';
import { KID_AVATARS, DEFAULT_AVATAR } from '@/utils/avatars';
import { hashPin, isValidPin } from '@/utils/pin';

export type KidFormValues = {
  name: string;
  avatarKey: string;
  pinHash?: string;
};

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
  const [name, setName] = useState(initialName);
  const [avatarKey, setAvatarKey] = useState(initialAvatarKey);
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Name is required.');
      return;
    }

    const settingPin = requirePin || pin.length > 0 || confirmPin.length > 0;
    if (settingPin) {
      if (!isValidPin(pin)) {
        setError('PIN must be 4-6 digits.');
        return;
      }
      if (pin !== confirmPin) {
        setError('PINs do not match.');
        return;
      }
    }

    setSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        avatarKey,
        pinHash: settingPin ? await hashPin(pin) : undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-1.5">
        <label htmlFor={`${idPrefix}-name`} className="text-sm font-medium">
          Name
        </label>
        <input
          id={`${idPrefix}-name`}
          className={inputClass}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">Avatar</span>
        <div className="flex flex-wrap gap-2">
          {KID_AVATARS.map((avatar) => (
            <button
              key={avatar}
              type="button"
              onClick={() => setAvatarKey(avatar)}
              aria-pressed={avatarKey === avatar}
              className={`flex h-10 w-10 items-center justify-center rounded-md border text-xl transition-colors ${
                avatarKey === avatar
                  ? 'border-black bg-black/[.06] dark:border-white dark:bg-white/[.12]'
                  : 'border-black/[.15] hover:bg-black/[.04] dark:border-white/[.2] dark:hover:bg-white/[.08]'
              }`}
            >
              {avatar}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${idPrefix}-pin`} className="text-sm font-medium">
            {requirePin ? 'PIN' : 'New PIN (optional)'}
          </label>
          <input
            id={`${idPrefix}-pin`}
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="off"
            className={inputClass}
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            required={requirePin}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${idPrefix}-confirm-pin`} className="text-sm font-medium">
            Confirm PIN
          </label>
          <input
            id={`${idPrefix}-confirm-pin`}
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="off"
            className={inputClass}
            value={confirmPin}
            onChange={(e) => setConfirmPin(e.target.value)}
            required={requirePin}
          />
        </div>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-3">
        <button type="submit" disabled={submitting} className={buttonClass}>
          {submitting ? 'Saving…' : submitLabel}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className={secondaryButtonClass}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
