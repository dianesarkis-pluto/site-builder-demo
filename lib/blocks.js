// Content-block tree helpers. A page body is an ordered list of blocks; a
// block has an id, a type (heading/text/image/gallery/section), and content.
// Section blocks nest children, so the tree can be more than one level deep.
//
// There is deliberately NO draft/published diff helper here yet — Demo 2
// (plan mode) proposes adding one. These helpers are the pure operations a
// diff would build on.

export function addBlock(tree, block, index = tree.length) {
  const next = tree.slice();
  next.splice(index, 0, block);
  return next;
}

export function removeBlock(tree, blockId) {
  return tree
    .filter((b) => b.id !== blockId)
    .map((b) => (b.children ? { ...b, children: removeBlock(b.children, blockId) } : b));
}

export function reorderBlock(tree, blockId, toIndex) {
  const from = tree.findIndex((b) => b.id === blockId);
  if (from === -1) return tree.slice();
  const next = tree.slice();
  const [moved] = next.splice(from, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

// Depth-first flatten, including nested section children. Useful for counting
// or indexing every block on a page regardless of nesting.
export function flattenBlocks(tree) {
  const out = [];
  for (const b of tree) {
    out.push(b);
    if (b.children) out.push(...flattenBlocks(b.children));
  }
  return out;
}

export function countBlocks(tree) {
  return flattenBlocks(tree).length;
}
