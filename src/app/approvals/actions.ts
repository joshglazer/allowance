'use server';

import { serverDataClient } from '@/utils/amplify-server-data-client';

export async function approveCompletion(completionId: string): Promise<{ error: string } | void> {
  const { data: completion } = await serverDataClient.models.ChoreCompletion.get({ id: completionId });
  if (!completion || completion.status !== 'PENDING') {
    return { error: 'This chore is no longer pending approval.' };
  }

  const [{ data: chore }, { data: kid }] = await Promise.all([
    serverDataClient.models.Chore.get({ id: completion.choreId }),
    serverDataClient.models.Kid.get({ id: completion.kidId }),
  ]);
  if (!chore) return { error: 'Chore not found.' };
  if (!kid) return { error: 'Kid not found.' };

  const { errors: statusErrors } = await serverDataClient.models.ChoreCompletion.update({
    id: completionId,
    status: 'APPROVED',
  });
  if (statusErrors) return { error: statusErrors[0]?.message ?? 'Failed to approve chore.' };

  const { errors: ledgerErrors } = await serverDataClient.models.LedgerEntry.create({
    kidId: completion.kidId,
    amountCents: chore.valueCents,
    reason: `Chore: ${chore.name}`,
    createdAt: new Date().toISOString(),
  });
  if (ledgerErrors) return { error: ledgerErrors[0]?.message ?? 'Failed to record ledger entry.' };

  const { errors: balanceErrors } = await serverDataClient.models.Kid.update({
    id: completion.kidId,
    balanceCents: (kid.balanceCents ?? 0) + chore.valueCents,
  });
  if (balanceErrors) return { error: balanceErrors[0]?.message ?? 'Failed to update balance.' };
}

export async function rejectCompletion(completionId: string): Promise<{ error: string } | void> {
  const { data: completion } = await serverDataClient.models.ChoreCompletion.get({ id: completionId });
  if (!completion || completion.status !== 'PENDING') {
    return { error: 'This chore is no longer pending approval.' };
  }

  const { errors } = await serverDataClient.models.ChoreCompletion.update({
    id: completionId,
    status: 'REJECTED',
  });
  if (errors) return { error: errors[0]?.message ?? 'Failed to reject chore.' };
}
