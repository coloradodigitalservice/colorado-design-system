---
title: Search
description: Let people search site content.
navLabel: Search
order: 24
figma: https://www.figma.com/design/jQ3EiYqe3uEvFbid5ewc41/Colorado-Design-System?node-id=462-1419
---

## When to use

Use Search to help people find content by entering terms.

Use the default variant when the purpose of the search is not clear from its surroundings, or when people benefit from reading a visible label before they type. A visible label matters most to people who are less confident with digital services, who may not recognize an unlabeled field or a magnifying-glass icon as a search. Prefer the default variant when search is the main action on the page, or when the scope of the search needs explaining.

Avoid the default variant in constrained spaces such as a site header or a navigation bar. Its visible label and full-width submit button crowd the other controls there.

Use the compact variant in those constrained spaces, where the surrounding context already makes the purpose of the search clear and there is still room for a labeled submit button.

Use the slim variant where space is tightest, including mobile menus, where only an icon-only submit button fits.

## Markup and accessibility

Set the form action and query parameter for your own search endpoint. The form submits normally without JavaScript; it does not provide search results or autocomplete. Give every input an associated label, even when visually hidden. The compact and slim variants hide their label with `cods-search__label--hidden`, which clips the label in place rather than parking it off-canvas, so it stays in the accessibility tree without widening the page in a right-to-left document. Give an icon-only button an accessible name. If a page has multiple search landmarks, give each a distinct accessible label. Use the package icon sprite for the slim search icon and adjust its URL for your deployment.

Search is experimental. Human design and accessibility review remain open.

## Examples

The examples and copyable markup come from the component fixture.
