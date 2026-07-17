export function centsToDollarsInput(cents: number): string {
  return (cents / 100).toFixed(2);
}

export function dollarsInputToCents(dollars: string): number | null {
  const value = Number(dollars);
  if (!Number.isFinite(value) || value < 0) return null;
  return Math.round(value * 100);
}

export function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
