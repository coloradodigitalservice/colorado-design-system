---
title: Language Selector
description: Links to available language versions of a page.
navLabel: Language Selector
order: 20
figma: https://www.figma.com/design/jQ3EiYqe3uEvFbid5ewc41/Colorado-Design-System?node-id=7188-127
---

Use a language selector to link to translated versions of a page that you provide. Each link goes to an existing translation at its own URL. The component does not translate content, detect a visitor's browser language, or redirect anyone automatically.

For two languages, show both links. For three or more, use the disclosure example. Each link needs a real destination, a native-language label, and matching `lang` and `hreflang` attributes. Mark the current page with `aria-current="page"`.

## Placement

Place the language selector in the site header, at the top right above or beside the primary navigation, as shown in Figma. Keep it in the same place on every page so visitors who don't read the current language can find it.

## JavaScript

The links remain visible without JavaScript. To enable every disclosure on the page, call `initAllLanguageSelector` after the markup is in the document:

```js
import { initAllLanguageSelector } from '@coloradodigitalservice/colorado-design-system';
initAllLanguageSelector();
```

`initAllLanguageSelector(container)` also accepts an element to limit the search to part of the page. To manage one disclosure, for example when a framework adds or removes it, use `initLanguageSelector` and `destroyLanguageSelector`:

```js
import {
  initLanguageSelector,
  destroyLanguageSelector,
} from '@coloradodigitalservice/colorado-design-system';

const selector = document.querySelector('[data-cods-language-selector]');
initLanguageSelector(selector);
// Later, before removing the markup:
destroyLanguageSelector(selector);
```

Initializing an element twice has no effect. `destroyLanguageSelector` removes the listeners and restores the original markup, so the links are visible again. Destroying one selector does not affect others on the page.

If the required USWDS markup is missing (such as the `usa-language__link` class on the button, or a panel ID that matches `aria-controls`), the selector is not enhanced. A warning is logged to the console and the links stay visible.

## Events

When the disclosure opens or closes, the root element dispatches a `cods-language-selector:change` event. The event bubbles, so you can listen on the root or any ancestor. `event.detail.expanded` is `true` when the list opened and `false` when it closed.

```js
document.addEventListener('cods-language-selector:change', (event) => {
  console.log(event.detail.expanded);
});
```

## Accessibility

Give each disclosure a unique panel ID and matching `aria-controls`. The button opens and closes the list. Escape closes it and returns focus to the button.
