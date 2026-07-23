import { AppPage } from '@/components/templates/app-page';
import { serverDataClient } from '@/utils/amplify-server-data-client';
import { toKidSummary } from '@/utils/kid';
import { KidSwitcher } from './_components/kid-switcher';

export default async function SwitchKidPage() {
  const { data, errors } = await serverDataClient.models.Kid.list();
  const kids = data.map(toKidSummary);

  return (
    <AppPage title="Who's doing chores?">
      <KidSwitcher
        kids={kids}
        initialError={errors ? (errors[0]?.message ?? 'Failed to load kids.') : null}
      />
    </AppPage>
  );
}
