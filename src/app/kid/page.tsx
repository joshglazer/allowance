import { redirect } from 'next/navigation';

import { Button } from '@/components/design/button';
import { Card, CardContent } from '@/components/design/card';
import { clearActiveKid } from '@/app/switch-kid/actions';
import { serverDataClient } from '@/utils/amplify-server-data-client';
import { getActiveKidId } from '@/utils/active-kid';
import { toChoreCompletionRecord } from '@/utils/chore-completion';
import { toChoreRecord } from '@/utils/chore';
import { formatCents } from '@/utils/money';
import { KidChores } from './_components/kid-chores';

export default async function KidPage() {
  const activeKidId = await getActiveKidId();
  if (!activeKidId) redirect('/switch-kid');

  const { data: kid } = await serverDataClient.models.Kid.get({ id: activeKidId });
  if (!kid) redirect('/switch-kid');

  const [choresResult, completionsResult] = await Promise.all([
    serverDataClient.models.Chore.list({
      filter: { kidId: { eq: activeKidId }, active: { eq: true } },
    }),
    serverDataClient.models.ChoreCompletion.list({
      filter: { kidId: { eq: activeKidId } },
    }),
  ]);
  const chores = choresResult.data.map(toChoreRecord);
  const completions = completionsResult.data.map(toChoreCompletionRecord);
  const choresError = choresResult.errors ?? completionsResult.errors;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-16">
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-4 text-center">
          <span className="flex h-20 w-20 items-center justify-center rounded-full border border-input text-5xl">
            {kid.avatarKey}
          </span>
          <h1 className="text-2xl font-semibold">Hi, {kid.name}!</h1>
          <p className="text-lg text-muted-foreground">
            Balance: {formatCents(kid.balanceCents ?? 0)}
          </p>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Your chores</h2>
        <KidChores
          kidId={activeKidId}
          initialChores={chores}
          initialCompletions={completions}
          initialError={choresError ? (choresError[0]?.message ?? 'Failed to load chores.') : null}
        />
      </div>

      <form action={clearActiveKid} className="self-center">
        <Button type="submit" variant="outline">
          Not {kid.name}?
        </Button>
      </form>
    </div>
  );
}
