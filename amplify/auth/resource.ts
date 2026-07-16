import { defineAuth } from '@aws-amplify/backend';

/**
 * Parents sign in with email/password via Cognito.
 * Kids don't get their own Cognito user — they select a profile and
 * enter a PIN inside the app, scoped under the signed-in parent.
 * https://docs.amplify.aws/nextjs/build-a-backend/auth/
 */
export const auth = defineAuth({
  loginWith: {
    email: true,
  },
});
