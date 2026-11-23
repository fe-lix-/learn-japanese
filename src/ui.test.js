import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { Window } from 'happy-dom';
import * as numbers from './numbers.js';
import * as comparison from './comparison.js';
import * as dates from './dates.js';

const html = (await readFile(new URL('../index.html', import.meta.url), 'utf8')).replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '');
const script = (await readFile(new URL('./main.js', import.meta.url), 'utf8')).replace(/^import .*;\n/gm, '');

function setup(hash = '#numbers') {
  const window = new Window({ url: `http://localhost/${hash}`, settings: { enableJavaScriptEvaluation: true, suppressInsecureJavaScriptEnvironmentWarning: true, disableCSSFileLoading: true, disableJavaScriptFileLoading: true } });
  window.document.write(html);
  Object.assign(window, numbers, comparison, dates);
  window.eval(script + '\nwindow.exerciseTest = { items: () => exercises, lesson: () => lesson, selectLesson };');
  return { window, document: window.document, state: window.exerciseTest };
}
function clickCheck(window, document, index) {
  document.querySelector(`#row-${index} .check-one`).dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
}

test('number exercises retain their two directions and reveal comparisons', async () => {
  const { window, document, state } = setup();
  try {
    assert.equal(document.querySelectorAll('.exercise-row').length, 6);
    assert.equal(document.querySelector('#date-filter').hidden, true);
    const item = state.items()[0];
    const input = document.querySelector('#answer-0');
    input.value = 'wrong';
    clickCheck(window, document, 0);
    const reveal = document.querySelector('#row-0 .show-answer');
    assert.equal(reveal.hidden, false);
    reveal.click();
    assert.equal(input.value, 'wrong');
    assert.equal(document.querySelector('#comparison-0').hidden, false);
    assert.equal(document.querySelector('#comparison-0 .expected .comparison-text').textContent, numbers.toHepburn(item.number).replace(/ū/g, 'uu'));
    assert.equal(document.querySelector('#total-correct').textContent, '0');
    const reverse = state.items()[1];
    document.querySelector('#answer-1').value = String(reverse.number);
    clickCheck(window, document, 1);
    assert.ok(document.querySelector('#row-1').classList.contains('correct'));
  } finally { await window.happyDOM.close(); }
});

test('dates deep link, categories, direction, checking and comparisons work', async () => {
  const { window, document, state } = setup('#dates');
  try {
    assert.equal(state.lesson(), 'dates');
    assert.equal(document.querySelectorAll('.exercise-row').length, 6);
    assert.equal(document.querySelector('#date-filter').hidden, false);
    assert.equal(document.querySelector('#number-range').hidden, true);
    assert.equal(document.querySelector('.lesson.active').getAttribute('href'), '#dates');
    for (const category of ['weekdays', 'months', 'days']) {
      const entries = state.items().filter(exercise => exercise.date.category === category);
      assert.equal(entries.length, 2);
      assert.equal(entries[0].kind, 'numerals');
      assert.equal(entries[1].kind, 'kanji');
    }
    const filter = document.querySelector('#date-category');
    for (const category of ['weekdays', 'months', 'days']) {
      filter.value = category;
      filter.dispatchEvent(new window.Event('change'));
      assert.ok(state.items().every(exercise => exercise.date.category === category));
      assert.equal(new Set(state.items().map(exercise => exercise.date.id)).size, 6);
      assert.equal(document.querySelector('#row-1 .number-reading').textContent, state.items()[1].date.hiragana);
      document.querySelector('#answer-0').value = state.items()[0].date.hiragana;
      clickCheck(window, document, 0);
      assert.ok(document.querySelector('#row-0').classList.contains('correct'));
      const reverse = state.items()[1].date;
      document.querySelector('#answer-1').value = reverse.english;
      clickCheck(window, document, 1);
      assert.ok(document.querySelector('#row-1').classList.contains('correct'));
    }
    document.querySelector('#answer-2').value = 'wrong';
    clickCheck(window, document, 2);
    document.querySelector('#row-2 .show-answer').click();
    assert.equal(document.querySelector('#answer-2').value, 'wrong');
    assert.equal(document.querySelector('#comparison-2').hidden, false);
    document.querySelector('#reveal').click();
    assert.equal(document.querySelector('#reveal').disabled, true);
    assert.ok(state.items().every(exercise => exercise.correct || exercise.revealed));
  } finally { await window.happyDOM.close(); }
});

test('full dates test includes every weekday, month, and day exactly once', async () => {
  const { window, document, state } = setup('#dates');
  try {
    const session = document.querySelector('#date-session');
    session.value = 'full';
    session.dispatchEvent(new window.Event('change'));
    assert.equal(document.querySelectorAll('.exercise-row').length, 50);
    assert.equal(document.querySelector('#set-count').textContent, '50 dates');
    assert.equal(document.querySelector('#date-category').value, 'all');
    assert.equal(document.querySelector('#date-category').disabled, true);
    assert.equal(new Set(state.items().map(item => item.date.id)).size, 50);
    for (const [category, count] of [['weekdays', 7], ['months', 12], ['days', 31]]) {
      assert.equal(state.items().filter(item => item.date.category === category).length, count);
    }
    assert.equal(state.items().filter(item => item.kind === 'numerals').length, 25);
    assert.equal(state.items().filter(item => item.kind === 'kanji').length, 25);
    state.items().forEach((item, index) => {
      document.querySelector(`#answer-${index}`).value = item.kind === 'kanji' ? item.date.english : item.date.hiragana;
    });
    document.querySelector('#exercise-form').dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
    assert.ok(state.items().every(item => item.correct));
    assert.match(document.querySelector('#set-progress').textContent, /50\/50 checked · 50 correct/);
    assert.match(document.querySelector('#session-message').textContent, /All 50 correct/);
    document.querySelector('#new-set').click();
    assert.equal(state.items().length, 50);
    assert.match(document.querySelector('#set-progress').textContent, /0\/50 checked · 0 correct/);
    session.value = 'quick';
    session.dispatchEvent(new window.Event('change'));
    assert.equal(state.items().length, 6);
    assert.equal(document.querySelector('#date-category').disabled, false);
    assert.equal(document.querySelector('#set-progress').hidden, true);
  } finally { await window.happyDOM.close(); }
});

test('lesson switching preserves separate progress and updates controls', async () => {
  const { window, document, state } = setup();
  try {
    document.querySelector('#answer-0').value = numbers.toHiragana(state.items()[0].number);
    clickCheck(window, document, 0);
    assert.equal(document.querySelector('#total-correct').textContent, '1');
    // Update the history URL without dispatching an asynchronous hashchange.
    window.history.replaceState(null, '', '/#dates');
    state.selectLesson();
    assert.equal(document.querySelector('#total-correct').textContent, '0');
    assert.match(document.querySelector('#forward-mode').textContent, /English/);
    document.querySelector('#forward-mode').click();
    assert.ok(state.items().every(item => item.kind === 'numerals'));
    document.querySelector('[data-mode="kanji"]').click();
    assert.ok(state.items().every(item => item.kind === 'kanji'));
    window.history.replaceState(null, '', '/#numbers');
    state.selectLesson();
    assert.equal(document.querySelector('#total-correct').textContent, '1');
    assert.equal(document.querySelector('#date-filter').hidden, true);
  } finally { await window.happyDOM.close(); }
});
