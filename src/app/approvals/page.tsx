import { AppPage } from '@/components/templates/app-page';
import { serverDataClient } from '@/utils/amplify-server-data-client';
import { toChoreCompletionRecord } from '@/utils/chore-completion';
import { toChoreRecord } from '@/utils/chore';
import { toKidRecord } from '@/utils/kid';
import { ApprovalsManager } from './_components/approvals-manager';

export default async function ApprovalsPage() {
  const [completionsResult, choresResult, kidsResult] = await Promise.all([
    serverDataClient.models.ChoreCompletion.list({ filter: { status: { eq: 'PENDING' } } }),
    serverDataClient.models.Chore.list(),
    serverDataClient.models.Kid.list(),
  ]);
  const completions = completionsResult.data.map(toChoreCompletionRecord);
  const chores = choresResult.data.map(toChoreRecord);
  const kids = kidsResult.data.map(toKidRecord);
  const errors = completionsResult.errors ?? choresResult.errors ?? kidsResult.errors;

  return (
    <AppPage title="Approvals">
      <ApprovalsManager
        initialCompletions={completions}
        chores={chores}
        kids={kids}
        initialError={errors ? (errors[0]?.message ?? 'Failed to load approvals.') : null}
      />
    </AppPage>
  );
}
