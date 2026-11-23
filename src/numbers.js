const ONES = ['', 'いち', 'に', 'さん', 'よん', 'ご', 'ろく', 'なな', 'はち', 'きゅう'];
const HUNDREDS = ['', 'ひゃく', 'にひゃく', 'さんびゃく', 'よんひゃく', 'ごひゃく', 'ろっぴゃく', 'ななひゃく', 'はっぴゃく', 'きゅうひゃく'];
const THOUSANDS = ['', 'せん', 'にせん', 'さんぜん', 'よんせん', 'ごせん', 'ろくせん', 'ななせん', 'はっせん', 'きゅうせん'];

function validate(number) {
  if (!Number.isInteger(number) || number < 0 || number > 9999) throw new RangeError('Number must be an integer from 0 to 9999');
}

export function toHiragana(number) {
  validate(number);
  if (number === 0) return 'れい';
  const thousands = Math.floor(number / 1000);
  const hundreds = Math.floor(number / 100) % 10;
  const tens = Math.floor(number / 10) % 10;
  return THOUSANDS[thousands] + HUNDREDS[hundreds] + (tens ? (tens === 1 ? '' : ONES[tens]) + 'じゅう' : '') + ONES[number % 10];
}

export function toKanji(number) {
  validate(number);
  if (number === 0) return '零';
  const digits = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
  return [[1000, '千'], [100, '百'], [10, '十'], [1, '']].map(([place, unit]) => {
    const digit = Math.floor(number / place) % 10;
    return digit ? (digit === 1 && place !== 1 ? '' : digits[digit]) + unit : '';
  }).join('');
}

// The kana inventory used by number readings, including their irregular sounds.
const HEPBURN = {
  'い': 'i', 'う': 'u', 'れ': 're', 'ぜ': 'ze', 'ろ': 'ro',
  'に': 'ni', 'さ': 'sa', 'ん': 'n', 'よ': 'yo', 'ご': 'go',
  'く': 'ku', 'な': 'na', 'は': 'ha', 'ち': 'chi', 'し': 'shi',
  'せ': 'se', 'ひゃ': 'hya', 'びゃ': 'bya', 'ぴゃ': 'pya',
  'きゅ': 'kyu', 'じゅ': 'ju',
};

function romanize(reading) {
  let result = '';
  for (let index = 0; index < reading.length; index++) {
    const kana = reading[index];
    if (kana === 'っ') {
      result += HEPBURN[reading.slice(index + 1, index + 3)]?.[0] || HEPBURN[reading[index + 1]][0];
      continue;
    }
    const pair = reading.slice(index, index + 2);
    const syllable = HEPBURN[pair] || HEPBURN[kana];
    result += kana === 'ん' && /^[aiueoy]/.test(HEPBURN[reading[index + 1]] || '') ? "n'" : syllable;
    if (HEPBURN[pair]) index++;
  }
  return result.replace(/uu/g, 'ū');
}

export function toHepburn(number) {
  return romanize(toHiragana(number));
}

export function normalizeAnswer(answer) {
  return answer.normalize('NFKC').toLowerCase().replace(/ū/g, 'uu').replace(/[\s・･'’ʼ\-]/g, '');
}

export function isCorrect(number, answer, promptKind = 'numerals') {
  if (promptKind === 'kanji') {
    validate(number);
    const digits = answer.trim();
    return /^(?:[0-9]{1,4}|[1-9],[0-9]{3})$/.test(digits) && Number(digits.replace(',', '')) === number;
  }
  const normalized = normalizeAnswer(answer);
  const alternatives = { 0: ['ぜろ'], 4: ['し'], 7: ['しち'], 9: ['く'] };
  const canonical = toHiragana(number);
  const readings = [canonical, ...(alternatives[number] || [])];
  // Both せん and いっせん are accepted for 1,000–1,999.
  if (number >= 1000 && number < 2000) readings.push('いっ' + canonical);
  return readings.some(reading => normalized === normalizeAnswer(reading) || normalized === normalizeAnswer(romanize(reading)));
}

export function randomNumbers(count, max = 9999) {
  if (!Number.isInteger(count) || count < 0 || !Number.isInteger(max) || max < 0 || max > 9999 || count > max + 1) throw new RangeError('Invalid random number range');
  const numbers = new Set();
  while (numbers.size < count) numbers.add(Math.floor(Math.random() * (max + 1)));
  return [...numbers];
}
