---
'@coloradodigitalservice/colorado-design-system': patch
---

Validate copied fonts and images while preserving their
filenames, bytes, and relative CSS URLs. Eliminate expected unresolved-asset
warnings and fail builds when a stylesheet references a missing packaged file,
including during watch rebuilds.
