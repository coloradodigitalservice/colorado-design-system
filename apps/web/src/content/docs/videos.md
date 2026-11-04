---
title: Videos
description: Present accessible native and embedded video.
navLabel: Videos
order: 23
figma: https://www.figma.com/design/jQ3EiYqe3uEvFbid5ewc41/Colorado-Design-System?node-id=3728-36680
---

## When to use

Use video when moving images or sound help explain a service, demonstrate a task, or convey information that is difficult to show in text or still images. Introduce the video with enough context for people to decide whether to play it.

Videos is **experimental**. The [Videos design in Figma](https://www.figma.com/design/jQ3EiYqe3uEvFbid5ewc41/Colorado-Design-System?node-id=3728-36680) is a work in progress; design and human accessibility review remain open.

## When not to use

Do not use a video as the only way to access essential information. If the same information is clearer as text, an image, or a short list, use that format instead. Do not autoplay or rely on sound alone to communicate meaning.

## Anatomy and markup

Load the package styles as described in [Getting started](../getting-started/). Wrap a native `video` or an embedded `iframe` in `cods-videos`. Give the video an accessible name, native `controls`, a poster, a media source, and a `track` with `kind="captions"`. The native demonstration is a silent blue screen; replace the media, poster, and caption track with your own. Browser controls vary by browser and operating system.

For an embedded player, give the iframe a descriptive `title`. The example uses a local stand-in; replace its `src` with the provider’s HTTPS embed URL. Confirm the provider’s accessibility, captions, transcript, privacy practices, and permissions for your video before publishing.

## Captions, transcripts, and audio description

Provide accurate synchronized captions for prerecorded video, including relevant sounds as well as speech. Provide a transcript outside the player so people can read the content without playing it. Include audio description when needed to convey important visual information. Make sure captions and transcripts match the actual video and are available in its language.

The Figma design shows an expandable transcript. That treatment is still under review and is not part of this component; provide a readily available transcript alongside the player.

## Responsive behavior

The wrapper fills its container and uses a 16:9 aspect ratio. Add `cods-videos--four-three` for 4:3 media. Constrain the containing element to the size appropriate for the page; the player scales with it. Keep the player and its controls usable at narrow widths and high zoom.

## Keyboard and progressive enhancement

Native playback uses browser-provided controls; embedded playback depends on the provider. Check that people can reach and operate all controls with a keyboard, including captions and fullscreen where available. The CoDS wrapper has no JavaScript controller. Provider embeds may require JavaScript and network access.

## Assets and accessibility review

The fixture, metadata, and examples are available from `@coloradodigitalservice/colorado-design-system` under `fixtures/videos.html`, `metadata/videos.json`, and `examples/videos.json`. The sample `/videos/` assets are for the documentation and Storybook examples; provide your own media URLs when using the markup.

Automated checks supplement human review. Caption playback, keyboard and screen-reader operation, zoom, forced colors, localization, and design and accessibility-owner review remain open in the [accessibility evidence](https://github.com/coloradodigitalservice/colorado-design-system/blob/main/packages/colorado-design-system/src/components/videos/accessibility/videos.evidence.md).

## Examples

These examples and copyable markup come from the component fixture.
