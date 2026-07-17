import type { Schema } from '../../amplify/data/resource';

type Kid = Schema['Kid']['type'];

// Lazy-loaded hasMany relations are client-side functions and can't cross
// the Server -> Client Component boundary (or survive JSON serialization).
export type KidRecord = Omit<Kid, 'assignedChores' | 'chores' | 'ledgerEntries' | 'redemptions'>;

export function toKidRecord(kid: Kid): KidRecord {
  return {
    id: kid.id,
    name: kid.name,
    pinHash: kid.pinHash,
    avatarKey: kid.avatarKey,
    balanceCents: kid.balanceCents,
    createdAt: kid.createdAt,
    updatedAt: kid.updatedAt,
    owner: kid.owner,
  };
}
