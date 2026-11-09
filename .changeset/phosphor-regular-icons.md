---
'@coloradodigitalservice/colorado-design-system': patch
---

BREAKING: Replace the curated icon list and catalog with the full Phosphor
Regular sprite, a compact ID index, and source-driven sprite and CSS asset
selection. Consumers must update catalog parsing and any per-icon SVG imports
that are not required by the packaged component CSS.
