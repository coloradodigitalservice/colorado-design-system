# USWDS tooltip: issue triage and drafts

Temporary working document. These are local drafts only; no issues or comments have been created or sent.

## Triage

- **New draft A:** Initialization removes focus from an already-focused trigger. No matching issue was found; [uswds/uswds#4055](https://github.com/uswds/uswds/issues/4055) concerns dynamic initialization, not preserving existing focus.
- **New draft B:** The tooltip hides when focus leaves even though the pointer still hovers over the trigger. No exact matching issue was found. The closed [uswds/uswds#5918](https://github.com/uswds/uswds/issues/5918) addressed moving the pointer from the trigger to the tooltip, not this mixed-input sequence.
- **Existing report:** [uswds/uswds#5950](https://github.com/uswds/uswds/issues/5950) describes viewport clipping on keyboard focus, including a discussion of scrolling, and is closed with an invitation to reopen if the issue persists. Two specific reproductions are drafted below as a follow-up rather than a duplicate issue. The open [uswds/uswds#6231](https://github.com/uswds/uswds/issues/6231) concerns clipping by an ancestor container, a different scenario.
- **Existing report:** A maintainer's [comment on uswds/uswds#6485](https://github.com/uswds/uswds/issues/6485#issuecomment-5722818128) explicitly mentions preserving existing descriptions. A focused reproduction is drafted below as a follow-up rather than a duplicate issue.
- The scaled-down hover failure found in CoDS did not reproduce with upstream behavior, so it is not proposed as a USWDS issue.

The checks used the unmodified CSS and JavaScript from USWDS 3.14.0, the latest release at the time of review, on macOS 27.2.1 using Playwright's Chromium 156.0.8078.4, Firefox 157.0, and WebKit 27.2. Each scenario below reproduced in all three engines. The tooltip JavaScript and Sass sources in upstream `develop` at `029d6d792241b3b4107a630590a27ee951a152b5` matched the 3.14.0 package; `develop` itself was not run.

The examples assume `@uswds/uswds` 3.14.0 is installed in `node_modules` alongside the HTML file and that the file is served locally.

## Draft A: initialization removes existing focus

This draft covers the initialization issue reproduced in stock USWDS. The separate CoDS teardown issue is not included: USWDS `off()` removes listeners rather than unwrapping the trigger, and teardown focus loss has not been established upstream.

**Title:** USWDS - Bug: Tooltip initialization removes focus from an already-focused trigger

### Describe the bug

When a tooltip trigger has focus before USWDS initializes it, initialization removes focus even though the trigger remains in the document. This can disrupt keyboard navigation when a page or application enhances already-focused content.

### Steps to reproduce

1. Load this page with the USWDS 3.14.0 distribution:

   ```html
   <!doctype html>
   <html lang="en">
     <head>
       <meta charset="utf-8" />
       <link
         rel="stylesheet"
         href="./node_modules/@uswds/uswds/dist/css/uswds.css"
       />
     </head>
     <body>
       <button
         id="trigger"
         type="button"
         class="usa-button usa-tooltip"
         title="Additional context."
       >
         Help
       </button>
       <script>
         const trigger = document.getElementById('trigger');
         trigger.focus();
         console.log('Before USWDS:', document.activeElement === trigger);
         window.addEventListener('load', () => {
           console.log(
             'After USWDS:',
             document.activeElement === trigger,
             document.activeElement.tagName,
           );
         });
       </script>
       <script src="./node_modules/@uswds/uswds/dist/js/uswds.js"></script>
     </body>
   </html>
   ```

2. Observe the console output and focused element.

**Actual:** Before initialization, the trigger is focused. After initialization, `document.activeElement` is `BODY`.

**Expected:** The trigger retains focus when USWDS enhances it.

### System setup

USWDS 3.14.0; macOS 27.2.1; Playwright Chromium 156.0.8078.4, Firefox 157.0, and WebKit 27.2.

## Draft B: focus loss dismisses a still-hovered tooltip

**Title:** USWDS - Bug: Tooltip hides on focus loss while its trigger remains hovered

### Describe the bug

If a tooltip trigger is simultaneously hovered and focused, moving keyboard focus away hides the tooltip even though the pointer remains over the trigger. It stays hidden while the pointer remains stationary unless focus returns.

### Steps to reproduce

1. Load this page with the USWDS 3.14.0 distribution:

   ```html
   <!doctype html>
   <html lang="en">
     <head>
       <meta charset="utf-8" />
       <link
         rel="stylesheet"
         href="./node_modules/@uswds/uswds/dist/css/uswds.css"
       />
     </head>
     <body>
       <button
         id="trigger"
         type="button"
         class="usa-button usa-tooltip"
         title="Additional context."
       >
         Help
       </button>
       <button id="next" type="button" class="usa-button">Next</button>
       <script src="./node_modules/@uswds/uswds/dist/js/uswds.js"></script>
     </body>
   </html>
   ```

2. Hover Help and leave the pointer there.
3. Focus Help with the keyboard, then move focus away using Tab without moving the pointer. Enable full keyboard navigation if required by the browser.
4. Observe the tooltip and the trigger's `:hover` state.

**Actual:** The tooltip becomes hidden and `aria-hidden` changes to `true`, even though the trigger still matches `:hover`.

**Expected:** While the pointer remains over the trigger, the tooltip stays visible unless explicitly dismissed or otherwise no longer applicable.

### System setup and related issue

USWDS 3.14.0; macOS 27.2.1; Playwright Chromium 156.0.8078.4, Firefox 157.0, and WebKit 27.2. The earlier [uswds/uswds#5918](https://github.com/uswds/uswds/issues/5918) addressed the separate pointer path between the trigger and the tooltip.

## Draft follow-up for existing issue: viewport clipping

**Target:** [uswds/uswds#5950](https://github.com/uswds/uswds/issues/5950), which is closed. This is a draft follow-up, not a new issue.

I can reproduce two viewport-clipping cases with the stock USWDS 3.14.0 distribution. Both occur in Playwright Chromium, Firefox, and WebKit on macOS. Neither requires an overflow-clipping ancestor.

### Case 1: a focused, open tooltip is clipped after scrolling

Use a 1280 × 720 CSS-pixel viewport and load:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link
      rel="stylesheet"
      href="./node_modules/@uswds/uswds/dist/css/uswds.css"
    />
    <style>
      body {
        margin: 0;
        height: 1800px;
      }
      main {
        position: absolute;
        top: 1040px;
        left: 300px;
      }
    </style>
  </head>
  <body>
    <main>
      <button
        id="trigger"
        type="button"
        class="usa-button usa-tooltip"
        data-position="bottom"
        title="Additional context for this action."
      >
        Help
      </button>
    </main>
    <script src="./node_modules/@uswds/uswds/dist/js/uswds.js"></script>
  </body>
</html>
```

After initialization, scroll to `y=640`, focus Help, and then scroll upward to `y=360` without moving focus. The trigger remains fully visible, but the tooltip remains below it and is entirely outside the viewport. In Chromium, the trigger ended at about `y=719` and the tooltip occupied `y=724–759`.

**Expected:** An open tooltip remains readable while its focused trigger is visible, including after scrolling.

### Case 2: no placement fits at a small viewport

Use a 320 × 180 CSS-pixel viewport and load:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link
      rel="stylesheet"
      href="./node_modules/@uswds/uswds/dist/css/uswds.css"
    />
    <style>
      body {
        margin: 0;
      }
      main {
        position: absolute;
        top: 80px;
        left: 50%;
        transform: translateX(-50%);
      }
    </style>
  </head>
  <body>
    <main>
      <button
        type="button"
        class="usa-button usa-tooltip"
        data-position="top"
        title="This short tooltip provides helpful context for the current action and explains what a user can expect when they continue."
      >
        Help
      </button>
    </main>
    <script src="./node_modules/@uswds/uswds/dist/js/uswds.js"></script>
  </body>
</html>
```

Focus Help. The 122-character tooltip is placed to the left and extends about 46 pixels beyond the viewport in Chromium. The trigger remains visible. This viewport simulates a constrained reflow scenario; it is not a test of actual browser zoom.

**Expected:** The full tooltip remains readable without covering its trigger when no preferred placement fits.

## Draft follow-up for existing issue: preserve descriptions

**Target:** [uswds/uswds#6485](https://github.com/uswds/uswds/issues/6485), which is open. This is a draft follow-up, not a new issue.

In addition to the icon-only naming case, initialization also replaces an existing `aria-describedby` reference on a trigger that already has an accessible name:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link
      rel="stylesheet"
      href="./node_modules/@uswds/uswds/dist/css/uswds.css"
    />
  </head>
  <body>
    <p id="existing">Existing help text.</p>
    <button
      id="trigger"
      type="button"
      class="usa-button usa-tooltip"
      aria-describedby="existing"
      title="Additional context."
    >
      Help
    </button>
    <script src="./node_modules/@uswds/uswds/dist/js/uswds.js"></script>
  </body>
</html>
```

After initialization, the trigger's `aria-describedby` contains only the generated `tooltip-*` ID; the `existing` reference is gone. This reproduced in Chromium, Firefox, and WebKit with USWDS 3.14.0.

**Expected:** Preserve existing description references while adding the tooltip reference. This is separate from providing an accessible name for an icon-only trigger.
