import assert from 'node:assert/strict';
import { test } from 'node:test';
import { DEFAULT_PERIOD, isAcademicPeriod, readPeriod, readOverrides, withGlobalPeriod, withPagePeriod } from './state.ts';

const first = { academicYear: '2026/2027', term: 'FIRST' };
const second = { academicYear: '2026/2027', term: 'SECOND' };
const path = '/portal/records/class/1';

test('global preference survives serialization and a new browser session', () => {
  const stored = JSON.stringify(first);
  const restored = withGlobalPeriod(readPeriod(stored));
  assert.deepEqual(restored, { globalPeriod: first, pages: {} });
});

test('page override applies only to that path and leaves the global preference unchanged', () => {
  const initial = withGlobalPeriod(first);
  const state = withPagePeriod(initial, path, second);
  assert.deepEqual(state.globalPeriod, first);
  assert.deepEqual(state.pages[path], second);
  assert.equal(state.pages['/portal/records/class/2'], undefined);
  assert.deepEqual(initial.pages, {});
});

test('page overrides restore on refresh only for the matching global period', () => {
  const state = withPagePeriod(withGlobalPeriod(first), path, second);
  const stored = JSON.stringify(state);
  assert.deepEqual(readOverrides(stored, first), { [path]: second });
  assert.deepEqual(readOverrides(stored, second), {});
  assert.deepEqual(readOverrides(null, first), {});
});

test('changing global period clears page overrides', () => {
  const state = withPagePeriod(withGlobalPeriod(first), path, second);
  assert.deepEqual(withGlobalPeriod(second), { globalPeriod: second, pages: {} });
  assert.deepEqual(state.pages[path], second);
});

test('resetting a page or choosing the global period removes only that override', () => {
  const state = withPagePeriod(withPagePeriod(withGlobalPeriod(first), path, second), '/portal/results', second);
  for (const choice of [null, first]) {
    const reset = withPagePeriod(state, path, choice);
    assert.equal(reset.pages[path], undefined);
    assert.deepEqual(reset.pages['/portal/results'], second);
  }
});

test('malformed stored data falls back safely', () => {
  for (const value of [null, '{bad', '{}', '[]', JSON.stringify({ academicYear: '2026-2027', term: 'FIRST' }), JSON.stringify({ academicYear: '2026/2028', term: 'FIRST' })]) {
    assert.deepEqual(readPeriod(value), DEFAULT_PERIOD);
  }
  assert.equal(isAcademicPeriod({ academicYear: '2026/2027', term: 'FOURTH' }), false);
  assert.deepEqual(readOverrides('{bad', first), {});
  assert.deepEqual(readOverrides(JSON.stringify({ globalPeriod: first, pages: { [path]: second, bad: first, '/portal/invalid': {} } }), first), { [path]: second });
});
