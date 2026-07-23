import type { Schema } from '../../amplify/data/resource';

type ChoreCompletion = Schema['ChoreCompletion']['type'];

// Lazy-loaded relations are client-side functions and can't cross the
// Server -> Client Component boundary (or survive JSON serialization).
export type ChoreCompletionRecord = Omit<ChoreCompletion, 'kid' | 'chore'>;

export function toChoreCompletionRecord(completion: ChoreCompletion): ChoreCompletionRecord {
  return {
    id: completion.id,
    kidId: completion.kidId,
    choreId: completion.choreId,
    completedAt: completion.completedAt,
    status: completion.status,
    createdAt: completion.createdAt,
    updatedAt: completion.updatedAt,
    owner: completion.owner,
  };
}
