'use client';

import { useState } from 'react';
import { buttonClass, inputClass, secondaryButtonClass } from '@/components/ui';
import { dollarsInputToCents, centsToDollarsInput } from '@/utils/money';
import type { KidRecord } from '@/utils/kid';

export type ChoreFormValues = {
  name: string;
  description: string;
  valueCents: number;
  active: boolean;
  kidId: string;
};

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
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [value, setValue] = useState(
    initialValueCents !== undefined ? centsToDollarsInput(initialValueCents) : ''
  );
  const [active, setActive] = useState(initialActive);
  const [kidId, setKidId] = useState(initialKidId || kids[0]?.id || '');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Name is required.');
      return;
    }
    if (!kidId) {
      setError('Choose which kid this chore is for.');
      return;
    }
    const valueCents = dollarsInputToCents(value);
    if (valueCents === null || valueCents <= 0) {
      setError('Enter a value greater than $0.');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim(),
        valueCents,
        active,
        kidId,
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
        <label htmlFor={`${idPrefix}-description`} className="text-sm font-medium">
          Description (optional)
        </label>
        <input
          id={`${idPrefix}-description`}
          className={inputClass}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${idPrefix}-value`} className="text-sm font-medium">
            Value ($)
          </label>
          <input
            id={`${idPrefix}-value`}
            type="number"
            min="0.01"
            step="0.01"
            className={inputClass}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${idPrefix}-kid`} className="text-sm font-medium">
            Assigned to
          </label>
          <select
            id={`${idPrefix}-kid`}
            className={inputClass}
            value={kidId}
            onChange={(e) => setKidId(e.target.value)}
            required
          >
            <option value="" disabled>
              Choose a kid
            </option>
            {kids.map((kid) => (
              <option key={kid.id} value={kid.id}>
                {kid.avatarKey} {kid.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm font-medium">
        <input
          type="checkbox"
          checked={active}
          onChange={(e) => setActive(e.target.checked)}
        />
        Active
      </label>
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
