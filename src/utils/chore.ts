import type { Schema } from '../../amplify/data/resource';

type Chore = Schema['Chore']['type'];

// Lazy-loaded relations are client-side functions and can't cross the
// Server -> Client Component boundary (or survive JSON serialization).
export type ChoreRecord = Omit<Chore, 'kid' | 'completions'>;

export function toChoreRecord(chore: Chore): ChoreRecord {
  return {
    id: chore.id,
    name: chore.name,
    description: chore.description,
    valueCents: chore.valueCents,
    active: chore.active,
    kidId: chore.kidId,
    createdAt: chore.createdAt,
    updatedAt: chore.updatedAt,
    owner: chore.owner,
  };
}
