'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { serverDataClient } from '@/utils/amplify-server-data-client';
import { ACTIVE_KID_COOKIE } from '@/utils/active-kid';
import { verifyPin } from '@/utils/pin';

const ACTIVE_KID_MAX_AGE_SECONDS = 60 * 60 * 12;

export async function verifyKidPin(kidId: string, pin: string): Promise<{ error: string } | void> {
  const { data: kid } = await serverDataClient.models.Kid.get({ id: kidId });

  if (!kid || !(await verifyPin(pin, kid.pinHash))) {
    return { error: 'Incorrect PIN. Try again.' };
  }

  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_KID_COOKIE, kidId, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: ACTIVE_KID_MAX_AGE_SECONDS,
  });

  redirect('/kid');
}

export async function clearActiveKid() {
  const cookieStore = await cookies();
  cookieStore.delete(ACTIVE_KID_COOKIE);
  redirect('/switch-kid');
}
