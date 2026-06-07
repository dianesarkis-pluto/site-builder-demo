---
name: new-skill
description: Scaffold a new reusable skill, either through a short interview or directly from a policy doc / runbook ("/new-skill <name> from <path>"). Use when someone says "make this a skill", "codify this workflow", or has just done the same procedure by hand for the second time. Not for one-off tasks; skills are for procedures that repeat.
---

# /new-skill [name] [from <doc>]

Interview the user, then generate a production-grade SKILL.md. Ask the
questions in one batch. Do not pad the scaffold with rules the user did not
give you; an invented constraint is worse than a missing one.

## From a doc

When the user points at a policy doc, runbook, or transcript
(`/new-skill <name> from <path>`), that doc is the answer sheet: skip the
interview, map its rules onto the scaffold below, and list any interview
question the doc leaves unanswered as open questions at the end of the
draft. Do not invent rules to fill the gaps.

## The interview

1. **Procedure.** The steps in order, as you'd dictate them to a new
   teammate. (Or point me at the doc or transcript where you last did it.)
2. **Triggers.** When should this run, and when should it NOT be used?
3. **Preconditions.** What must be true before step 1? Cheapest checks first.
4. **Stop conditions.** What result mid-run means "stop and ask a human"?
5. **Recovery.** If the result is wrong, how do we get back? (snapshot,
   revert, backup)
6. **Verification.** What command or check proves it worked?
7. **Touched files.** Which files or modules does it read or change?
8. **War story** (optional). The incident that motivates the rules, in one
   line. It travels with the skill so the why survives the author.

## The scaffold

Write `.claude/skills/<name>/SKILL.md`:

- **frontmatter `description`**: one sentence of what, plus WHEN to use it
  and when not to. This is how the skill gets discovered; vague means it
  never fires.
- **`## Preconditions`**: from Q3, each as "check X; if not, stop and say so".
- **`## Steps`**: from Q1, numbered. Recovery (Q5) comes BEFORE the first
  mutating step. Verification (Q6) is the last step, not an afterthought.
- **`## Constraints`**: stop conditions (Q4) as hard rules with thresholds,
  never vibes. Recovery as a NEVER-skip. One scope unit per invocation so
  failures are attributable.
- **`## References`**: @-paths from Q7. Point at source files and policy
  docs instead of restating them; the skill should not drift from the truth
  it depends on.

## Final check

Reread the draft and ask: would this skill have survived the war story?
If a rule still lives only in someone's head, it is not in the skill yet.
Show the draft and ask for corrections before writing the file.
