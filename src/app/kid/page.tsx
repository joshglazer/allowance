import { redirect } from 'next/navigation';

import { Button } from '@/components/design/button';
import { Card, CardContent } from '@/components/design/card';
import { clearActiveKid } from '@/app/switch-kid/actions';
import { serverDataClient } from '@/utils/amplify-server-data-client';
import { getActiveKidId } from '@/utils/active-kid';
import { formatCents } from '@/utils/money';

export default async function KidPage() {
  const activeKidId = await getActiveKidId();
  if (!activeKidId) redirect('/switch-kid');

  const { data: kid } = await serverDataClient.models.Kid.get({ id: activeKidId });
  if (!kid) redirect('/switch-kid');

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

      <form action={clearActiveKid} className="self-center">
        <Button type="submit" variant="outline">
          Not {kid.name}?
        </Button>
      </form>
    </div>
  );
}
