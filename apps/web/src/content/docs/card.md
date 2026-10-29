---
title: Card
description: Group content or link to a service with a default or icon card.
navLabel: Card
order: 17
figma: https://www.figma.com/design/jQ3EiYqe3uEvFbid5ewc41/Colorado-Design-System?node-id=1624-459
---

## When to use

Use cards to group related content or help people navigate to a service. Keep titles concise and descriptions easy to scan. The icon card is for a single navigation destination; see the [icon design](https://www.figma.com/design/jQ3EiYqe3uEvFbid5ewc41/Colorado-Design-System?node-id=2246-770). Card is experimental in the `0.x` development series.

## Markup and links

Load the token and design system stylesheets as described in [Getting started](../getting-started/). Cards need no JavaScript. Keep the `usa-card` and `usa-card__*` classes alongside their `cods-card` counterparts. Choose the heading level that fits the surrounding page; the examples use `h3`, but it is not required.

For one destination, use the whole-card link shown in Default or With media. Give it a meaningful title and do not put links, buttons, or other interactive controls inside it. For multiple destinations, use a non-linked container and separate links, as in Internal links. Each link must describe its destination. Use the copyable markup above as a starting point.

Images need alt text when they convey information not already in the text. Use `alt=""` for decorative images, including an image that only repeats the linked title. Choose a suitable image and replace the example URL. Icon cards use the [CoDS icon sprite](../icon/); deploy the sprite and replace the example path with its public URL. Mark a decorative icon `aria-hidden="true"` and `focusable="false"`; convey any essential meaning in the link text.

## Layout

Place cards in a `ul` with `usa-card-group cods-card-group`, with each card in an `li`. The group wraps cards into columns where space allows and stacks them in narrow containers. The Card grid example above shows two cards in the same group; its markup is available to copy. Avoid overcrowding a row; the design recommends three or four cards at most. Content wraps and heading levels remain under the author's control.

## Accessibility

Links use native keyboard behavior. Authors should check focus order, link names, image alternatives, and heading order in their page. Human screen-reader and design review remain open; see the component evidence before considering it stable.
