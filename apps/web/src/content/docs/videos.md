---
title: Videos
description: Present accessible native and embedded video.
navLabel: Videos
order: 23
figma: https://www.figma.com/design/jQ3EiYqe3uEvFbid5ewc41/Colorado-Design-System?node-id=3728-36680
---

## When to use

Use video when moving images or sound help explain the content. Do not autoplay. Give people a transcript and accurate synchronized captions for prerecorded video. Include audio description when needed to convey important visual information.

## Native video

Use a native `video` element with `controls`, a poster, and a `track` of kind `captions`. The demonstration video and caption track are placeholders: replace both with your own media and accurate captions. Provide a transcript alongside the video. Browser controls vary by browser and operating system.

## Embedded video

Give every iframe a descriptive `title` and make sure the chosen provider offers keyboard-accessible controls and accurate captions. Provide a transcript outside the player. The embed example loads a third-party provider and is only a markup demonstration; confirm captions and permissions for the actual video before publishing.

Wrap the player in `cods-videos` for 16:9; add `cods-videos--four-three` for 4:3. The wrapper fills its container; constrain the container as needed. The design is a work in progress, and the proposed expandable transcript treatment needs design and accessibility review.

## Examples

These examples and copyable markup come from the component fixture.
