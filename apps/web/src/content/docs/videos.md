---
title: Videos
description: Present accessible native and embedded video.
navLabel: Videos
order: 23
figma: https://www.figma.com/design/jQ3EiYqe3uEvFbid5ewc41/Colorado-Design-System?node-id=3728-36680
accessibilityStatus: Automated accessibility checks (axe) pass for every preview state. Manual accessibility review, including keyboard, screen-reader, caption, and transcript checks, is pending.
---

## Guidance

### When to use

Use video when moving images or sound help explain a service, demonstrate a task, or convey information that is difficult to show in text or still images. Introduce the video with enough context for people to decide whether to play it.

Choose the player that fits the media:

| Variant                | Use when                                                                             | Don't use when                                                           |
| ---------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------ |
| Native video (default) | You host the media file and its caption track, and the media is 16:9.                | The video is published on a provider such as Vimeo or YouTube.           |
| Embedded player        | The video is published on a provider and you use the provider's embed URL.           | The provider can't supply captions or a usable keyboard-operable player. |
| 4:3                    | The native or embedded media was produced at 4:3, so 16:9 would add bars or crop it. | The media is 16:9.                                                       |

Don't use video when:

- It is the only way to access essential information. If the same information is clearer as text, an image, or a short list, use that format instead.
- Meaning depends on sound alone.
- It would play automatically. Let people choose to start playback.

The Figma design shows an expandable transcript. That treatment is still under review and is not part of this component; provide a readily available transcript alongside the player.

### Accessibility for videos

- Provide accurate synchronized captions for prerecorded video, including relevant sounds as well as speech. Use a `track` with `kind="captions"` on native video.
- Provide a transcript outside the player so people can read the content without playing it.
- Include audio description when needed to convey important visual information.
- Make sure captions and transcripts match the actual video.
- Name every player. Give a native `video` an `aria-label` that identifies the video, and give an embedded `iframe` a descriptive `title`.
- Don't autoplay. Keep native `controls` on every `video`.
- Native controls come from the browser and vary by browser and operating system; embedded controls come from the provider. Check that people can reach and operate all controls with a keyboard, including captions and fullscreen where available, and can move focus out of the player.
- Keep the player and its controls usable at narrow widths and high zoom.

## Specifications

### Variants and elements

Videos is CoDS-authored; USWDS has no equivalent, so there are no `usa-*` classes to pair.

| Class                     | Use                                                               |
| ------------------------- | ----------------------------------------------------------------- |
| `cods-videos`             | Wrapper for one `video` or `iframe`. Fills its container at 16:9. |
| `cods-videos--four-three` | Add to the wrapper for 4:3 media.                                 |

The wrapper sets the aspect ratio and makes its direct `video` or `iframe` child fill it without a border.

### Native video

Load the package styles as described in [Getting started](../getting-started/). Give the `video`:

| Attribute or element    | Use                                                                 |
| ----------------------- | ------------------------------------------------------------------- |
| `controls`              | Required. Shows the browser's playback controls.                    |
| `aria-label`            | Required. Names the video for assistive technology.                 |
| `poster`                | An image shown before playback.                                     |
| `preload="metadata"`    | Loads duration and dimensions without downloading the whole file.   |
| `source`                | The media file and its `type`.                                      |
| `track kind="captions"` | Required. The caption file, with `srclang`, `label`, and `default`. |
| Fallback text           | Text inside `video` for browsers that can't play it.                |

The preview's native video is a silent blue screen. Replace the media, poster, and caption track with your own.

### Embedded players

Wrap the provider's `iframe` in `cods-videos`. Give it a descriptive `title`, `loading="lazy"`, and `allowfullscreen`. Keep `allow` to the capabilities the player actually needs.

The preview embeds a Vimeo player with the provider's do-not-track option (`dnt=1`) and the English text track requested (`texttrack=en`). Replace the `src` with your own provider embed URL. Prefer a provider option that limits tracking where one exists.

Media owners are responsible for the provider's accessibility, captions, transcript, privacy practices, and permissions for each video before publishing. The CoDS wrapper doesn't change any of these.

### Sizing

The wrapper fills the width of its container. Constrain the containing element to the size appropriate for the page; the player scales with it.

### Variable settings

Videos has no custom properties.

### Package files

The fixture, metadata, and examples are available from `@coloradodigitalservice/colorado-design-system` under `fixtures/videos.html`, `metadata/videos.json`, and `examples/videos.json`. The sample `/videos/` media files are for the documentation and Storybook examples only.

### Limitations

- Only 16:9 and 4:3 aspect ratios are supported.
- The wrapper has no JavaScript controller. Provider embeds may require JavaScript and network access.
- A transcript disclosure is not included.
- Embedded player accessibility and caption availability depend on the provider and the video.
