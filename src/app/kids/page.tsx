import Link from 'next/link';
import { serverDataClient } from '@/utils/amplify-server-data-client';
import { KidsManager } from '@/components/KidsManager';
import { toKidRecord } from '@/utils/kid';

export default async function KidsPage() {
  const { data, errors } = await serverDataClient.models.Kid.list();
  const kids = data.map(toKidRecord);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-16">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
          Kid profiles
        </h1>
        <Link href="/" className="text-sm underline underline-offset-4">
          Back home
        </Link>
      </div>

      <KidsManager
        initialKids={kids}
        initialError={errors ? (errors[0]?.message ?? 'Failed to load kids.') : null}
      />
    </div>
  );
}
