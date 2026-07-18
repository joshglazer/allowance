import Link from 'next/link';

import { buttonVariants } from '@/components/design/button';
import { cn } from '@/lib/utils';

export function AppPage({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-16">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{title}</h1>
        <Link href="/" className={cn(buttonVariants({ variant: 'link', size: 'sm' }))}>
          Back home
        </Link>
      </div>
      {children}
    </div>
  );
}
