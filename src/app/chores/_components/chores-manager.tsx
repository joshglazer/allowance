'use client';

import { useState } from 'react';

import { Badge } from '@/components/design/badge';
import { Button } from '@/components/design/button';
import { Card, CardContent } from '@/components/design/card';
import { StatusAlert } from '@/components/molecules/status-alert';
import { client } from '@/utils/data-client';
import { toChoreRecord, type ChoreRecord } from '@/utils/chore';
import type { KidRecord } from '@/utils/kid';
import { formatCents } from '@/utils/money';
import { ChoreForm, type ChoreFormValues } from './chore-form';

export function ChoresManager({
  initialChores,
  initialError,
  kids,
}: {
  initialChores: ChoreRecord[];
  initialError: string | null;
  kids: KidRecord[];
}) {
  const [chores, setChores] = useState<ChoreRecord[]>(initialChores);
  const [error, setError] = useState<string | null>(initialError);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  function kidLabel(kidId: string) {
    const kid = kids.find((k) => k.id === kidId);
    return kid ? `${kid.avatarKey} ${kid.name}` : 'Unknown kid';
  }

  async function handleCreate(values: ChoreFormValues) {
    const { data, errors } = await client.models.Chore.create({
      name: values.name,
      description: values.description || undefined,
      valueCents: values.valueCents,
      active: values.active,
      kidId: values.kidId,
    });
    if (errors) throw new Error(errors[0]?.message ?? 'Failed to add chore.');
    if (data) setChores((prev) => [...prev, toChoreRecord(data)]);
    setAdding(false);
  }

  async function handleUpdate(chore: ChoreRecord, values: ChoreFormValues) {
    const { data, errors } = await client.models.Chore.update({
      id: chore.id,
      name: values.name,
      description: values.description || undefined,
      valueCents: values.valueCents,
      active: values.active,
      kidId: values.kidId,
    });
    if (errors) throw new Error(errors[0]?.message ?? 'Failed to update chore.');
    if (data) setChores((prev) => prev.map((c) => (c.id === chore.id ? toChoreRecord(data) : c)));
    setEditingId(null);
  }

  async function handleToggleActive(chore: ChoreRecord) {
    const { data, errors } = await client.models.Chore.update({
      id: chore.id,
      active: !chore.active,
    });
    if (errors) {
      setError(errors[0]?.message ?? 'Failed to update chore.');
      return;
    }
    if (data) setChores((prev) => prev.map((c) => (c.id === chore.id ? toChoreRecord(data) : c)));
  }

  async function handleDelete(chore: ChoreRecord) {
    if (!window.confirm(`Remove "${chore.name}"? This can't be undone.`)) return;
    const { errors } = await client.models.Chore.delete({ id: chore.id });
    if (errors) {
      setError(errors[0]?.message ?? 'Failed to remove chore.');
      return;
    }
    setChores((prev) => prev.filter((c) => c.id !== chore.id));
  }

  return (
    <>
      <StatusAlert variant="destructive" message={error} />

      {kids.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Add a kid profile first before creating chores.
        </p>
      )}

      {chores.length === 0 && !adding && kids.length > 0 && (
        <p className="text-sm text-muted-foreground">No chores yet. Add your first chore below.</p>
      )}

      <ul className="flex flex-col gap-3">
        {chores.map((chore) => (
          <li key={chore.id}>
            <Card>
              <CardContent>
                {editingId === chore.id ? (
                  <ChoreForm
                    idPrefix={`chore-${chore.id}`}
                    kids={kids}
                    initialName={chore.name}
                    initialDescription={chore.description ?? ''}
                    initialValueCents={chore.valueCents}
                    initialActive={chore.active ?? true}
                    initialKidId={chore.kidId}
                    submitLabel="Save changes"
                    onSubmit={(values) => handleUpdate(chore, values)}
                    onCancel={() => setEditingId(null)}
                  />
                ) : (
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{chore.name}</span>
                        {!chore.active && <Badge variant="secondary">Inactive</Badge>}
                      </div>
                      {chore.description && (
                        <span className="text-sm text-muted-foreground">{chore.description}</span>
                      )}
                      <span className="text-sm text-muted-foreground">
                        {formatCents(chore.valueCents)} · {kidLabel(chore.kidId)}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" onClick={() => handleToggleActive(chore)}>
                        {chore.active ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setEditingId(chore.id)}>
                        Edit
                      </Button>
                      <Button type="button" variant="outline" onClick={() => handleDelete(chore)}>
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
            <ChoreForm
              idPrefix="chore-new"
              kids={kids}
              submitLabel="Add chore"
              onSubmit={handleCreate}
              onCancel={() => setAdding(false)}
            />
          </CardContent>
        </Card>
      ) : (
        kids.length > 0 && (
          <Button type="button" variant="outline" onClick={() => setAdding(true)}>
            Add chore
          </Button>
        )
      )}
    </>
  );
}
