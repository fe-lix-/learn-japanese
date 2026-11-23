import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compareAnswers, expectedWrittenAnswer } from './comparison.js';

const changed = segments => segments.filter(segment => segment.changed).map(segment => segment.text).join('');
const text = segments => segments.map(segment => segment.text).join('');

test('highlights incorrect kana and keeps unchanged characters intact', () => {
  const result = compareAnswers('ろくひゃく', 'ろっぴゃく');
  assert.equal(changed(result.entered), 'くひ');
  assert.equal(changed(result.expected), 'っぴ');
  assert.equal(text(result.entered), 'ろくひゃく');
  assert.equal(text(result.expected), 'ろっぴゃく');
});
test('highlights missing, extra, and substituted characters', () => {
  const missing = compareAnswers('ropyaku', 'roppyaku');
  assert.equal(changed(missing.entered), '');
  assert.equal(changed(missing.expected), 'p');
  const extra = compareAnswers('ropppyaku', 'roppyaku');
  assert.equal(changed(extra.entered), 'p');
  assert.equal(changed(extra.expected), '');
  const digits = compareAnswers('1235', '1234');
  assert.equal(changed(digits.entered), '5');
  assert.equal(changed(digits.expected), '4');
});
test('handles identical answers, empty entries, macrons, and literal markup', () => {
  assert.equal(changed(compareAnswers('じゅう', 'じゅう').entered), '');
  assert.deepEqual(compareAnswers('', '0'), { entered: [], expected: [{ text: '0', changed: true }] });
  assert.equal(changed(compareAnswers('ju\u0304', 'jū').entered), '');
  const markup = '<script>alert(1)</script>';
  assert.equal(text(compareAnswers(markup, '600').entered), markup);
});
test('chooses a correct answer in the same script and long-vowel convention', () => {
  assert.equal(expectedWrittenAnswer(600, 'numerals', 'ろくひゃく'), 'ろっぴゃく');
  assert.equal(expectedWrittenAnswer(600, 'numerals', 'rokuhyaku'), 'roppyaku');
  assert.equal(expectedWrittenAnswer(90, 'numerals', 'kyūjūichi'), 'kyūjū');
  assert.equal(expectedWrittenAnswer(90, 'numerals', 'kyuujuuichi'), 'kyuujuu');
  assert.equal(expectedWrittenAnswer(1234, 'kanji', '1235'), '1234');
  assert.equal(expectedWrittenAnswer(1234, 'kanji', '1,235'), '1,234');
});
test('bounds alignment work for unusually large answers without losing text', () => {
  const entered = 'a'.repeat(10000);
  assert.equal(text(compareAnswers(entered, 'ichi').entered), entered);
});
