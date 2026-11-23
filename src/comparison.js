import { toHiragana, toHepburn } from './numbers.js';

export function expectedWrittenAnswer(number, promptKind, entered) {
  if (promptKind === 'kanji') return entered.includes(',') ? number.toLocaleString('en-US') : String(number);
  // Compare Latin input with Latin output instead of highlighting a script change.
  if (/[a-zāēīōū]/i.test(entered.normalize('NFKC'))) {
    const reading = toHepburn(number);
    return /ū/i.test(entered.normalize('NFC')) ? reading : reading.replace(/ū/g, 'uu');
  }
  return toHiragana(number);
}

// Minimum-edit alignment identifies substitutions, extra characters, and missing
// characters. Return text segments, never HTML, so learner input stays safe.
export function compareAnswers(entered, expected) {
  const a = Array.from(entered.normalize('NFC'));
  const b = Array.from(expected.normalize('NFC'));
  if (a.length > 256 || b.length > 256) {
    return { entered: [{ text: a.join(''), changed: true }], expected: [{ text: b.join(''), changed: true }] };
  }
  const costs = Array.from({ length: a.length + 1 }, () => new Uint16Array(b.length + 1));
  for (let i = 0; i <= a.length; i++) costs[i][0] = i;
  for (let j = 0; j <= b.length; j++) costs[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      costs[i][j] = Math.min(costs[i - 1][j] + 1, costs[i][j - 1] + 1, costs[i - 1][j - 1] + Number(a[i - 1] !== b[j - 1]));
    }
  }
  const left = [], right = [];
  let i = a.length, j = b.length;
  while (i || j) {
    if (i && j && costs[i][j] === costs[i - 1][j - 1] + Number(a[i - 1] !== b[j - 1])) {
      const changed = a[i - 1] !== b[j - 1];
      left.push({ text: a[--i], changed });
      right.push({ text: b[--j], changed });
    } else if (i && costs[i][j] === costs[i - 1][j] + 1) {
      left.push({ text: a[--i], changed: true });
    } else {
      right.push({ text: b[--j], changed: true });
    }
  }
  const merge = characters => characters.reverse().reduce((segments, character) => {
    const previous = segments.at(-1);
    if (previous && previous.changed === character.changed) previous.text += character.text;
    else segments.push({ ...character });
    return segments;
  }, []);
  return { entered: merge(left), expected: merge(right) };
}
