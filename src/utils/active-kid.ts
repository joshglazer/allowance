import { cookies } from 'next/headers';

// Not cryptographically signed: every Kid record is owner-scoped to the
// parent's Cognito session regardless of this cookie's value (see
// amplify/data/resource.ts), so a tampered cookie can only mislead the UI
// about which already-authorized kid is "active" — same reasoning as the
// PIN hashing decision in PLAN.md Phase 2.
export const ACTIVE_KID_COOKIE = 'active-kid';

export async function getActiveKidId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(ACTIVE_KID_COOKIE)?.value ?? null;
}
