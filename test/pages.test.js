import { test } from 'node:test';
import assert from 'node:assert';
import { getPage, listPages, isReconciled, applySync } from '../lib/pages.js';
import { addBlock, removeBlock, reorderBlock, flattenBlocks, countBlocks } from '../lib/blocks.js';

test('getPage returns a copy, not the registry entry', () => {
  const a = getPage('PG-0042');
  a.title = 'mutated';
  assert.equal(getPage('PG-0042').title, 'Homepage');
});

test('getPage throws on unknown id', () => {
  assert.throws(() => getPage('PG-9999'), RangeError);
});

test('listPages returns every page', () => {
  assert.equal(listPages().length, 5);
});

test('isReconciled reflects rev equality', () => {
  assert.equal(isReconciled(getPage('PG-0067')), true); // r20 === r20
  assert.equal(isReconciled(getPage('PG-0042')), false); // r41 !== r47
});

test('applySync makes published match draft without mutating input', () => {
  const before = getPage('PG-0042');
  const after = applySync(before);
  assert.equal(after.publishedRev, before.draftRev);
  assert.equal(isReconciled(after), true);
  assert.equal(before.publishedRev, 'r41'); // input untouched
});

test('block ops: add, remove, reorder', () => {
  const tree = [
    { id: 'b1', type: 'heading' },
    { id: 'b2', type: 'text' },
  ];
  const added = addBlock(tree, { id: 'b3', type: 'image' }, 1);
  assert.deepEqual(added.map((b) => b.id), ['b1', 'b3', 'b2']);

  const removed = removeBlock(added, 'b3');
  assert.deepEqual(removed.map((b) => b.id), ['b1', 'b2']);

  const moved = reorderBlock(tree, 'b2', 0);
  assert.deepEqual(moved.map((b) => b.id), ['b2', 'b1']);
});

test('flattenBlocks walks nested sections', () => {
  const tree = [
    { id: 's1', type: 'section', children: [
      { id: 'c1', type: 'text' },
      { id: 'c2', type: 'image' },
    ] },
    { id: 'b1', type: 'heading' },
  ];
  assert.deepEqual(flattenBlocks(tree).map((b) => b.id), ['s1', 'c1', 'c2', 'b1']);
  assert.equal(countBlocks(tree), 4);
});
