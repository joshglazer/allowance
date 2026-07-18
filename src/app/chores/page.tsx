import { AppPage } from '@/components/templates/app-page';
import { serverDataClient } from '@/utils/amplify-server-data-client';
import { toChoreRecord } from '@/utils/chore';
import { toKidRecord } from '@/utils/kid';
import { ChoresManager } from './_components/chores-manager';

export default async function ChoresPage() {
  const [choresResult, kidsResult] = await Promise.all([
    serverDataClient.models.Chore.list(),
    serverDataClient.models.Kid.list(),
  ]);
  const chores = choresResult.data.map(toChoreRecord);
  const kids = kidsResult.data.map(toKidRecord);
  const errors = choresResult.errors ?? kidsResult.errors;

  return (
    <AppPage title="Chores">
      <ChoresManager
        initialChores={chores}
        initialError={errors ? (errors[0]?.message ?? 'Failed to load chores.') : null}
        kids={kids}
      />
    </AppPage>
  );
}
