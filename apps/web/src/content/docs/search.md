---
title: Search
description: Let people search site content.
navLabel: Search
order: 24
figma: https://www.figma.com/design/jQ3EiYqe3uEvFbid5ewc41/Colorado-Design-System?node-id=462-1419
accessibilityStatus: Automated accessibility checks (axe) pass for every preview state. Manual accessibility review, including screen-reader testing, is pending.
---

## Guidance

### When to use

Use Search to help people find content by entering terms. Search is a form that submits a query to a search endpoint you provide; it does not provide search results or autocomplete.

Choose a variant that fits the space and how clear the purpose of the search is from its surroundings:

| Variant | Use when                                                                                                                                                                                                                                       | Don't use when                                                                                                                              |
| ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Default | The purpose or scope of the search needs a visible label, search is the main action on the page, or people benefit from reading a label before they type. A visible label matters most to people who are less confident with digital services. | Space is constrained, such as a site header or navigation bar. The visible label and separate submit button crowd the other controls there. |
| Compact | Space is constrained, such as a site header or navigation bar, the surrounding context makes the purpose clear, and there is room for a labeled submit button.                                                                                 | The purpose or scope of the search needs explaining. Use the default variant.                                                               |
| Slim    | Space is tightest, including mobile menus, and only an icon-only submit button fits.                                                                                                                                                           | There is room for a text submit button. Use the compact variant.                                                                            |

### Accessibility for search

- Each form has `role="search"`, which makes it a search landmark. If a page has more than one search landmark, give each a distinct `aria-label`.
- Give every input an associated `label`, even when it is visually hidden. The compact and slim variants hide their label with `cods-search__label--hidden`, which keeps it in the accessibility tree.
- Give the slim variant's icon-only submit button an accessible name with `aria-label`. The icon itself is decorative and has `aria-hidden="true"`.
- People reach the input and then the submit button with the Tab key. Enter in the input or activating the button submits the form using the browser's normal form behavior; Search adds no JavaScript.

## Specifications

### Variant classes

| Class                        | USWDS class   | Use                                                                                                                                                                                |
| ---------------------------- | ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `cods-search`                | `usa-search`  | Required on the `form` element.                                                                                                                                                    |
| `cods-search--default`       | —             | Visible label above the input and a text submit button, separated by a gap.                                                                                                        |
| `cods-search--compact`       | —             | Visually hidden label; the input and text submit button are joined.                                                                                                                |
| `cods-search--slim`          | —             | Visually hidden label; small input joined to an icon-only slim button. Add `cods-input__control--small` to the input and `cods-button--slim cods-button--icon-only` to the button. |
| `cods-search__controls`      | —             | Wraps the input and submit button in a row. Required.                                                                                                                              |
| `cods-search__label--hidden` | `usa-sr-only` | Hides the label visually while keeping it available to assistive technologies. Use it instead of `usa-sr-only`.                                                                    |

The input uses the Input component's `usa-input cods-input__control` classes, the label uses `usa-label cods-input__label`, and the button uses the Button component's `usa-button cods-button` classes.

Search has no component-specific custom properties.

### Connecting your search endpoint

Set the form's `action` to your search results page and `method="get"`, and set the input's `name` to your endpoint's query parameter. The examples use `action="/search/"` and `name="q"`. The form submits without JavaScript. The preview forms on this page submit to this page, so they show the submitted query in the address bar but do not return search results.

### Adding the search icon

The slim variant's icon references the package icon sprite with `<use href="/icons/sprite.svg#magnifying-glass">`. Change the sprite URL to where your deployment serves `icons/sprite.svg` from the package.
