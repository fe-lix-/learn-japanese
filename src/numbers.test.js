import { test } from 'node:test';
import assert from 'node:assert/strict';
import { toHiragana, toHepburn, toKanji, isCorrect, normalizeAnswer, randomNumbers } from './numbers.js';

test('reads zero, boundaries, and irregular sounds', () => {
  const cases = [[0, 'れい'], [1, 'いち'], [10, 'じゅう'], [14, 'じゅうよん'], [99, 'きゅうじゅうきゅう'], [100, 'ひゃく'], [300, 'さんびゃく'], [600, 'ろっぴゃく'], [800, 'はっぴゃく'], [1000, 'せん'], [3000, 'さんぜん'], [8000, 'はっせん'], [3806, 'さんぜんはっぴゃくろく'], [9999, 'きゅうせんきゅうひゃくきゅうじゅうきゅう']];
  for (const [number, expected] of cases) assert.equal(toHiragana(number), expected);
});
test('formats kanji without redundant ones or zeroes', () => {
  for (const [number, expected] of [[0, '零'], [10, '十'], [100, '百'], [1001, '千一'], [3010, '三千十'], [9999, '九千九百九十九']]) assert.equal(toKanji(number), expected);
});
test('accepts hiragana and common alternatives, not kanji or katakana', () => {
  for (const [number, answer] of [[0, 'ぜろ'], [0, 'れい'], [4, 'し'], [7, 'しち'], [9, 'く'], [1000, 'いっせん'], [1234, 'いっせんにひゃくさんじゅうよん'], [600, ' ろっ ぴゃく ']]) assert.ok(isCorrect(number, answer));
  for (const answer of ['六百', 'rokuhyaku', 'ろくひゃく', 'ロッピャク', '']) assert.equal(isCorrect(600, answer), false);
  assert.equal(normalizeAnswer(' ひゃく　にじゅう・さん '), 'ひゃくにじゅうさん');
});
test('formats Hepburn readings including long vowels and irregular sounds', () => {
  const cases = [[0, 'rei'], [1, 'ichi'], [4, 'yon'], [7, 'nana'], [9, 'kyū'], [10, 'jū'], [100, 'hyaku'], [300, 'sanbyaku'], [600, 'roppyaku'], [800, 'happyaku'], [1001, "sen'ichi"], [3000, 'sanzen'], [8000, 'hassen'], [9999, 'kyūsenkyūhyakukyūjūkyū']];
  for (const [number, expected] of cases) assert.equal(toHepburn(number), expected);
});
test('accepts Hepburn variants, macrons, and word separators', () => {
  const cases = [[0, 'zero'], [4, 'shi'], [7, 'shichi'], [9, 'ku'], [10, 'JŪ'], [10, 'juu'], [600, 'roppyaku'], [1000, 'issen'], [1001, "sen’ichi"], [1001, 'senichi'], [1234, 'issen ni-hyaku san-jū yon'], [9999, 'kyuu sen kyuu hyaku kyuu juu kyuu'], [10, 'ju\u0304'], [10, 'ＪＵＵ']];
  for (const [number, answer] of cases) assert.ok(isCorrect(number, answer), `${number}: ${answer}`);
  for (const [number, answer] of [[10, 'ju'], [9, 'kyu'], [600, 'rokuhyaku'], [3000, 'sansen'], [8000, 'hachisen'], [1, 'iti'], [7, 'siti']]) assert.equal(isCorrect(number, answer), false, answer);
});
test('every supported number has valid output and accepts its canonical reading', () => {
  for (let number = 0; number <= 9999; number++) {
    assert.match(toHiragana(number), /^[ぁ-ゖ]+$/u);
    assert.match(toKanji(number), /^[零一二三四五六七八九十百千]+$/u);
    assert.ok(isCorrect(number, toHiragana(number)));
    assert.match(toHepburn(number), /^[a-zū']+$/);
    assert.ok(isCorrect(number, toHepburn(number)));
    assert.ok(isCorrect(number, toHepburn(number).replace(/ū/g, 'uu')));
  }
});
test('Japanese prompts require digits, while numeral prompts require readings', () => {
  for (const [number, answer] of [[0, '0'], [10, '10'], [600, '600'], [1234, '1234'], [1234, '1,234'], [9999, ' 9999 ']]) {
    assert.ok(isCorrect(number, answer, 'kanji'), `${number}: ${answer}`);
    assert.equal(isCorrect(number, answer, 'numerals'), false);
  }
  for (const answer of ['ろっぴゃく', 'roppyaku', '六百', '', ' ', '601', '600abc', '6e2', '600.0', '+600', '60,0', '6 00', '６００']) {
    assert.equal(isCorrect(600, answer, 'kanji'), false, answer);
  }
  assert.equal(isCorrect(0, '', 'kanji'), false);
  assert.equal(isCorrect(600, 'ろっぴゃく', 'numerals'), true);
  assert.equal(isCorrect(600, 'roppyaku', 'numerals'), true);
  for (let number = 0; number <= 9999; number++) {
    assert.ok(isCorrect(number, String(number), 'kanji'));
    assert.ok(isCorrect(number, number.toLocaleString('en-US'), 'kanji'));
    assert.equal(isCorrect(number, toHiragana(number), 'kanji'), false);
    assert.equal(isCorrect(number, toHepburn(number), 'kanji'), false);
  }
});
test('generates distinct numbers within the selected inclusive range', () => {
  for (const max of [99, 999, 9999]) {
    const result = randomNumbers(6, max);
    assert.equal(result.length, 6);
    assert.equal(new Set(result).size, 6);
    assert.ok(result.every(n => Number.isInteger(n) && n >= 0 && n <= max));
  }
  assert.deepEqual(randomNumbers(1, 0), [0]);
});
test('rejects invalid numbers and impossible ranges', () => {
  for (const number of [-1, 10000, 1.5, NaN]) {
    assert.throws(() => toHiragana(number), RangeError);
    assert.throws(() => toKanji(number), RangeError);
    assert.throws(() => toHepburn(number), RangeError);
  }
  assert.throws(() => randomNumbers(7, 5), RangeError);
});
