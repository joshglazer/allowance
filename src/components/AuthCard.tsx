import { buttonClass, inputClass, linkClass } from '@/components/ui';

export const authInputClass = inputClass;
export const authButtonClass = buttonClass;
export const authLinkClass = linkClass;

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
