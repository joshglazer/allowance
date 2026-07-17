import Link from 'next/link';
import { serverDataClient } from '@/utils/amplify-server-data-client';
import { ChoresManager } from '@/components/ChoresManager';
import { toChoreRecord } from '@/utils/chore';
import { toKidRecord } from '@/utils/kid';

export default async function ChoresPage() {
  const [choresResult, kidsResult] = await Promise.all([
    serverDataClient.models.Chore.list(),
    serverDataClient.models.Kid.list(),
  ]);
  const chores = choresResult.data.map(toChoreRecord);
  const kids = kidsResult.data.map(toKidRecord);
  const errors = choresResult.errors ?? kidsResult.errors;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-16">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
          Chores
        </h1>
        <Link href="/" className="text-sm underline underline-offset-4">
          Back home
        </Link>
      </div>

      <ChoresManager
        initialChores={chores}
        initialError={errors ? (errors[0]?.message ?? 'Failed to load chores.') : null}
        kids={kids}
      />
    </div>
  );
}
