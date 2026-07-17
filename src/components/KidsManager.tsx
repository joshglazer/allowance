'use client';

import { useState } from 'react';
import { client } from '@/utils/data-client';
import { toKidRecord, type KidRecord } from '@/utils/kid';
import { KidForm, type KidFormValues } from '@/components/KidForm';
import { secondaryButtonClass } from '@/components/ui';

export function KidsManager({
  initialKids,
  initialError,
}: {
  initialKids: KidRecord[];
  initialError: string | null;
}) {
  const [kids, setKids] = useState<KidRecord[]>(initialKids);
  const [error, setError] = useState<string | null>(initialError);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  async function handleCreate(values: KidFormValues) {
    const { data, errors } = await client.models.Kid.create({
      name: values.name,
      avatarKey: values.avatarKey,
      pinHash: values.pinHash!,
    });
    if (errors) throw new Error(errors[0]?.message ?? 'Failed to add kid.');
    if (data) setKids((prev) => [...prev, toKidRecord(data)]);
    setAdding(false);
  }

  async function handleUpdate(kid: KidRecord, values: KidFormValues) {
    const { data, errors } = await client.models.Kid.update({
      id: kid.id,
      name: values.name,
      avatarKey: values.avatarKey,
      ...(values.pinHash ? { pinHash: values.pinHash } : {}),
    });
    if (errors) throw new Error(errors[0]?.message ?? 'Failed to update kid.');
    if (data) setKids((prev) => prev.map((k) => (k.id === kid.id ? toKidRecord(data) : k)));
    setEditingId(null);
  }

  async function handleDelete(kid: KidRecord) {
    if (!window.confirm(`Remove ${kid.name}? This can't be undone.`)) return;
    const { errors } = await client.models.Kid.delete({ id: kid.id });
    if (errors) {
      setError(errors[0]?.message ?? 'Failed to remove kid.');
      return;
    }
    setKids((prev) => prev.filter((k) => k.id !== kid.id));
  }

  return (
    <>
      {error && <p className="text-sm text-red-600">{error}</p>}

      {kids.length === 0 && !adding && (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          No kids yet. Add your first kid profile below.
        </p>
      )}

      <ul className="flex flex-col gap-3">
        {kids.map((kid) => (
          <li
            key={kid.id}
            className="rounded-xl border border-black/[.08] bg-white p-4 dark:border-white/[.145] dark:bg-zinc-950"
          >
            {editingId === kid.id ? (
              <KidForm
                idPrefix={`kid-${kid.id}`}
                initialName={kid.name}
                initialAvatarKey={kid.avatarKey ?? undefined}
                requirePin={false}
                submitLabel="Save changes"
                onSubmit={(values) => handleUpdate(kid, values)}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-md border border-black/[.15] text-xl dark:border-white/[.2]">
                    {kid.avatarKey}
                  </span>
                  <span className="font-medium text-black dark:text-zinc-50">
                    {kid.name}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingId(kid.id)}
                    className={secondaryButtonClass}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(kid)}
                    className={secondaryButtonClass}
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>

      {adding ? (
        <div className="rounded-xl border border-black/[.08] bg-white p-4 dark:border-white/[.145] dark:bg-zinc-950">
          <KidForm
            idPrefix="kid-new"
            requirePin
            submitLabel="Add kid"
            onSubmit={handleCreate}
            onCancel={() => setAdding(false)}
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className={secondaryButtonClass}
        >
          Add kid
        </button>
      )}
    </>
  );
}
