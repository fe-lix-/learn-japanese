# Kazu — Japanese practice

A responsive, exercise-only Japanese learning site with two **A1.1** sections: **Numbers (0–9,999)** and **Days & dates**.

## Run locally

```sh
npm install
npm run dev
```

Open the local URL printed by Vite.

```sh
npm test        # Number conversion, answer validation, and random generation tests
npm run build  # Production files in dist/
npm run preview
```

## Numbers practice

- Six unique random numbers per set, including the endpoints 0 and 9,999.
- Mixed numeral/Japanese prompts, numeral-only mode, or kanji + hiragana mode. Japanese prompts always show kanji with their hiragana reading directly underneath.
- Adjustable ranges: 0–99, 0–999, and 0–9,999.
- Numeral prompts expect hiragana using your device’s Japanese keyboard/IME, or Hepburn rōmaji using a Latin keyboard. Long vowels accept either macrons (`jū`, `kyū`) or doubled vowels (`juu`, `kyuu`). Case, spacing, hyphens, and apostrophes are ignored for readings.
- Kanji + hiragana prompts expect digits (0–9), e.g. `1234` or `1,234`. They show a numeric keyboard on mobile and do not accept Japanese or rōmaji readings as answers.
- Press Enter or the arrow beside an answer to check it, or check the whole set.
- After checking an incorrect answer, use its **Show answer** button to compare your original entry with the correct answer without earning points. The original input is preserved. Incorrect/extra characters are highlighted in red; correct/missing characters are highlighted in green. Rōmaji entries are compared with rōmaji solutions, kana with hiragana, and digits with digits. The button disappears when you edit or correctly answer the row. Empty answers don’t unlock it.
- You can also reveal the whole set without earning points, then generate another set.
- Correct-answer totals and attempt-based accuracy persist in local browser storage. The same unchanged incorrect answer is not counted twice consecutively; correcting an answer adds a new attempt.

Includes irregular hundreds and thousands, common standalone alternative readings, and both せん and いっせん. Numeral prompts accept hiragana and Hepburn rōmaji; Japanese prompts accept digits. Kanji and katakana answers are not accepted. Revealed answers follow the prompt direction, with Hepburn readings included for numeral prompts. No account or backend required. Google Fonts are optional; system fonts are used when offline.

## Days & dates practice

Open **A1.1 → Days & dates** in the sidebar, or use `/#dates`.

- Practice all 7 weekdays, 12 months, and 31 days of the month.
- Choose all categories together, or focus on weekdays, months, or day numbers.
- English prompts (e.g. `Monday`, `April`, `20th`) expect Japanese: hiragana, kanji, or Hepburn rōmaji.
- Japanese prompts show kanji with hiragana below (e.g. `月曜日` / `げつようび`). Answer in English for weekdays/months, or with a day number such as `20` or `20th`.
- Use **Mixed**, **English**, or **Kanji + hiragana** to choose exercise direction.
- Includes irregular calendar readings such as `ついたち`, `ふつか`, `じゅうよっか`, `はつか`, and `にじゅうよっか`. These are calendar dates, not duration expressions.
- Incorrect answers support the same reveal-and-compare feedback as number exercises.
- Number and date progress are stored separately on your device.

