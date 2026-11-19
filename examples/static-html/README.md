# Static HTML example

This private workspace demonstrates the built CoDS package without a framework
or application server.

`pnpm build` generates `examples/static-html/dist/index.html` from the exported
component fixtures and metadata, with local CSS, fonts, and controller assets.
The page uses a sprite subset discovered from its assembled HTML; the copied
package also retains its full sprite, ID index, tools, and Phosphor license for
consumers who need them. Serve `dist/` using a static HTTP server. Generated
output is ignored. See [shared fixtures](../../docs/governance/shared-fixtures.md)
and the [icon build guidance](../../packages/colorado-design-system/README.md#static-and-other-build-pipelines).
