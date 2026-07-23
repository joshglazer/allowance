'use client';

import { useState, useTransition } from 'react';

import { Badge } from '@/components/design/badge';
import { Button } from '@/components/design/button';
import { Card, CardContent } from '@/components/design/card';
import { StatusAlert } from '@/components/molecules/status-alert';
import type { ChoreCompletionRecord } from '@/utils/chore-completion';
import type { ChoreRecord } from '@/utils/chore';
import type { KidRecord } from '@/utils/kid';
import { formatCents } from '@/utils/money';
import { approveCompletion, rejectCompletion } from '../actions';

export function ApprovalsManager({
  initialCompletions,
  chores,
  kids,
  initialError,
}: {
  initialCompletions: ChoreCompletionRecord[];
  chores: ChoreRecord[];
  kids: KidRecord[];
  initialError: string | null;
}) {
  const [completions, setCompletions] = useState<ChoreCompletionRecord[]>(initialCompletions);
  const [error, setError] = useState<string | null>(initialError);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function choreFor(choreId: string) {
    return chores.find((c) => c.id === choreId);
  }

  function kidFor(kidId: string) {
    return kids.find((k) => k.id === kidId);
  }

  function handleApprove(completion: ChoreCompletionRecord) {
    setError(null);
    setActiveId(completion.id);
    startTransition(async () => {
      const result = await approveCompletion(completion.id);
      if (result?.error) {
        setError(result.error);
        setActiveId(null);
        return;
      }
      setCompletions((prev) => prev.filter((c) => c.id !== completion.id));
      setActiveId(null);
    });
  }

  function handleReject(completion: ChoreCompletionRecord) {
    setError(null);
    setActiveId(completion.id);
    startTransition(async () => {
      const result = await rejectCompletion(completion.id);
      if (result?.error) {
        setError(result.error);
        setActiveId(null);
        return;
      }
      setCompletions((prev) => prev.filter((c) => c.id !== completion.id));
      setActiveId(null);
    });
  }

  return (
    <>
      <StatusAlert variant="destructive" message={error} />

      {completions.length === 0 && !error && (
        <p className="text-sm text-muted-foreground">No chores waiting for approval.</p>
      )}

      <ul className="flex flex-col gap-3">
        {completions.map((completion) => {
          const chore = choreFor(completion.choreId);
          const kid = kidFor(completion.kidId);
          const busy = isPending && activeId === completion.id;
          return (
            <li key={completion.id}>
              <Card>
                <CardContent className="flex items-center justify-between gap-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{chore?.name ?? 'Unknown chore'}</span>
                      <Badge variant="secondary">
                        {kid ? `${kid.avatarKey} ${kid.name}` : 'Unknown kid'}
                      </Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {formatCents(chore?.valueCents ?? 0)} · completed{' '}
                      {new Date(completion.completedAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={busy}
                      onClick={() => handleReject(completion)}
                    >
                      Reject
                    </Button>
                    <Button type="button" disabled={busy} onClick={() => handleApprove(completion)}>
                      Approve
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </li>
          );
        })}
      </ul>
    </>
  );
}
