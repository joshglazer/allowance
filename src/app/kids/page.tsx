import { AppPage } from '@/components/templates/app-page';
import { serverDataClient } from '@/utils/amplify-server-data-client';
import { toKidRecord } from '@/utils/kid';
import { KidsManager } from './_components/kids-manager';

export default async function KidsPage() {
  const { data, errors } = await serverDataClient.models.Kid.list();
  const kids = data.map(toKidRecord);

  return (
    <AppPage title="Kid profiles">
      <KidsManager
        initialKids={kids}
        initialError={errors ? (errors[0]?.message ?? 'Failed to load kids.') : null}
      />
    </AppPage>
  );
}
