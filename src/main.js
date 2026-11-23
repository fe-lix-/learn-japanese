import './style.css';
import { compareAnswers, expectedWrittenAnswer } from './comparison.js';
import { toHiragana, toHepburn, toKanji, isCorrect, randomNumbers } from './numbers.js';
import { randomDateItems, isDateCorrect, dateExpectedAnswer } from './dates.js';

const $ = (selector) => document.querySelector(selector);
let lesson = 'numbers';
let progress = { correct: 0, attempts: 0 };
const storageKey = () => lesson === 'dates' ? 'kazu-dates-progress-v1' : 'kazu-progress-v1';
function loadProgress() {
  progress = { correct: 0, attempts: 0 };
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey()));
    if (saved && Number.isSafeInteger(saved.correct) && Number.isSafeInteger(saved.attempts) && saved.correct >= 0 && saved.attempts >= saved.correct) progress = saved;
  } catch { /* Practice also works when browser storage is unavailable. */ }
}
let mode = 'mixed';
let exercises = [];

function updateStats() {
  $('#total-correct').textContent = progress.correct.toLocaleString();
  $('#accuracy').textContent = progress.attempts ? `${Math.round(progress.correct / progress.attempts * 100)}%` : '—';
  try { localStorage.setItem(storageKey(), JSON.stringify(progress)); } catch { /* Storage is optional. */ }
}

function promptFor(exercise) {
  if (exercise.date) return exercise.kind === 'kanji' ? exercise.date.kanji : exercise.date.english;
  if (exercise.kind === 'kanji') return toKanji(exercise.number);
  return exercise.number.toLocaleString('en-US');
}

function readingFor(exercise) {
  return exercise.date ? exercise.date.hiragana : toHiragana(exercise.number);
}

function answerHint(exercise) {
  if (exercise.kind !== 'kanji') return exercise.date ? 'ひらがな / kanji / rōmaji' : 'ひらがな / rōmaji';
  return exercise.date && exercise.date.category !== 'days' ? 'English name' : 'Digits (0–9)';
}

function newSet(focus = false) {
  const category = $('#date-category').value;
  // In an all-category set, include each topic in both exercise directions.
  const dateItems = lesson === 'dates'
    ? (category === 'all' ? ['weekdays', 'months', 'days'].flatMap(topic => randomDateItems(2, topic)) : randomDateItems(6, category))
    : [];
  const items = lesson === 'dates'
    ? dateItems.map(date => ({ date }))
    : randomNumbers(6, Number($('#range').value)).map(number => ({ number }));
  exercises = items.map((item, index) => ({
    ...item, kind: mode === 'mixed' ? (index % 2 === 0 ? 'numerals' : 'kanji') : mode,
    correct: false, revealed: false, lastChecked: null,
  }));
  $('#exercise-list').innerHTML = exercises.map((exercise, index) => `
    <div class="exercise-row" id="row-${index}">
      <div class="number-cell"><span class="row-index">${String(index + 1).padStart(2, '0')}</span><div><span class="number-prompt${exercise.date ? ' date-prompt' : ''}" ${exercise.kind === 'kanji' ? 'lang="ja"' : ''}>${promptFor(exercise)}</span>${exercise.kind === 'kanji' ? `<span class="number-reading" lang="ja">${readingFor(exercise)}</span>` : `<span class="prompt-type">${exercise.date ? { weekdays: 'WEEKDAY', months: 'MONTH', days: 'DAY OF THE MONTH' }[exercise.date.category] : 'NUMERAL'}</span>`}</div></div>
      <div class="answer-cell"><div class="input-wrap"><input id="answer-${index}" aria-label="${answerHint(exercise)} for ${promptFor(exercise)}" aria-describedby="feedback-${index}" placeholder="${answerHint(exercise)}" inputmode="${exercise.kind === 'kanji' && (!exercise.date || exercise.date.category === 'days') ? 'numeric' : 'text'}" autocomplete="off" autocapitalize="off" spellcheck="false" maxlength="128" /><span class="input-status" aria-hidden="true"></span></div><div class="answer-feedback" id="feedback-${index}" aria-live="polite"></div><button class="show-answer text-button" type="button" data-index="${index}" aria-label="Show answer ${index + 1}" hidden>Show answer ↗</button><div class="answer-comparison" id="comparison-${index}" role="region" aria-label="Answer comparison ${index + 1}" hidden></div></div>
      <button class="check-one" type="button" data-index="${index}" aria-label="Check answer ${index + 1}" title="Check answer">↗</button>
    </div>`).join('');
  $('#session-message').textContent = '';
  $('#reveal').disabled = false;
  $('#reveal').innerHTML = 'Show answers <span aria-hidden="true">↗</span>';
  if (focus) $('#answer-0').focus();
}

