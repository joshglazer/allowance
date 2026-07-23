'use client';

import { useState } from 'react';

import { Card, CardContent } from '@/components/design/card';
import { StatusAlert } from '@/components/molecules/status-alert';
import type { KidSummary } from '@/utils/kid';
import { KidPinForm } from './kid-pin-form';

export function KidSwitcher({
  kids,
  initialError,
}: {
  kids: KidSummary[];
  initialError: string | null;
}) {
  const [selectedKid, setSelectedKid] = useState<KidSummary | null>(null);

  return (
    <>
      <StatusAlert variant="destructive" message={initialError} />

      {kids.length === 0 && !initialError ? (
        <p className="text-sm text-muted-foreground">
          No kid profiles yet. Ask a parent to add one first.
        </p>
      ) : (
        <Card>
          <CardContent>
            {selectedKid ? (
              <KidPinForm kid={selectedKid} onCancel={() => setSelectedKid(null)} />
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {kids.map((kid) => (
                  <button
                    key={kid.id}
                    type="button"
                    onClick={() => setSelectedKid(kid)}
                    className="flex flex-col items-center gap-2 rounded-lg border border-input p-4 text-center transition-colors hover:bg-muted"
                  >
                    <span className="text-3xl">{kid.avatarKey}</span>
                    <span className="font-medium">{kid.name}</span>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </>
  );
}
