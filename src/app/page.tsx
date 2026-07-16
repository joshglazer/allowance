import { cookies } from 'next/headers';
import { getCurrentUser } from 'aws-amplify/auth/server';
import { runWithAmplifyServerContext } from '@/utils/amplify-server-utils';
import SignOutButton from '@/components/SignOutButton';

export default async function Home() {
  const user = await runWithAmplifyServerContext({
    nextServerContext: { cookies },
    operation: (contextSpec) => getCurrentUser(contextSpec),
  });

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 bg-zinc-50 px-4 dark:bg-black">
      <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
        Welcome, {user.signInDetails?.loginId ?? user.username}
      </h1>
      <SignOutButton />
    </div>
  );
}
