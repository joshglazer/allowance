'use client';

import { useState } from 'react';

import { Button } from '@/components/design/button';
import { Card, CardContent } from '@/components/design/card';
import { StatusAlert } from '@/components/molecules/status-alert';
import { client } from '@/utils/data-client';
import { toKidRecord, type KidRecord } from '@/utils/kid';
import { KidForm, type KidFormValues } from './kid-form';

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
      <StatusAlert variant="destructive" message={error} />

      {kids.length === 0 && !adding && (
        <p className="text-sm text-muted-foreground">
          No kids yet. Add your first kid profile below.
        </p>
      )}

      <ul className="flex flex-col gap-3">
        {kids.map((kid) => (
          <li key={kid.id}>
            <Card>
              <CardContent>
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
                      <span className="flex h-10 w-10 items-center justify-center rounded-md border border-input text-xl">
                        {kid.avatarKey}
                      </span>
                      <span className="font-medium">{kid.name}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" onClick={() => setEditingId(kid.id)}>
                        Edit
                      </Button>
                      <Button type="button" variant="outline" onClick={() => handleDelete(kid)}>
                        Remove
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>

      {adding ? (
        <Card>
          <CardContent>
            <KidForm
              idPrefix="kid-new"
              requirePin
              submitLabel="Add kid"
              onSubmit={handleCreate}
              onCancel={() => setAdding(false)}
            />
          </CardContent>
        </Card>
      ) : (
        <Button type="button" variant="outline" onClick={() => setAdding(true)}>
          Add kid
        </Button>
      )}
    </>
  );
}
