import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DATE_ITEMS, isDateCorrect, dateExpectedAnswer, randomDateItems } from './dates.js';

function find(id) {
  const item = DATE_ITEMS.find(entry => entry.id === id);
  assert.ok(item, `missing item ${id}`);
  return item;
}

test('includes 7 weekdays, 12 months, and 31 days with distinct ids', () => {
  const byCategory = category => DATE_ITEMS.filter(item => item.category === category);
  assert.equal(byCategory('weekdays').length, 7);
  assert.equal(byCategory('months').length, 12);
  assert.equal(byCategory('days').length, 31);
  assert.equal(new Set(DATE_ITEMS.map(item => item.id)).size, DATE_ITEMS.length);
  for (const item of DATE_ITEMS) {
    assert.ok(item.english && item.kanji && item.hiragana && item.romaji, item.id);
  }
});

test('weekday readings match canonical kanji, hiragana, and romaji', () => {
  const cases = [
    ['Monday', '月曜日', 'げつようび', 'getsuyōbi'],
    ['Tuesday', '火曜日', 'かようび', 'kayōbi'],
    ['Wednesday', '水曜日', 'すいようび', 'suiyōbi'],
    ['Thursday', '木曜日', 'もくようび', 'mokuyōbi'],
    ['Friday', '金曜日', 'きんようび', "kin'yōbi"],
    ['Saturday', '土曜日', 'どようび', 'doyōbi'],
    ['Sunday', '日曜日', 'にちようび', 'nichiyōbi'],
  ];
  for (const [english, kanji, hiragana, romaji] of cases) {
    const item = find(`weekday-${english.toLowerCase()}`);
    assert.equal(item.kanji, kanji, english);
    assert.equal(item.hiragana, hiragana, english);
    assert.equal(item.romaji, romaji, english);
  }
});

test('month readings use irregular April, July, and September sounds', () => {
  const cases = [
    [1, '一月', 'いちがつ', 'ichigatsu'],
    [2, '二月', 'にがつ', 'nigatsu'],
    [3, '三月', 'さんがつ', 'sangatsu'],
    [4, '四月', 'しがつ', 'shigatsu'],
    [5, '五月', 'ごがつ', 'gogatsu'],
    [6, '六月', 'ろくがつ', 'rokugatsu'],
    [7, '七月', 'しちがつ', 'shichigatsu'],
    [8, '八月', 'はちがつ', 'hachigatsu'],
    [9, '九月', 'くがつ', 'kugatsu'],
    [10, '十月', 'じゅうがつ', 'jūgatsu'],
    [11, '十一月', 'じゅういちがつ', 'jūichigatsu'],
    [12, '十二月', 'じゅうにがつ', 'jūnigatsu'],
  ];
  for (const [number, kanji, hiragana, romaji] of cases) {
    const item = find(`month-${number}`);
    assert.equal(item.kanji, kanji, number);
    assert.equal(item.hiragana, hiragana, number);
    assert.equal(item.romaji, romaji, number);
  }
});

test('day readings are irregular through the 10th, 14th, 20th, and 24th', () => {
  const cases = [
    [1, '一日', 'ついたち', 'tsuitachi'],
    [2, '二日', 'ふつか', 'futsuka'],
    [3, '三日', 'みっか', 'mikka'],
    [4, '四日', 'よっか', 'yokka'],
    [5, '五日', 'いつか', 'itsuka'],
    [6, '六日', 'むいか', 'muika'],
    [7, '七日', 'なのか', 'nanoka'],
    [8, '八日', 'ようか', 'yōka'],
    [9, '九日', 'ここのか', 'kokonoka'],
    [10, '十日', 'とおか', 'tōka'],
    [14, '十四日', 'じゅうよっか', 'jūyokka'],
    [20, '二十日', 'はつか', 'hatsuka'],
    [24, '二十四日', 'にじゅうよっか', 'nijūyokka'],
  ];
  for (const [number, kanji, hiragana, romaji] of cases) {
    const item = find(`day-${number}`);
    assert.equal(item.kanji, kanji, number);
    assert.equal(item.hiragana, hiragana, number);
    assert.equal(item.romaji, romaji, number);
  }
});

test('days 17, 19, 27, and 29 use shichi/ku rather than nana/kyū', () => {
  assert.equal(find('day-17').hiragana, 'じゅうしちにち');
  assert.equal(find('day-19').hiragana, 'じゅうくにち');
  assert.equal(find('day-27').hiragana, 'にじゅうしちにち');
  assert.equal(find('day-29').hiragana, 'にじゅうくにち');
  assert.equal(find('day-17').romaji, 'jūshichinichi');
  assert.equal(find('day-19').romaji, 'jūkunichi');
  assert.equal(find('day-27').romaji, 'nijūshichinichi');
  assert.equal(find('day-29').romaji, 'nijūkunichi');
});

