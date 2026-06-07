---
name: intake
description: Take a tracker ticket from Open to verified implementation; spec first, failing tests second, smallest green diff third. Use when asked to work a ticket (SB-123), pick up the next open ticket, or turn a ticket into code. Not for tickets without acceptance criteria; those go back to the reporter (the SB-31 rule).
---

# Ticket intake

## Preconditions
- Ticket exists and is Open (tracker MCP get_ticket, or data/tickets.json)
- Acceptance criteria present and unambiguous; if not, STOP and ask the
  reporter. Never guess scope.
- Working tree clean. Create branch sb-<id>-<slug>; never work on main.

## Steps
1. Pull the ticket. Restate scope in two sentences; list the acceptance
   criteria. This restatement is the contract.
2. Write the spec to specs/SB-<id>.md: contracts, edge cases, explicit
   out-of-scope.
3. Write failing tests FIRST, one per acceptance criterion. Red before
   any implementation.
4. Implement the smallest diff that turns the suite green.
5. Run the full suite (npm test). Report: spec link, tests added, diff
   summary, before/after.

## Stop conditions
- Acceptance criterion conflicts with CLAUDE.md policy: stop and flag.
- Change would touch the publish path when the ticket says it must not.
- More than 5 files need edits: stop and propose splitting the ticket.

## Recovery
- One branch per ticket; if the suite cannot go green within scope,
  reset to the branch point and report why. Never leave a red branch.

## References
- docs/ticket-intake.md
- CLAUDE.md
