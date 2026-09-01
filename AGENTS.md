# Agent Instructions

## MANDATORY: SKILL DISCOVERY

Before doing ANY work, you MUST inspect the `SKILLS/` directory.

This is a mandatory pre-task step, not a suggestion.

### Required sequence

1. Inspect the `SKILLS/` directory.
2. Read `SKILLS/README.md` if it exists.
3. Identify every skill relevant to the requested task.
4. Read the relevant `SKILL.md` files.
5. Apply those instructions during planning and implementation.
6. Only after completing the above may you modify project files.

Never skip this process, even when:
- the task appears trivial
- the requested change is only one line
- you believe you already know the solution
- the relevant skill seems obvious
- the task is a UI-only change

### Anti-Slop Requirement

If `SKILLS/anti-slop/SKILL.md` exists, it MUST be read before creating
or modifying UI, UX, styling, layouts, components, pages, or visual design.

The anti-slop skill is authoritative for avoiding generic AI-generated
design patterns and low-quality implementation.

Do not create:
- generic AI-looking layouts
- unnecessary gradients
- excessive rounded cards
- meaningless glassmorphism
- arbitrary decorative elements
- repetitive card grids
- generic hero sections
- excessive badges
- unnecessary animations
- placeholder-like copy
- visually interchangeable components

Prefer intentional design decisions based on the project's existing
visual language and the actual purpose of the interface.

### Implementation Rule

Do not write implementation code until the required skills have been read.

When a skill provides a specific convention or constraint, follow it unless
a higher-priority instruction conflicts with it.

### Validation

After implementation:

1. Verify the changes against the relevant skills.
2. Check that no anti-slop requirements were violated.
3. Run appropriate validation or tests.
4. Fix issues before finishing.