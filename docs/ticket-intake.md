# Ticket intake procedure

How content-platform takes a tracker ticket from Open to verified
implementation. This is the written-down version of what the leads do by
hand; follow it exactly. See also: docs/reconcile-policy.md for the drift
procedure, CLAUDE.md for system causality.

## When this applies

Any Open ticket with written acceptance criteria. Tickets WITHOUT
acceptance criteria go back to the reporter; we do not guess scope. That
is the SB-31 rule: in March an engineer implemented from the ticket title
alone, missed the "no change to publish-path behavior" criterion in the
description, and scheduled publishes were broken for an afternoon.

## Preconditions

- Ticket exists and is Open (tracker, or data/tickets.json)
- Acceptance criteria are present and unambiguous
- Working tree is clean; work happens on a branch named sb-<id>-<slug>,
  never on main

## Steps

1. Pull the ticket. Restate the scope in two sentences and list the
   acceptance criteria; this restatement is the contract.
2. Write the spec to specs/SB-<id>.md: contracts, edge cases, explicit
   out-of-scope list.
3. Write failing tests first: one per acceptance criterion, in test/.
   Red before any implementation.
4. Implement the smallest diff that turns the suite green.
5. Run the full suite. Report: spec link, tests added, diff summary,
   before/after behavior.

## Stop conditions

- An acceptance criterion conflicts with CLAUDE.md policy: stop and flag;
  do not pick a side.
- The change would touch the publish path when the ticket says it must
  not: stop.
- More than 5 files need edits: stop and propose splitting the ticket.

## Recovery

- One branch per ticket. If the suite cannot go green within scope,
  reset to the branch point and report why; never leave a red branch.

## Minimum signal

- A ticket re-opened twice gets a human review before a third attempt.
