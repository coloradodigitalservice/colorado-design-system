---
title: Getting started
description: A representative page for the Colorado Design System documentation foundation.
navLabel: Getting started
order: 1
---

This page explains how to install the Colorado Design System development release and use the two components documented so far: [Site Alert](/site-alert/) and [Accordion](/accordion/). Both are **experimental** in the `0.x` series: markup, tokens, custom properties, and controller APIs may change between releases, and the release is not supported.

## Use the design system

The documentation site consumes the design-system package and its generated tokens. Component behavior belongs to the design-system package, not to this site.

## Install the development release

The packages are not yet published to npm. Download the two npm archives (`coloradodigitalservice-colorado-design-tokens-*.tgz` and `coloradodigitalservice-colorado-design-system-*.tgz`) from the GitHub prerelease, verify them against `SHA256SUMS`, and install both together because they depend on each other at an exact version:

```sh
npm install ./coloradodigitalservice-colorado-design-tokens-<version>.tgz ./coloradodigitalservice-colorado-design-system-<version>.tgz
```

Consumers without a package manager can use the `colorado-design-system-*.tar.gz` archive from the same release, which contains the built `dist/` files and token outputs. See the repository's release documentation for the full contents and verification steps.

## Load the styles

Load the token custom properties, then the design-system stylesheet, once per page. Components read `--cods-*` custom properties from the tokens, so both are required:

```js
import '@coloradodigitalservice/colorado-design-tokens/tokens.css';
import '@coloradodigitalservice/colorado-design-system/styles.css';
```

The stylesheet places USWDS in the lowest cascade layer and CoDS rules in the `cods.*` layers above it, so your own unlayered CSS overrides both.

## Choose a component

- [Site Alert](/site-alert/): a static sitewide notice. Needs no JavaScript.
- [Accordion](/accordion/): related collapsible sections. Import and initialize the controller as described on its page.

Each component page links to its canonical HTML fixture and metadata, which are the same files used by Storybook and the automated tests.
