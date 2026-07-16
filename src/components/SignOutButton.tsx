'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { signOut } from 'aws-amplify/auth';

export default function SignOutButton() {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    await signOut();
    router.push('/sign-in');
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={signingOut}
      className="rounded-md border border-black/[.15] px-4 py-2 font-medium transition-colors hover:bg-black/[.04] disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/[.2] dark:hover:bg-white/[.08]"
    >
      {signingOut ? 'Signing out…' : 'Sign out'}
    </button>
  );
}
