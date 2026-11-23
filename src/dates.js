// Kanji numerals used to build month (一月..十二月) and day (一日..三十一日) labels.
const KANJI_DIGITS = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九'];

function kanjiNumber(number) {
  if (number < 10) return KANJI_DIGITS[number];
  const tens = Math.floor(number / 10);
  const ones = number % 10;
  return (tens > 1 ? KANJI_DIGITS[tens] : '') + '十' + (ones ? KANJI_DIGITS[ones] : '');
}

// Doubles macron vowels the way they are actually spelled without diacritics:
// yō (from yo + u, e.g. yōbi/yōka) becomes "you", while a bare ō (from o + o,
// e.g. tōka) becomes "oo"; ū is always a doubled u.
function doubleVowels(romaji) {
  return romaji.replace(/yō/g, 'you').replace(/ō/g, 'oo').replace(/ū/g, 'uu');
}

const WEEKDAYS = [
  ['Monday', '月曜日', 'げつようび', "getsuyōbi"],
  ['Tuesday', '火曜日', 'かようび', 'kayōbi'],
  ['Wednesday', '水曜日', 'すいようび', 'suiyōbi'],
  ['Thursday', '木曜日', 'もくようび', 'mokuyōbi'],
  ['Friday', '金曜日', 'きんようび', "kin'yōbi"],
  ['Saturday', '土曜日', 'どようび', 'doyōbi'],
  ['Sunday', '日曜日', 'にちようび', 'nichiyōbi'],
];

const MONTHS = [
  ['January', 'いちがつ', 'ichigatsu'],
  ['February', 'にがつ', 'nigatsu'],
  ['March', 'さんがつ', 'sangatsu'],
  ['April', 'しがつ', 'shigatsu'],
  ['May', 'ごがつ', 'gogatsu'],
  ['June', 'ろくがつ', 'rokugatsu'],
  ['July', 'しちがつ', 'shichigatsu'],
  ['August', 'はちがつ', 'hachigatsu'],
  ['September', 'くがつ', 'kugatsu'],
  ['October', 'じゅうがつ', 'jūgatsu'],
  ['November', 'じゅういちがつ', 'jūichigatsu'],
  ['December', 'じゅうにがつ', 'jūnigatsu'],
];

// Days 1-10, 14, 20, and 24 use irregular native readings; every other day is a
// regular compound of the tens/ones reading plus にち, with しち/く preferred
// over なな/きゅう for 7 and 9 (17, 19, 27, 29).
const DAYS = [
  ['1st', 'ついたち', 'tsuitachi'],
  ['2nd', 'ふつか', 'futsuka'],
  ['3rd', 'みっか', 'mikka'],
  ['4th', 'よっか', 'yokka'],
  ['5th', 'いつか', 'itsuka'],
  ['6th', 'むいか', 'muika'],
  ['7th', 'なのか', 'nanoka'],
  ['8th', 'ようか', 'yōka'],
  ['9th', 'ここのか', 'kokonoka'],
  ['10th', 'とおか', 'tōka'],
  ['11th', 'じゅういちにち', 'jūichinichi'],
  ['12th', 'じゅうににち', 'jūninichi'],
  ['13th', 'じゅうさんにち', 'jūsannichi'],
  ['14th', 'じゅうよっか', 'jūyokka'],
  ['15th', 'じゅうごにち', 'jūgonichi'],
  ['16th', 'じゅうろくにち', 'jūrokunichi'],
  ['17th', 'じゅうしちにち', 'jūshichinichi'],
  ['18th', 'じゅうはちにち', 'jūhachinichi'],
  ['19th', 'じゅうくにち', 'jūkunichi'],
  ['20th', 'はつか', 'hatsuka'],
  ['21st', 'にじゅういちにち', 'nijūichinichi'],
  ['22nd', 'にじゅうににち', 'nijūninichi'],
  ['23rd', 'にじゅうさんにち', 'nijūsannichi'],
  ['24th', 'にじゅうよっか', 'nijūyokka'],
  ['25th', 'にじゅうごにち', 'nijūgonichi'],
  ['26th', 'にじゅうろくにち', 'nijūrokunichi'],
  ['27th', 'にじゅうしちにち', 'nijūshichinichi'],
  ['28th', 'にじゅうはちにち', 'nijūhachinichi'],
  ['29th', 'にじゅうくにち', 'nijūkunichi'],
  ['30th', 'さんじゅうにち', 'sanjūnichi'],
  ['31st', 'さんじゅういちにち', 'sanjūichinichi'],
];