function setFeedback(index, state, message) {
  const row = $(`#row-${index}`);
  row.classList.remove('correct', 'incorrect', 'revealed');
  if (state) row.classList.add(state);
  $(`#feedback-${index}`).textContent = message;
  row.querySelector('.input-status').textContent = state === 'correct' ? '✓' : state === 'incorrect' ? '!' : '';
  $(`#answer-${index}`).setAttribute('aria-invalid', String(state === 'incorrect'));
  row.querySelector('.show-answer').hidden = state !== 'incorrect' || exercises[index].lastChecked === null;
}

function showComparison(index, entered, expected) {
  const comparison = $(`#comparison-${index}`);
  const differences = compareAnswers(entered, expected);
  comparison.replaceChildren();
  for (const [key, label] of [['entered', 'Your answer'], ['expected', 'Correct answer']]) {
    const line = document.createElement('div');
    line.className = `comparison-line ${key}`;
    const heading = document.createElement('span');
    heading.className = 'comparison-label';
    heading.textContent = label;
    const text = document.createElement('span');
    text.className = 'comparison-text';
    for (const segment of differences[key]) {
      const part = document.createElement(segment.changed ? 'mark' : 'span');
      part.textContent = segment.text;
      text.append(part);
    }
    if (!differences[key].length) text.textContent = 'No answer entered';
    line.append(heading, text);
    comparison.append(line);
  }
  const hint = document.createElement('span');
  hint.className = 'comparison-hint';
  hint.textContent = 'Highlighted characters differ. Green shows the correct or missing characters.';
  comparison.append(hint);
  comparison.hidden = false;
  $(`#answer-${index}`).setAttribute('aria-describedby', `feedback-${index} comparison-${index}`);
}

function revealAnswer(index) {
  const exercise = exercises[index];
  if (exercise.correct || exercise.revealed) return;
  exercise.revealed = true;
  const input = $(`#answer-${index}`);
  const entered = input.value;
  const expected = exercise.date ? dateExpectedAnswer(exercise.date, exercise.kind, entered) : expectedWrittenAnswer(exercise.number, exercise.kind, entered);
  // Keep the learner's original entry; show the solution separately.
  showComparison(index, entered, expected);
  input.readOnly = true;
  const revealMessage = exercise.date
    ? (exercise.kind === 'kanji' ? 'Answer shown · English name or day number' : `${exercise.date.romaji} · answer shown`)
    : (exercise.kind === 'kanji' ? 'Answer shown · digits (0–9)' : `${toHepburn(exercise.number)} · ${exercise.number === 0 ? 'ぜろ / zero also accepted' : 'answer shown'}`);
  setFeedback(index, 'revealed', revealMessage);
  $(`#row-${index} .check-one`).disabled = true;
  if (exercises.every(item => item.correct || item.revealed)) {
    $('#reveal').disabled = true;
    $('#reveal').textContent = 'Answers shown';
  }
}

function check(index) {
  const exercise = exercises[index];
  const input = $(`#answer-${index}`);
  if (exercise.correct || exercise.revealed) return;
  const answer = input.value.trim();
  if (!answer) {
    setFeedback(index, 'incorrect', `Enter your answer: ${answerHint(exercise)}.`);
    return;
  }
  const correct = exercise.date ? isDateCorrect(exercise.date, answer, exercise.kind) : isCorrect(exercise.number, answer, exercise.kind);
  if (exercise.lastChecked !== answer) {
    progress.attempts++;
    if (correct) progress.correct++;
    exercise.lastChecked = answer;
    updateStats();
  }
  exercise.correct = correct;
  setFeedback(index, correct ? 'correct' : 'incorrect', correct ? 'Nicely done!' : `Not quite. Try again using ${answerHint(exercise)}.`);
  if (correct) {
    input.readOnly = true;
    $(`#row-${index} .check-one`).disabled = true;
  }
  const completed = exercises.filter((item) => item.correct).length;
  if (completed === exercises.length) $('#session-message').textContent = 'よくできました！ All six correct. Ready for a fresh set?';
}

