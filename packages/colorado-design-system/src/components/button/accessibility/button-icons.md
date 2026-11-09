# Button icons

Button uses shared Phosphor Regular 2.1.1 sprite icons in 16px slots:

- `plus`: 12px visible span and 1px rounded bars, matching the
  [Figma plus](https://www.figma.com/design/jQ3EiYqe3uEvFbid5ewc41/Colorado-Design-System?node-id=1377-1611&m=dev).
- `export`: upward arrow and open-top box for Upload, matching the
  [Figma upload example](https://www.figma.com/design/jQ3EiYqe3uEvFbid5ewc41/Colorado-Design-System?node-id=1377-959&m=dev).
- `arrow-right`: directional suffix; mirrors in RTL. Plus and export do not.

The shared plus replaces the original thicker handwritten artwork. This was
accepted for implementation on 2026-10-21; formal design/accessibility sign-off
remains open. Icons are decorative and unfocusable; the button label supplies
the accessible name. Docs and Storybook resolve the shared sprite URL during
build; the static example deploys it under `assets/icons/`.
