import { Alert, AlertDescription } from '@/components/design/alert';

export function StatusAlert({
  variant = 'default',
  message,
}: {
  variant?: 'default' | 'destructive';
  message?: string | null;
}) {
  if (!message) return null;

  return (
    <Alert variant={variant}>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