export const DATE_ITEMS = [
  ...WEEKDAYS.map(([english, kanji, hiragana, romaji]) => ({
    id: `weekday-${english.toLowerCase()}`,
    category: 'weekdays',
    english,
    kanji,
    hiragana,
    romaji,
  })),
  ...MONTHS.map(([english, hiragana, romaji], index) => ({
    id: `month-${index + 1}`,
    category: 'months',
    english,
    kanji: `${kanjiNumber(index + 1)}月`,
    hiragana,
    romaji,
  })),
  ...DAYS.map(([english, hiragana, romaji], index) => ({
    id: `day-${index + 1}`,
    category: 'days',
    english,
    kanji: `${kanjiNumber(index + 1)}日`,
    hiragana,
    romaji,
  })),
];

const WEEKDAY_ABBREVIATIONS = {
  Monday: ['Mon'],
  Tuesday: ['Tue', 'Tues'],
  Wednesday: ['Wed'],
  Thursday: ['Thu', 'Thur', 'Thurs'],
  Friday: ['Fri'],
  Saturday: ['Sat'],
  Sunday: ['Sun'],
};

const MONTH_ABBREVIATIONS = {
  January: ['Jan'],
  February: ['Feb'],
  March: ['Mar'],
  April: ['Apr'],
  May: ['May'],
  June: ['Jun'],
  July: ['Jul'],
  August: ['Aug'],
  September: ['Sep', 'Sept'],
  October: ['Oct'],
  November: ['Nov'],
  December: ['Dec'],
};

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Strip Hepburn word separators and fold case; macrons are reconciled separately
// so both the diacritic and its doubled-vowel spelling are accepted.
function cleanRomaji(text) {
  return text.normalize('NFKC').toLowerCase().replace(/[\s'’ʼ-]/g, '');
}

function matchesRomaji(canonical, entered) {
  const pattern = escapeRegex(cleanRomaji(canonical)).replace(/ō/g, '(?:ō|ou|oo)').replace(/ū/g, '(?:ū|uu)');
  return new RegExp(`^${pattern}$`).test(cleanRomaji(entered));
}

export function isDateCorrect(item, answer, promptKind = 'kanji') {
  const trimmed = (answer ?? '').trim();
  if (promptKind === 'kanji') {
    if (item.category === 'days') {
      const dayNumber = parseInt(item.english, 10);
      return /^\d{1,2}$/.test(trimmed) && Number(trimmed) === dayNumber || trimmed.toLowerCase() === item.english.toLowerCase();
    }
    const normalized = trimmed.toLowerCase();
    if (normalized === item.english.toLowerCase()) return true;
    const abbreviations = item.category === 'weekdays' ? WEEKDAY_ABBREVIATIONS[item.english] : MONTH_ABBREVIATIONS[item.english];
    return (abbreviations || []).some(abbreviation => abbreviation.toLowerCase() === normalized);
  }
  return trimmed === item.kanji || trimmed === item.hiragana || matchesRomaji(item.romaji, trimmed);
}

export function dateExpectedAnswer(item, promptKind, entered = '') {
  if (promptKind === 'kanji') {
    if (item.category !== 'days') return item.english;
    return /^\d+$/.test(entered.trim()) ? String(parseInt(item.english, 10)) : item.english;
  }
  const normalized = entered.normalize('NFKC');
  if (/[\u4e00-\u9faf]/.test(normalized)) return item.kanji;
  if (/[a-zāēīōū]/i.test(normalized)) {
    return /[āēīōū]/i.test(normalized) ? item.romaji : doubleVowels(item.romaji);
  }
  return item.hiragana;
}

export function randomDateItems(count, category = 'all') {
  const pool = category === 'all' ? DATE_ITEMS : DATE_ITEMS.filter(item => item.category === category);
  if (!Number.isInteger(count) || count < 0 || count > pool.length) throw new RangeError('Invalid random date item count');
  const items = [...pool];
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items.slice(0, count);
}
