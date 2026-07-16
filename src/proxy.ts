import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { fetchAuthSession } from 'aws-amplify/auth/server';
import { runWithAmplifyServerContext } from '@/utils/amplify-server-utils';

const PUBLIC_ROUTES = [
  '/sign-in',
  '/sign-up',
  '/confirm-sign-up',
  '/forgot-password',
];

export async function proxy(request: NextRequest) {
  const response = NextResponse.next();

  const isAuthenticated = await runWithAmplifyServerContext({
    nextServerContext: { request, response },
    operation: async (contextSpec) => {
      try {
        const session = await fetchAuthSession(contextSpec);
        return session.tokens !== undefined;
      } catch {
        return false;
      }
    },
  });

  const isPublicRoute = PUBLIC_ROUTES.includes(request.nextUrl.pathname);

  if (!isAuthenticated && !isPublicRoute) {
    const signInUrl = new URL('/sign-in', request.url);
    signInUrl.searchParams.set('redirectTo', request.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }

  if (isAuthenticated && isPublicRoute) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.svg$).*)',
  ],
};
