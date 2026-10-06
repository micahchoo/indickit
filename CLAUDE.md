indickit: small, exact utilities for text in Indian languages, in Go and TypeScript.

Read first, every session: `MAINTAINING.md` (the steps), then `DESIGN.md` (the principles, and the mistake behind each).

Read when the task reaches it:
- Current state and the terms: `../linguistic-utilities/STATUS.md` and `../linguistic-utilities/CONTEXT.md`.
- A rules file or a conformance file: both are written by the research repo (`../linguistic-utilities/eval/export.py`). Change a rule there, then export again.

Write invisible characters (ZWJ, ZWNJ, ZWSP) in source as `\u` escapes; editing tools tend to write the character itself, so check with `cat -A`.
