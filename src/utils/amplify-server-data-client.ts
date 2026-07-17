import { cookies } from 'next/headers';
import { generateServerClientUsingCookies } from '@aws-amplify/adapter-nextjs/data';
import outputs from '../../amplify_outputs.json';
import type { Schema } from '../../amplify/data/resource';

export const serverDataClient = generateServerClientUsingCookies<Schema>({
  config: outputs,
  cookies,
});
