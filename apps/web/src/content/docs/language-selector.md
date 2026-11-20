---
title: Language Selector
description: Links to available language versions of a page.
navLabel: Language Selector
order: 20
figma: https://www.figma.com/design/jQ3EiYqe3uEvFbid5ewc41/Colorado-Design-System?node-id=7188-127
accessibilityStatus: Automated accessibility checks (axe) pass for both preview states. Manual accessibility review is pending.
---

## Guidance

### When to use

Use a language selector to link to translated versions of a page that you provide. Each link goes to an existing translation at its own URL. The component does not translate content, detect a visitor's browser language, or redirect anyone automatically.

Don't use a language selector when the site has no translated pages to link to. Don't add a control that does nothing.

Choose a variant by the number of languages:

| Variant                 | Use when                                                                    | Don't use when                                                           |
| ----------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Two languages (default) | The page is available in exactly two languages. Both links stay visible.    | There are three or more languages; the links would crowd the header.     |
| Multiple languages      | The page is available in three or more languages. A button opens the links. | There are only two languages; a disclosure hides a choice for no reason. |

Place the language selector in the site header, at the top right above or beside the primary navigation, as shown in Figma. Keep it in the same place on every page so visitors who don't read the current language can find it. To add it to the [Header](../header/), follow the Header page's instructions for the language control.

### Writing for language selectors

- Label each language in that language, for example "Español", not "Spanish". People who don't read the current page's language need to recognize their own.
- In the multiple-languages list, add the English name in parentheses after the native label, for example "Español (Spanish)".
- Label the current language too, and mark it as the current page.
- Link to a page that collects other translated content, such as "Selected content in additional languages", only when that page exists.

### Accessibility for language selectors

- The selector is a `<nav>` landmark named "Languages". If a page has more than one language selector, give each a distinct `aria-label`.
- Each language is a link. Set `lang` on the link, or on the native-language label inside it, to the destination's language so screen readers pronounce the label correctly. Set `lang="en"` on the English name in parentheses.
- Set `hreflang` on each link to the destination page's language, and `aria-current="page"` on the link to the current language.
- In the multiple-languages variant, the "Languages" button reports whether the list is expanded or collapsed. Tab moves to the button; Enter or Space opens or closes the list, and Tab moves through the links. Escape closes the list and returns focus to the button.
- Without JavaScript, the button stays hidden and every link is visible. Don't add `hidden` to the list in server-rendered markup.

## Specifications

### Variants and elements

Pair each CoDS class with its USWDS class. The `usa-*` classes are the upstream integration markup.

| Class                             | Use                                                                                                                                      |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `cods-language-selector`          | `<nav>` root; pair with `usa-language-container`. Add `usa-language` for the multiple-languages variant.                                 |
| `cods-language-selector__links`   | Two languages: the `<ul>` of links shown side by side; pair with `usa-list usa-list--unstyled`.                                          |
| `cods-language-selector__trigger` | Multiple languages: the native `type="button"`; pair with `usa-button usa-language__link`. Place it inside `usa-language__primary-item`. |
| `cods-language-selector__panel`   | Multiple languages: the `<ul>` the button controls; pair with `usa-language__submenu`. Each item uses `usa-language__submenu-item`.      |

The multiple-languages button sits in a `<ul class="usa-language__primary usa-accordion">` with one `<li class="usa-language__primary-item">` that also contains the panel.

| Attribute                                 | Use                                                                                                          |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `data-cods-language-selector`             | Marks the multiple-languages root the controller initializes.                                                |
| `data-cods-language-selector-trigger`     | Marks the button. Also set `aria-controls` to the panel's `id`, and `hidden`.                                |
| `data-cods-language-selector-panel`       | Marks the panel. Give it an `id` that is unique on the page.                                                 |
| `lang`, `hreflang`, `aria-current="page"` | On each link, as described in [Accessibility for language selectors](#accessibility-for-language-selectors). |

The controller adds `data-cods-language-selector-enhanced` to an initialized root and sets `aria-expanded` on the button. Don't author or change them. The two-languages variant has no JavaScript.

### Initializing the controller

Load `@coloradodigitalservice/colorado-design-tokens/tokens.css` and `@coloradodigitalservice/colorado-design-system/styles.css` once, as described in [Getting started](../getting-started/). The controller bundles the pinned USWDS language selector behavior, so don't load a separate USWDS script or auto-initializer on these roots.

```js
import {
  initAllLanguageSelector,
  destroyLanguageSelector,
} from '@coloradodigitalservice/colorado-design-system';

initAllLanguageSelector(document);

// Before removing or replacing a selector:
const root = document.querySelector('[data-cods-language-selector]');
destroyLanguageSelector(root);
```

| Function                             | Behavior                                                                                                                                           |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `initLanguageSelector(root)`         | Initializes one connected root: shows the button and hides the list. Repeated calls are safe. Invalid markup logs a warning and is left unchanged. |
| `initAllLanguageSelector(container)` | Initializes every root in a container (default `document`), including the container itself.                                                        |
| `destroyLanguageSelector(root)`      | Removes listeners and restores the authored markup, so the links are visible again. Other selectors on the page keep working.                      |

The markup is invalid, and the links stay visible, when the button lacks `usa-language__link`, the panel lacks `usa-language__submenu`, the panel `id` is missing or not unique, or `aria-controls` doesn't match it.

When the list opens or closes, the root dispatches a bubbling `cods-language-selector:change` event with `detail: { expanded }`, which is `true` when the list opened. TypeScript users can import the `LanguageSelectorChangeDetail` type. Initialization and teardown don't dispatch events.

```js
document.addEventListener('cods-language-selector:change', (event) => {
  console.log(event.detail.expanded);
});
```

### Limitations

- The component links to translations you provide. It does not translate content, store a language preference, or redirect visitors.
- The controller doesn't watch the DOM. Call `initAllLanguageSelector()` after inserting new markup, and destroy a selector before removing it.
- The list opens below the button, 200px wide, and aligns to the button's end edge. It doesn't reposition to avoid the bottom of the viewport.
- The list opens and closes without animation.
