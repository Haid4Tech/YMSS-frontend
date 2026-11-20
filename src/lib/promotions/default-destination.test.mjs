import assert from 'node:assert/strict';
import { test } from 'node:test';
import { defaultPromotionDestination, promotionDestinations } from './default-destination.ts';

const section = (id, name, gradeLevel, stream = null) => ({ id, name, gradeLevel, stream, subjects: [{ id: id * 10 }] });

test('bulk defaults match the next grade and postfix, including JSS3 to SS1', () => {
  for (const [source, next] of [['JSS1', 'JSS2'], ['JSS2', 'JSS3'], ['JSS3', 'SS1'], ['SS1', 'SS2'], ['SS2', 'SS3']]) {
    for (const letter of ['A', 'B']) {
      const expected = section(3, `${next}${letter}`, next);
      const alternatives = [section(2, `${next}${letter === 'A' ? 'B' : 'A'}`, next), expected];
      assert.equal(defaultPromotionDestination(section(1, `${source}${letter}`, source), alternatives, 'PROMOTE'), expected);
    }
  }
});

test('postfix takes priority over stream and matches case and whitespace variations', () => {
  const source = section(1, 'Jss 3 b', 'JSS3', null);
  const matching = section(3, 'Ss 1B', 'SS1', 'ARTS');
  assert.equal(defaultPromotionDestination(source, [section(2, 'SS1A', 'SS1', null), matching], 'PROMOTE'), matching);
  assert.deepEqual(defaultPromotionDestination(source, [matching], 'PROMOTE').subjects, matching.subjects);
});

test('missing or ambiguous matching sections remain unselected', () => {
  const source = section(1, 'JSS1A', 'JSS1');
  assert.equal(defaultPromotionDestination(source, [section(2, 'JSS2B', 'JSS2')], 'PROMOTE'), null);
  assert.equal(defaultPromotionDestination(source, [section(2, 'JSS2A', 'JSS2'), section(3, 'JSS2A', 'JSS2')], 'PROMOTE'), null);
  assert.equal(defaultPromotionDestination(source, [section(2, 'JSS3A', 'JSS3')], 'PROMOTE'), null);
});

test('repeaters keep their existing class and terminal outcomes have no destination', () => {
  const source = section(1, 'JSS1B', 'JSS1');
  assert.equal(defaultPromotionDestination(source, [source, section(2, 'JSS1A', 'JSS1')], 'REPEAT'), source);
  assert.equal(defaultPromotionDestination(source, [source, section(3, 'JSS1B', 'JSS1')], 'REPEAT'), source);
  for (const outcome of ['GRADUATE', 'WITHDRAW']) assert.equal(defaultPromotionDestination(source, [source], outcome), null);
  assert.equal(defaultPromotionDestination(section(1, 'SS3B', 'SS3'), [source], 'PROMOTE'), null);
});

test('unnamed sections match only another class without a postfix; inconsistent names need review', () => {
  const next = section(2, 'JSS2', 'JSS2');
  assert.equal(defaultPromotionDestination(section(1, 'JSS1', 'JSS1'), [next, section(3, 'JSS2A', 'JSS2')], 'PROMOTE'), next);
  assert.equal(defaultPromotionDestination(section(1, 'Year One', 'JSS1'), [next], 'PROMOTE'), null);
  assert.equal(defaultPromotionDestination(section(1, 'JSS2A', 'JSS1'), [next], 'PROMOTE'), null);
});

test('promotion options contain only higher grades, including jumps across levels', () => {
  const levels = ['JSS1', 'JSS2', 'JSS3', 'SS1', 'SS2', 'SS3'];
  const candidates = levels.map((grade, index) => section(index + 1, `${grade}A`, grade));
  for (const [index, grade] of levels.entries()) {
    const source = section(20, `${grade}B`, grade);
    assert.deepEqual(promotionDestinations(source, candidates, 'PROMOTE'), candidates.slice(index + 1));
    assert.deepEqual(promotionDestinations(source, candidates, 'REPEAT'), [candidates[index]]);
  }
  assert.deepEqual(promotionDestinations(section(20, 'Unknown', null), candidates, 'PROMOTE'), []);
  assert.deepEqual(promotionDestinations(candidates[0], [section(21, 'Unknown', null)], 'PROMOTE'), []);
  assert.deepEqual(promotionDestinations(candidates[5], candidates, 'GRADUATE'), []);
  assert.deepEqual(promotionDestinations(candidates[0], candidates, 'WITHDRAW'), []);
});
