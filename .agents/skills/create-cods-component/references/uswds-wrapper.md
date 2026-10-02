# Wrapping a USWDS behavior

Use this for an interactive Type A component (one with a `uswdsEquivalent`). The normative rules are in [contract section 4.5](../../../../docs/governance/component-contract.md#45-wrapping-uswds-javascript) and [ADR-006](../../../../docs/adrs/006-uswds-javascript-ingestion.md). The first interactive Type A component in the Phase 2 vertical slice becomes the reference implementation. Until then, the skeleton below covers only the attribute-only case, verified against the USWDS accordion behavior (ADR-006); other behaviors need the component-specific work listed after it.

## Steps

1. Scaffold with `--type interactive --uswds <id>`, then replace the generated controller: it is a CoDS-authored skeleton, not a wrapper.
2. Find the behavior at `node_modules/@uswds/uswds/packages/<id>/src/index.js`. Read what its `init`/`on` sets, generates, or moves, what `teardown`/`off` undoes, what it throws on, and whether it dispatches events or updates properties.
3. Declare the import in `packages/colorado-design-system/src/types.d.ts` (`declare module '@uswds/uswds/js/<id>'`) with `on`, `off`, and any selector constants you use. USWDS exposes selectors on the behavior object (for example `BUTTON`); use those instead of copying them.
4. Copy USWDS's markup into the fixture. Keep every `usa-*` class and attribute, and add `cods-*` classes and `data-cods-<name>` on the root.
5. Write the controller, starting from the skeleton below and adding the component-specific work.
6. Test lifecycle, idempotency, failure, markup-after-`destroy` equals markup-before-`init`, and events against the real fixture (`?raw` import). Events from a `MutationObserver` are asynchronous; await a task before asserting.

## Controller skeleton (attribute-only behaviors, such as the accordion)

```ts
import behavior from '@uswds/uswds/js/<id>';

interface Item {
  el: HTMLElement;
  attrs: Record<string, string | null>; // authored values of what the behavior changes
}

const instances = new WeakMap<
  HTMLElement,
  { items: Item[]; observer: MutationObserver }
>();

export function init(root: HTMLElement): void {
  if (instances.has(root)) return;
  // Return null when markup is missing anything the behavior would throw on.
  const items = snapshotAuthoredState(root);
  if (!items) {
    console.warn('cods-<name>: <what is missing>', root);
    return;
  }

  behavior.on(root);

  // Start observing after `on`, so the behavior's own setup emits nothing.
  const observer = new MutationObserver((records) => {
    for (const record of records) {
      if (record.oldValue === (record.target as Element).getAttribute('<attr>'))
        continue;
      root.dispatchEvent(
        new CustomEvent('cods-<name>:<event>', {
          bubbles: true,
          composed: false,
          detail: {/* element, new state */},
        }),
      );
    }
  });
  observer.observe(root, {
    subtree: true,
    attributes: true,
    attributeFilter: ['<attr>'],
    attributeOldValue: true,
  });
  instances.set(root, { items, observer });
}

export function destroy(root: HTMLElement): void {
  const instance = instances.get(root);
  if (!instance) return;
  instance.observer.disconnect(); // first, so restoring emits nothing
  behavior.off(root);
  restoreAuthoredState(instance.items); // USWDS's off() does not restore attributes
  instances.delete(root);
}
```

## Beyond the accordion

Checked by reading the USWDS 3.14.0 source; none has a CoDS wrapper yet.

- **Combo Box:** `off` leaves the DOM the behavior generated, so `destroy` must remove it and restore the original `<select>`. It sets `value` and dispatches `change`, which a `MutationObserver` cannot see; listen for `change` on the root and translate it into a CoDS event.
- **Modal:** the behavior moves its root into `document.body`, so `destroy` must account for the relocated element and `init` must not assume the root stays where the author put it. Check how its `teardown` restores the markup.
- **Date Picker:** like the Combo Box, it updates values and dispatches `change`.

## Checks before calling it done

- `dist/colorado-design-system.mjs` has no `require(` and no `uswdsPresent`.
- A second `init` and a `destroy` without `init` do not throw. Compare the root's `outerHTML` before `init` and after `destroy`; for a relocated or generated-DOM behavior, also check the document around the root.
- Behavior the controller depends on is USWDS's, not reimplemented.
- The component works from `examples/static-html`-style usage (one module import) and in Storybook and `apps/web`.

## Decisions and follow-ups

- **No USWDS-specific scaffold template.** Only the accordion case has been exercised; revisit when the vertical-slice component and a second wrapper show which parts repeat. Until then this document is the template.
- **`uswds-init.js` is not needed.** It only supports the global bundle.
- **Bundle duplication.** Measure shared USWDS utility code when the second wrapper lands.
- **Remaining interactive Type A components** (Combo Box, Modal, Tooltip, Language Selector, In-Page Navigation, and others in the ownership matrix) follow this pattern in their Phase 2 and Phase 3 tasks.
