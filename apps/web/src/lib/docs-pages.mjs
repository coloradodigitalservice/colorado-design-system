// Documentation page slugs for each component. Most components have one page
// named after the component; Card has one page per Figma variant.
const pages = { card: ['card-default', 'card-icon'] };

export function docsPages(name) {
  return pages[name] ?? [name];
}