test('regular days combine tens and ones readings with にち', () => {
  const cases = [
    [11, 'じゅういちにち'], [12, 'じゅうににち'], [13, 'じゅうさんにち'],
    [15, 'じゅうごにち'], [16, 'じゅうろくにち'], [18, 'じゅうはちにち'],
    [21, 'にじゅういちにち'], [22, 'にじゅうににち'], [23, 'にじゅうさんにち'],
    [25, 'にじゅうごにち'], [26, 'にじゅうろくにち'], [28, 'にじゅうはちにち'],
    [30, 'さんじゅうにち'], [31, 'さんじゅういちにち'],
  ];
  for (const [number, hiragana] of cases) assert.equal(find(`day-${number}`).hiragana, hiragana, number);
});

test('kanji prompts accept the full English name, case-insensitively and trimmed', () => {
  const monday = find('weekday-monday');
  for (const answer of ['Monday', 'monday', 'MONDAY', '  Monday  ']) assert.ok(isDateCorrect(monday, answer, 'kanji'), answer);
  const july = find('month-7');
  for (const answer of ['July', 'july', ' JULY ']) assert.ok(isDateCorrect(july, answer, 'kanji'), answer);
  for (const answer of ['Tuesday', 'June', '', 'Mond']) assert.equal(isDateCorrect(monday, answer, 'kanji'), false, answer);
});

test('kanji prompts accept standard weekday and month abbreviations', () => {
  const abbreviations = [
    ['weekday-monday', ['Mon', 'mon']],
    ['weekday-tuesday', ['Tue', 'Tues', 'tue', 'tues']],
    ['weekday-wednesday', ['Wed']],
    ['weekday-thursday', ['Thu', 'Thur', 'Thurs']],
    ['weekday-friday', ['Fri']],
    ['weekday-saturday', ['Sat']],
    ['weekday-sunday', ['Sun']],
    ['month-1', ['Jan']], ['month-2', ['Feb']], ['month-3', ['Mar']], ['month-4', ['Apr']],
    ['month-5', ['May']], ['month-6', ['Jun']], ['month-7', ['Jul']], ['month-8', ['Aug']],
    ['month-9', ['Sep', 'Sept']], ['month-10', ['Oct']], ['month-11', ['Nov']], ['month-12', ['Dec']],
  ];
  for (const [id, variants] of abbreviations) {
    const item = find(id);
    for (const variant of variants) assert.ok(isDateCorrect(item, variant, 'kanji'), `${id}: ${variant}`);
  }
  assert.equal(isDateCorrect(find('weekday-tuesday'), 'Thu', 'kanji'), false);
  assert.equal(isDateCorrect(find('month-9'), 'Jun', 'kanji'), false);
});

test('kanji prompts for days accept digits or the ordinal form', () => {
  for (let day = 1; day <= 31; day++) {
    const item = find(`day-${day}`);
    assert.ok(isDateCorrect(item, String(day), 'kanji'), day);
    assert.ok(isDateCorrect(item, item.english, 'kanji'), day);
    assert.ok(isDateCorrect(item, ` ${day} `, 'kanji'), day);
  }
  const fourteenth = find('day-14');
  for (const answer of ['13', '15', '14nd', '1st', '', 'fourteenth']) assert.equal(isDateCorrect(fourteenth, answer, 'kanji'), false, answer);
});

test('numerals prompts accept exact kanji or hiragana', () => {
  for (const item of DATE_ITEMS) {
    assert.ok(isDateCorrect(item, item.kanji, 'numerals'), item.id);
    assert.ok(isDateCorrect(item, item.hiragana, 'numerals'), item.id);
    assert.ok(isDateCorrect(item, ` ${item.kanji} `, 'numerals'), item.id);
    assert.equal(isDateCorrect(item, item.kanji.slice(0, -1) || 'x', 'numerals'), false, item.id);
  }
});

test('numerals prompts accept Hepburn romaji with macrons, ou, or uu', () => {
  const tooka = find('day-10');
  for (const answer of ['tōka', 'touka', 'tooka', 'TOOKA', ' tooka ']) assert.ok(isDateCorrect(tooka, answer, 'numerals'), answer);
  const getsuyoubi = find('weekday-monday');
  for (const answer of ['getsuyōbi', 'getsuyoubi', "getsuyou-bi"]) assert.ok(isDateCorrect(getsuyoubi, answer, 'numerals'), answer);
  const jugatsu = find('month-10');
  for (const answer of ['jūgatsu', 'juugatsu']) assert.ok(isDateCorrect(jugatsu, answer, 'numerals'), answer);
  const kinyoubi = find('weekday-friday');
  for (const answer of ["kin'yōbi", 'kinyoubi', 'kin-youbi', "kin' you bi"]) assert.ok(isDateCorrect(kinyoubi, answer, 'numerals'), answer);
  for (const answer of ['toka', 'getsuyobi', 'jugatsu']) {
    assert.equal(isDateCorrect(tooka, answer, 'numerals'), false, answer);
  }
});

