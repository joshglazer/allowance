'use client';

import { useState } from 'react';

import { Badge } from '@/components/design/badge';
import { Button } from '@/components/design/button';
import { Card, CardContent } from '@/components/design/card';
import { StatusAlert } from '@/components/molecules/status-alert';
import { client } from '@/utils/data-client';
import { toChoreCompletionRecord, type ChoreCompletionRecord } from '@/utils/chore-completion';
import type { ChoreRecord } from '@/utils/chore';
import { formatCents } from '@/utils/money';

export function KidChores({
  kidId,
  initialChores,
  initialCompletions,
  initialError,
}: {
  kidId: string;
  initialChores: ChoreRecord[];
  initialCompletions: ChoreCompletionRecord[];
  initialError: string | null;
}) {
  const [completions, setCompletions] = useState<ChoreCompletionRecord[]>(initialCompletions);
  const [error, setError] = useState<string | null>(initialError);
  const [completingId, setCompletingId] = useState<string | null>(null);

  function latestCompletionFor(choreId: string): ChoreCompletionRecord | undefined {
    return completions
      .filter((c) => c.choreId === choreId)
      .sort((a, b) => (a.completedAt < b.completedAt ? 1 : -1))[0];
  }

  async function handleComplete(chore: ChoreRecord) {
    setError(null);
    setCompletingId(chore.id);
    const { data, errors } = await client.models.ChoreCompletion.create({
      kidId,
      choreId: chore.id,
      completedAt: new Date().toISOString(),
      status: 'PENDING',
    });
    setCompletingId(null);
    if (errors) {
      setError(errors[0]?.message ?? 'Failed to mark chore complete.');
      return;
    }
    if (data) setCompletions((prev) => [...prev, toChoreCompletionRecord(data)]);
  }

  return (
    <>
      <StatusAlert variant="destructive" message={error} />

      {initialChores.length === 0 && !error && (
        <p className="text-sm text-muted-foreground">
          No chores assigned yet. Check back later!
        </p>
      )}

      <ul className="flex flex-col gap-3">
        {initialChores.map((chore) => {
          const completion = latestCompletionFor(chore.id);
          return (
            <li key={chore.id}>
              <Card>
                <CardContent className="flex items-center justify-between gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="font-medium">{chore.name}</span>
                    {chore.description && (
                      <span className="text-sm text-muted-foreground">{chore.description}</span>
                    )}
                    <span className="text-sm text-muted-foreground">
                      {formatCents(chore.valueCents)}
                    </span>
                  </div>
                  {completion?.status === 'APPROVED' ? (
                    <Badge>Done!</Badge>
                  ) : completion?.status === 'PENDING' ? (
                    <Badge variant="secondary">Waiting for approval</Badge>
                  ) : (
                    <Button
                      type="button"
                      onClick={() => handleComplete(chore)}
                      disabled={completingId === chore.id}
                    >
                      {completingId === chore.id ? 'Marking done…' : 'Mark done'}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </li>
          );
        })}
      </ul>
    </>
  );
}
