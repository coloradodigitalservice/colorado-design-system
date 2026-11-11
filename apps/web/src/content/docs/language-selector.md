---
title: Language Selector
description: Links to available language versions of a page.
navLabel: Language Selector
order: 20
figma: https://www.figma.com/design/jQ3EiYqe3uEvFbid5ewc41/Colorado-Design-System?node-id=7188-127
---

Use a language selector to link to available translations. For two languages, show both links. For three or more, use the disclosure example. Each link needs a real destination, a native-language label, and matching `lang` and `hreflang` attributes. Mark the current page with `aria-current="page"`.

The links remain visible without JavaScript. To enable the disclosure, initialize it after adding the markup to the page:

```js
import { initAllLanguageSelector } from '@coloradodigitalservice/colorado-design-system';
initAllLanguageSelector();
```

Give each disclosure a unique panel ID and matching `aria-controls`. The button opens and closes the list. Escape closes it and returns focus to the button. This component does not translate content or redirect visitors based on their browser language.
