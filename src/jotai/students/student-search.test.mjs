import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';
import { atom, createStore } from 'jotai/vanilla';

// Load the actual store with an HTTP boundary stub, without browser auth imports.
function setup() {
  const pending = [];
  const axios = {
    get(url, options) {
      return new Promise((resolve, reject) => pending.push({ url, options, resolve, reject }));
    },
  };
  const compiled = ts.transpileModule(readFileSync(new URL('./student.ts', import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true },
  }).outputText;
  const api = {};
  runInNewContext(compiled, {
    exports: api,
    require(name) {
      if (name === 'jotai') return { atom };
      if (name === '@/utils/axios-instance') return { __esModule: true, default: axios };
      throw new Error(`Unexpected dependency: ${name}`);
    },
  });
  return { api, pending, store: createStore() };
}
const response = id => ({ data: { students: [{ id }], page: 1, limit: 50, total: 1 } });

test('search retains visible results while requesting filtered students', async () => {
  const { api, pending, store } = setup();
  const previous = response(1).data;
  store.set(api.studentListAtom, previous);
  const controller = new AbortController();
  const request = store.set(api.studentsAPI.getAll, { search: 'Ada', classId: 2 }, controller.signal);
  assert.equal(store.get(api.studentListAtom), previous);
  assert.equal(store.get(api.studentLoadingAtom), true);
  assert.equal(pending[0].url, '/students');
  assert.deepEqual(pending[0].options.params, { search: 'Ada', classId: 2 });
  assert.equal(pending[0].options.signal, controller.signal);
  pending[0].resolve(response(2));
  await request;
  assert.equal(store.get(api.studentListAtom).students[0].id, 2);
  assert.equal(store.get(api.studentLoadingAtom), false);
});

test('a slow earlier response cannot replace newer search results', async () => {
  const { api, pending, store } = setup();
  const old = store.set(api.studentsAPI.getAll, { search: 'A' });
  const latest = store.set(api.studentsAPI.getAll, { search: 'Ada' });
  pending[1].resolve(response(2));
  await latest;
  pending[0].resolve(response(1));
  await old;
  assert.equal(store.get(api.studentListAtom).students[0].id, 2);
});

test('an older failed request cannot clear loading or set an error for a newer search', async () => {
  const { api, pending, store } = setup();
  const old = store.set(api.studentsAPI.getAll, { search: 'A' });
  const latest = store.set(api.studentsAPI.getAll, { search: 'Ada' });
  pending[0].reject(new Error('Old search failed'));
  await old;
  assert.equal(store.get(api.studentLoadingAtom), true);
  assert.equal(store.get(api.studentErrorAtom), null);
  pending[1].resolve(response(2));
  await latest;
  assert.equal(store.get(api.studentLoadingAtom), false);
});

test('cancelled searches preserve results without displaying an error', async () => {
  const { api, pending, store } = setup();
  const previous = response(1).data;
  store.set(api.studentListAtom, previous);
  const controller = new AbortController();
  const request = store.set(api.studentsAPI.getAll, { search: 'Ada' }, controller.signal);
  controller.abort();
  pending[0].reject(new Error('Request cancelled'));
  await request;
  assert.equal(store.get(api.studentListAtom), previous);
  assert.equal(store.get(api.studentErrorAtom), null);
  assert.equal(store.get(api.studentLoadingAtom), false);
});
