import { Suspense } from 'react';

import { ConfirmSignUpForm } from './_components/confirm-sign-up-form';

export default function ConfirmSignUpPage() {
  return (
    <Suspense>
      <ConfirmSignUpForm />
    </Suspense>
  );
}
