# Link icon sources

Link uses shared Phosphor Regular 2.1.1 masks in `--cods-icon-size-small` slots.
The following artwork was inspected in the
[Link design](https://www.figma.com/design/jQ3EiYqe3uEvFbid5ewc41/Colorado-Design-System?node-id=828-3253&m=dev).

| Figma source                      | Shared icon        | Decision                                                                                 |
| --------------------------------- | ------------------ | ---------------------------------------------------------------------------------------- |
| `2918:4368` arrow                 | `arrow-right`      | Matches the existing trailing arrow                                                      |
| `235:555` external link           | `arrow-square-out` | Matches the external marker                                                              |
| `236:727` globe                   | `globe`            | Matches the prefix                                                                       |
| `I1402:5153;1402:4019` phone      | `phone`            | Matches the handset silhouette and weight                                                |
| `I230:1983;235:608` upload suffix | `download`         | Intentional difference: download points downward; Figma's upward glyph represents upload |

The download choice follows the suffix guidance's download use case and the
technical review dated 2026-10-22. It identifies a real file download, not an
upload action. Only the navigation arrow mirrors in RTL. All icons inherit text
color; accessible names and new-tab notices remain text.
