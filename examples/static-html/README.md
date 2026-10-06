# Static HTML example

This private workspace will show how a plain HTML consumer uses the built CoDS package without a framework or application server. It will also support clean consumer-install checks once the package has distributable exports. The current workspace only proves local dependency wiring.

`pnpm build` generates `examples/static-html/dist/index.html` from the exported
Site Alert and Accordion fixtures and metadata, with local CSS, fonts, and
controller assets. Serve `dist/` using a static HTTP server. Generated output is
ignored. See [shared fixtures](../../docs/governance/shared-fixtures.md).
