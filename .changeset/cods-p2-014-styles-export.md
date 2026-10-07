---
'@coloradodigitalservice/colorado-design-system': patch
---

Add the `/styles.css` stylesheet export and retain `/styles` as a compatibility
alias to the same built CSS file. Update repository imports and documentation
to prefer `/styles.css`, removing the dedicated ambient declarations in the
web and Storybook apps.
