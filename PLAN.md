# Allowance app — build-out plan

Scaffolding (Next.js + Amplify Gen 2 auth/data, local sandbox, GitHub → Amplify
Hosting on `main`) is done. This tracks the remaining feature work as
independent phases, each sized for roughly one session.

**How to use this file**: start a new session and say something like
"implement Phase 2 from PLAN.md". Check off boxes and commit PLAN.md as you
finish a phase, so progress survives across sessions. Phases are ordered by
dependency — do them roughly in order.

## Phase 1 — Parent authentication UI ✅
- [x] Sign up / confirm sign up (email code) / sign in / sign out / forgot
      password screens, using `aws-amplify/auth` APIs
- [x] Protect all app routes behind auth (this Next.js version renamed
      `middleware.ts` to `proxy.ts` — see `src/proxy.ts` — using
      `runWithAmplifyServerContext` from `src/utils/amplify-server-utils.ts`)
- [x] Redirect unauthenticated users to sign-in
- **Done when**: you can sign up, verify email, log in/out, and can't reach
  any page without being logged in.

## Phase 2 — Kid profiles (parent-side) ✅
- [x] CRUD UI for the `Kid` model: name, avatar, PIN
- [x] Decide + implement PIN hashing (a Lambda/custom mutation is more
      correct than hashing in the browser — flag this as a decision to make
      at the start of the session)
      - Decided: client-side hashing (Web Crypto SHA-256 + random salt, see
        `src/utils/pin.ts`). A Kid record is already owner-scoped to the
        parent's Cognito identity, and a 4-6 digit PIN is a UX gate on an
        already-authenticated session rather than an independent auth
        boundary, so a Lambda custom mutation would add real infra for
        marginal security benefit.
- **Done when**: parent can add/edit/remove kid profiles, each with a PIN.

## Phase 3 — Chore management (parent-side) ✅
- [x] CRUD UI for the `Chore` model: name, description, value, active toggle
- [x] Decide whether chores are global (any kid can do them) or assigned to
      specific kids — current schema has no assignment field, may need one
      - Decided: chores are assigned to one specific kid. Added a required
        `kidId`/`kid` belongsTo relation on `Chore` (and `assignedChores`
        hasMany on `Kid`) in `amplify/data/resource.ts`.
- **Done when**: parent can create/edit/deactivate chores with dollar values.

## Phase 4 — Kid login / profile switcher ✅
- [x] "Who's doing chores?" screen listing kid avatars
- [x] PIN entry that checks against `pinHash`, sets an "active kid" client
      session (separate from the parent's Cognito session)
      - Decided: PIN verification happens server-side in a Server Action
        (`src/app/switch-kid/actions.ts`), so `pinHash` never reaches the
        kid picker's client bundle. The active-kid session is a plain
        (unsigned) httpOnly cookie, not cryptographically signed — every
        `Kid` record is owner-scoped to the parent's Cognito session
        regardless of this cookie's value, so a tampered cookie can only
        mislead the UI about which already-authorized kid is "active," not
        grant access beyond the signed-in parent's account. Same reasoning
        as the Phase 2 PIN-hashing decision.
- **Done when**: a kid can pick their profile, enter their PIN, and land on
  their own view.

## Phase 5 — Kid chore completion flow ✅
- [x] Kid-facing view of their active chores
- [x] Mark chore complete → creates `ChoreCompletion` with status `PENDING`
      - Decided: the "mark done" mutation runs client-side (like the Phase 3
        chore CRUD) rather than as a Server Action — unlike the Phase 2 PIN
        hash, a `ChoreCompletion` record has no secret to keep out of the
        client bundle, so the extra indirection isn't worth it. The kid page
        passes `activeKidId` down as a prop (read server-side from the
        cookie) so the client mutation can't be pointed at an arbitrary kid
        without already having a valid active-kid session.
- **Done when**: kid can mark chores done; parent can see what's pending.
  (The parent-facing pending view/approval UI is Phase 6 — the
  `ChoreCompletion` records are already queryable under the parent's
  account in the meantime.)

## Phase 6 — Parent approval + ledger posting ✅
- [x] Parent view of pending `ChoreCompletion`s, approve/reject
- [x] On approve: create a `LedgerEntry` and update `Kid.balanceCents`
      - Decided: approve/reject run as Server Actions
        (`src/app/approvals/actions.ts`), unlike the Phase 3/5 client-side
        mutations. Approval is three dependent writes (mark the completion
        `APPROVED`, create a `LedgerEntry`, bump `Kid.balanceCents`) that
        need to happen together, and the action re-checks the completion is
        still `PENDING` before applying them — guarding against a
        double-click or two open tabs double-crediting a kid's balance in a
        way a bare client mutation wouldn't.
- **Done when**: approving a completed chore updates the kid's balance.

## Phase 7 — Piggy bank visualization
- [ ] Kid-facing balance display (the "piggy bank fills up" visual)
- [ ] Ledger/history view of past earnings
- **Done when**: kid sees their balance visually and can view history.

## Phase 8 — Rewards catalog + redemption
- [ ] Parent CRUD for the `Reward` model
- [ ] Kid-facing reward browsing + redeem action → `Redemption` (`REQUESTED`)
- [ ] Parent fulfillment view → mark `FULFILLED`, deduct balance
- **Done when**: kid can redeem a reward if their balance covers it; parent
  can mark it fulfilled.

## Phase 9 — Polish & hardening
- [ ] Mobile-responsive pass (kids likely use a phone/tablet)
- [ ] Empty/loading/error states throughout
- [ ] Review and tighten authorization rules
- [ ] Basic test coverage for the approval/ledger logic (money math is the
      one place bugs actually cost something)

## Phase 10 — Stretch ideas (optional, not scoped yet)
- Recurring/scheduled chores (EventBridge + Lambda to reset daily/weekly)
- Parent email notifications when a kid completes a chore (SES)
- Multi-parent / co-parent access to the same family account
