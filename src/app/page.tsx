import Link from 'next/link';
import { cookies } from 'next/headers';
import { getCurrentUser } from 'aws-amplify/auth/server';
import { runWithAmplifyServerContext } from '@/utils/amplify-server-utils';
import { buttonVariants } from '@/components/design/button';
import { cn } from '@/lib/utils';
import SignOutButton from './_components/sign-out-button';

export default async function Home() {
  const user = await runWithAmplifyServerContext({
    nextServerContext: { cookies },
    operation: (contextSpec) => getCurrentUser(contextSpec),
  });

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 bg-muted/30 px-4">
      <h1 className="text-2xl font-semibold">
        Welcome, {user.signInDetails?.loginId ?? user.username}
      </h1>
      <Link href="/kids" className={cn(buttonVariants({ variant: 'link' }))}>
        Manage kid profiles
      </Link>
      <Link href="/chores" className={cn(buttonVariants({ variant: 'link' }))}>
        Manage chores
      </Link>
      <Link href="/switch-kid" className={cn(buttonVariants({ variant: 'link' }))}>
        Kid mode
      </Link>
      <SignOutButton />
    </div>
  );
}