test('numerals prompts reject unrelated romaji and empty answers', () => {
  const monday = find('weekday-monday');
  for (const answer of ['', 'kayoubi', 'MONDAY', '月曜']) assert.equal(isDateCorrect(monday, answer, 'numerals'), false, answer);
});

test('dateExpectedAnswer for kanji prompts returns the English name or digit form', () => {
  const monday = find('weekday-monday');
  assert.equal(dateExpectedAnswer(monday, 'kanji', 'mon'), 'Monday');
  const fourteenth = find('day-14');
  assert.equal(dateExpectedAnswer(fourteenth, 'kanji', '13'), '14');
  assert.equal(dateExpectedAnswer(fourteenth, 'kanji', 'fourteen'), '14th');
});

test('dateExpectedAnswer for numerals prompts matches the script family entered', () => {
  const tooka = find('day-10');
  assert.equal(dateExpectedAnswer(tooka, 'numerals', '十'), '十日');
  assert.equal(dateExpectedAnswer(tooka, 'numerals', 'tooka'), 'tooka');
  assert.equal(dateExpectedAnswer(tooka, 'numerals', 'tōka'), 'tōka');
  assert.equal(dateExpectedAnswer(tooka, 'numerals', 'とお'), 'とおか');
  assert.equal(dateExpectedAnswer(tooka, 'numerals', ''), 'とおか');
});

test('all entries accept canonical readings and enforce exercise direction', () => {
  for (const item of DATE_ITEMS) {
    assert.ok(isDateCorrect(item, item.romaji, 'numerals'), item.id);
    assert.ok(isDateCorrect(item, dateExpectedAnswer(item, 'numerals', 'latin'), 'numerals'), item.id);
    assert.ok(isDateCorrect(item, item.english, 'kanji'), item.id);
    assert.equal(isDateCorrect(item, item.english, 'numerals'), false, item.id);
    assert.equal(isDateCorrect(item, item.hiragana, 'kanji'), false, item.id);
    assert.equal(isDateCorrect(item, item.kanji, 'kanji'), false, item.id);
  }
});
test('generates distinct items within the selected category and respects bounds', () => {
  for (const [category, size] of [['weekdays', 7], ['months', 12], ['days', 31], ['all', DATE_ITEMS.length]]) {
    const selection = randomDateItems(size, category);
    assert.equal(selection.length, size);
    assert.equal(new Set(selection.map(item => item.id)).size, size);
    if (category !== 'all') assert.ok(selection.every(item => item.category === category));
  }
  assert.deepEqual(randomDateItems(0, 'weekdays'), []);
  assert.throws(() => randomDateItems(8, 'weekdays'), RangeError);
  assert.throws(() => randomDateItems(-1), RangeError);
  assert.throws(() => randomDateItems(1.5, 'all'), RangeError);
});

test('unmacronized expected answers double vowels according to their kana origin', () => {
  // tōka (10th) doubles a bare ō (from お + お) as "oo", not "ou".
  const tooka = find('day-10');
  assert.equal(dateExpectedAnswer(tooka, 'numerals', 'tooka'), 'tooka');
  assert.equal(dateExpectedAnswer(tooka, 'numerals', ''), 'とおか');
  assert.equal(dateExpectedAnswer(tooka, 'numerals', 'お'), 'とおか');
  assert.equal(dateExpectedAnswer(tooka, 'numerals', 'tōka'), 'tōka');

  // yōka (8th) doubles yō (from よ + う) as "you", not "oo".
  const youka = find('day-8');
  assert.equal(dateExpectedAnswer(youka, 'numerals', 'youka'), 'youka');
  assert.equal(dateExpectedAnswer(youka, 'numerals', ''), 'ようか');
  assert.equal(dateExpectedAnswer(youka, 'numerals', 'yōka'), 'yōka');

  // Every yōbi weekday follows the same yō → "you" rule.
  const weekdayExpectations = [
    ['weekday-monday', 'getsuyoubi'],
    ['weekday-tuesday', 'kayoubi'],
    ['weekday-wednesday', 'suiyoubi'],
    ['weekday-thursday', 'mokuyoubi'],
    ['weekday-friday', "kin'youbi"],
    ['weekday-saturday', 'doyoubi'],
    ['weekday-sunday', 'nichiyoubi'],
  ];
  for (const [id, expected] of weekdayExpectations) {
    assert.equal(dateExpectedAnswer(find(id), 'numerals', 'youbi'), expected, id);
  }

  // ū (always from a doubled u, e.g. じゅう) always doubles to "uu".
  for (const [id, expected] of [['month-10', 'juugatsu'], ['month-11', 'juuichigatsu'], ['month-12', 'juunigatsu'], ['day-11', 'juuichinichi']]) {
    assert.equal(dateExpectedAnswer(find(id), 'numerals', 'juu'), expected, id);
  }
});
