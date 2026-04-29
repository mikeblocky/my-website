Fastest flow for a new diary note:

1. Run:
   `npm run create:diary -- --date=2026-04-29`
2. Write the note in `src/app/diary/daily-notes/days/<slug>/content.mdx`
3. Review the generated entry in `src/app/diary/daily-notes/_data/days.ts`

Optional overrides:

`npm run create:diary -- --date=2026-04-29 --slug=april-29 --title="April 29, 2026" --description="My daily notes for April 29, 2026"`

The shared day shell lives in `src/app/diary/daily-notes/_components/DailyNoteTemplate.tsx`, and standard daily notes are rendered through the shared route automatically.
