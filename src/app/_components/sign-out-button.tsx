'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { signOut } from 'aws-amplify/auth';

import { Button } from '@/components/design/button';

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
    <Button type="button" variant="outline" onClick={handleSignOut} disabled={signingOut}>
      {signingOut ? 'Signing out…' : 'Sign out'}
    </Button>
  );
}
