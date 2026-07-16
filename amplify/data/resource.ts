import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

/**
 * Data models are scoped to the signed-in parent (owner-based auth).
 * Kids don't have their own Cognito identity, so all kid/chore/ledger
 * records live under the parent's account and the app enforces PIN
 * checks in application code before letting a kid view/act on them.
 * https://docs.amplify.aws/nextjs/build-a-backend/data/
 */
const schema = a.schema({
  Kid: a
    .model({
      name: a.string().required(),
      pinHash: a.string().required(),
      avatarKey: a.string(),
      balanceCents: a.integer().default(0),
      chores: a.hasMany('ChoreCompletion', 'kidId'),
      ledgerEntries: a.hasMany('LedgerEntry', 'kidId'),
      redemptions: a.hasMany('Redemption', 'kidId'),
    })
    .authorization((allow) => [allow.owner()]),

  Chore: a
    .model({
      name: a.string().required(),
      description: a.string(),
      valueCents: a.integer().required(),
      active: a.boolean().default(true),
      completions: a.hasMany('ChoreCompletion', 'choreId'),
    })
    .authorization((allow) => [allow.owner()]),

  ChoreCompletion: a
    .model({
      kidId: a.id().required(),
      kid: a.belongsTo('Kid', 'kidId'),
      choreId: a.id().required(),
      chore: a.belongsTo('Chore', 'choreId'),
      completedAt: a.datetime().required(),
      status: a.enum(['PENDING', 'APPROVED', 'REJECTED']),
    })
    .authorization((allow) => [allow.owner()]),

  LedgerEntry: a
    .model({
      kidId: a.id().required(),
      kid: a.belongsTo('Kid', 'kidId'),
      amountCents: a.integer().required(),
      reason: a.string().required(),
      createdAt: a.datetime().required(),
    })
    .authorization((allow) => [allow.owner()]),

  Reward: a
    .model({
      name: a.string().required(),
      costCents: a.integer().required(),
      active: a.boolean().default(true),
      redemptions: a.hasMany('Redemption', 'rewardId'),
    })
    .authorization((allow) => [allow.owner()]),

  Redemption: a
    .model({
      kidId: a.id().required(),
      kid: a.belongsTo('Kid', 'kidId'),
      rewardId: a.id().required(),
      reward: a.belongsTo('Reward', 'rewardId'),
      redeemedAt: a.datetime().required(),
      status: a.enum(['REQUESTED', 'FULFILLED']),
    })
    .authorization((allow) => [allow.owner()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});
