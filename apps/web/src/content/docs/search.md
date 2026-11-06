---
title: Search
description: Let people search site content.
navLabel: Search
order: 24
figma: https://www.figma.com/design/jQ3EiYqe3uEvFbid5ewc41/Colorado-Design-System?node-id=462-1419
---

## When to use

Use Search to help people find content by entering terms. Use the default variant when search is prominent or needs a visible label. Compact and slim variants suit constrained spaces such as a header, where the surrounding context makes their purpose clear. Avoid compact or slim when search is the main action or needs more explanation.

## Markup and accessibility

Set the form action and query parameter for your own search endpoint. The form submits normally without JavaScript; it does not provide search results or autocomplete. Give every input an associated label, even when visually hidden. Give an icon-only button an accessible name. If a page has multiple search landmarks, give each a distinct accessible label. Use the package icon sprite for the slim search icon and adjust its URL for your deployment.

Search is experimental. Human design and accessibility review remain open.

## Examples

The examples and copyable markup come from the component fixture.
