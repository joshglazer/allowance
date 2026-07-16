export const authInputClass =
  'w-full rounded-md border border-black/[.15] bg-white px-3 py-2 text-black placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-black/40 dark:border-white/[.2] dark:bg-zinc-900 dark:text-zinc-50';

export const authButtonClass =
  'w-full rounded-md bg-foreground px-4 py-2 font-medium text-background transition-colors hover:bg-[#383838] disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-[#ccc]';

export const authLinkClass = 'font-medium underline underline-offset-4';

export function AuthCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-4 py-16 dark:bg-black">
      <div className="w-full max-w-sm rounded-xl border border-black/[.08] bg-white p-8 dark:border-white/[.145] dark:bg-zinc-950">
        <h1 className="mb-6 text-2xl font-semibold text-black dark:text-zinc-50">
          {title}
        </h1>
        {children}
      </div>
    </div>
  );
}