$('#exercise-form').addEventListener('submit', (event) => {
  event.preventDefault();
  exercises.forEach((_, index) => check(index));
  const firstUnfinished = exercises.findIndex((item) => !item.correct && !item.revealed);
  if (firstUnfinished >= 0) $(`#answer-${firstUnfinished}`).focus();
});
$('#exercise-list').addEventListener('click', (event) => {
  const button = event.target.closest('.check-one, .show-answer');
  if (!button) return;
  const index = Number(button.dataset.index);
  if (button.matches('.show-answer')) {
    revealAnswer(index);
    // The reveal button is now hidden; keep keyboard focus on this answer.
    $(`#answer-${index}`).focus();
  } else {
    check(index);
  }
});
$('#exercise-list').addEventListener('keydown', (event) => {
  if (event.key !== 'Enter' || event.isComposing || event.keyCode === 229 || !event.target.matches('input')) return;
  event.preventDefault();
  const index = Number(event.target.id.split('-')[1]);
  check(index);
  if (exercises[index].correct) {
    const next = exercises.findIndex((item, i) => i > index && !item.correct && !item.revealed);
    if (next >= 0) $(`#answer-${next}`).focus();
  }
});
$('#exercise-list').addEventListener('input', (event) => {
  if (!event.target.matches('input')) return;
  const index = Number(event.target.id.split('-')[1]);
  if (!exercises[index].correct && !exercises[index].revealed) setFeedback(index, '', '');
});
$('#new-set').addEventListener('click', () => newSet(true));
$('#range').addEventListener('change', () => newSet());
$('#date-category').addEventListener('change', () => newSet());
for (const tab of document.querySelectorAll('.mode')) {
  tab.addEventListener('click', () => {
    mode = tab.dataset.mode;
    for (const button of document.querySelectorAll('.mode')) {
      button.classList.toggle('active', button === tab);
      button.setAttribute('aria-pressed', String(button === tab));
    }
    newSet();
  });
}
$('#reveal').addEventListener('click', () => {
  exercises.forEach((_, index) => revealAnswer(index));
  $('#reveal').disabled = true;
  $('#reveal').textContent = 'Answers shown';
  $('#session-message').textContent = 'Take a moment to read them aloud, then try a new set. Revealed answers don’t count toward your score.';
});
function selectLesson() {
  lesson = window.location.hash === '#dates' ? 'dates' : 'numbers';
  const dates = lesson === 'dates';
  for (const link of document.querySelectorAll('.lesson')) {
    const active = link.hash === `#${lesson}`;
    link.classList.toggle('active', active);
    if (active) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  }
  $('#current-lesson').textContent = dates ? 'Days & dates' : 'Numbers';
  $('#lesson-title').innerHTML = dates ? 'A little Japanese, every day<span>.</span>' : 'Make every number count<span>.</span>';
  $('#lesson-instructions').textContent = dates
    ? 'English → Japanese. Kanji + hiragana → English names or day numbers.'
    : 'Numerals → hiragana or rōmaji. Kanji + hiragana → digits (0–9).';
  $('#overview-title').textContent = dates ? 'Find your way through the calendar' : 'Numbers, one at a time';
  $('#overview-description').textContent = dates ? '7 weekdays, 12 months, and every day of the month.' : 'From zero to nine thousand nine hundred ninety-nine.';
  $('#set-count').textContent = dates ? '6 dates' : '6 numbers';
  $('#practice-description').textContent = dates ? 'A fresh set of days & dates. A little more confidence.' : 'A fresh set of numbers. A little more confidence.';
  $('.heading-stamp').innerHTML = dates ? '<span>日 月 火</span><small>にち・げつ・か</small><span class="stamp-spark">✧</span>' : '<span>一 二 三</span><small>いち・に・さん</small><span class="stamp-spark">✧</span>';
  $('#prompt-column').textContent = dates ? 'DAY / DATE' : 'NUMBER';
  $('#forward-mode').innerHTML = dates ? 'English <span>EN</span>' : 'Numerals <span>123</span>';
  $('#number-range').hidden = dates;
  $('#date-filter').hidden = !dates;
  $('#lesson-tip').innerHTML = dates
    ? '<span class="tip-icon">✧</span><div><strong>Some dates have their own rhythm</strong><p>The 1st is <span lang="ja">ついたち</span>, the 20th is <span lang="ja">はつか</span>. April, July, and September are <span lang="ja">しがつ・しちがつ・くがつ</span>. These are calendar dates, not durations.</p></div><span class="tip-art" aria-hidden="true">日</span>'
    : '<span class="tip-icon">✧</span><div><strong>A small reminder</strong><p>Some numbers have a sound of their own. Watch out for <span lang="ja">さんびゃく</span> (300), <span lang="ja">ろっぴゃく</span> (600), and <span lang="ja">はっぴゃく</span> (800).</p></div><span class="tip-art" aria-hidden="true">三</span>';
  document.title = dates ? 'Kazu — Days & dates practice' : 'Kazu — Japanese number practice';
  loadProgress();
  updateStats();
  newSet();
}
window.addEventListener('hashchange', selectLesson);
selectLesson();
