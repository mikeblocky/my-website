const fs = require('fs')
const path = require('path')

function parseArgs(argv) {
  const entries = argv
    .map((arg) => arg.match(/^--([^=]+)=(.*)$/))
    .filter(Boolean)
    .map(([, key, value]) => [key, value])

  return Object.fromEntries(entries)
}

function stringifyForTs(value) {
  return JSON.stringify(value)
}

function usage() {
  console.log(`Usage:
npm run create:diary -- --date=2026-04-29
npm run create:diary -- --date=2026-04-29 --slug=april-29 --title="April 29, 2026" --description="My daily notes for April 29, 2026"
`)
}

function isValidIsoDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value)
}

function monthSlug(date) {
  const months = [
    'january',
    'february',
    'march',
    'april',
    'may',
    'june',
    'july',
    'august',
    'september',
    'october',
    'november',
    'december'
  ]

  return `${months[date.getUTCMonth()]}-${date.getUTCDate()}`
}

function formatTitle(date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC'
  }).format(date)
}

const args = parseArgs(process.argv.slice(2))
const { date, slug, title, description } = args

if (!date || !isValidIsoDate(date)) {
  usage()
  process.exit(1)
}

const noteDate = new Date(`${date}T00:00:00.000Z`)

if (Number.isNaN(noteDate.getTime())) {
  console.error(`Invalid date: ${date}`)
  process.exit(1)
}

const resolvedSlug = slug || monthSlug(noteDate)
const resolvedTitle = title || formatTitle(noteDate)
const resolvedDescription = description || `My daily notes for ${resolvedTitle}`

const projectRoot = path.join(__dirname, '..')
const noteDir = path.join(projectRoot, 'src', 'app', 'diary', 'daily-notes', 'days', resolvedSlug)
const daysFile = path.join(projectRoot, 'src', 'app', 'diary', 'daily-notes', '_data', 'days.ts')

if (fs.existsSync(noteDir)) {
  console.error(`Diary note directory already exists: ${noteDir}`)
  process.exit(1)
}

const daysSource = fs.readFileSync(daysFile, 'utf8')

if (daysSource.includes(`slug: ${stringifyForTs(resolvedSlug)}`)) {
  console.error(`Diary note entry already exists for slug: ${resolvedSlug}`)
  process.exit(1)
}

fs.mkdirSync(noteDir, { recursive: true })

const mdxContent = `Write your daily note here.
`

fs.writeFileSync(path.join(noteDir, 'content.mdx'), mdxContent)

const newEntry = `\t{
\t\ttitle: ${stringifyForTs(resolvedTitle)},
\t\tslug: ${stringifyForTs(resolvedSlug)},
\t\thref: ${stringifyForTs(`/diary/daily-notes/days/${resolvedSlug}`)},
\t\tdescription: ${stringifyForTs(resolvedDescription)},
\t\tdate: new Date(${stringifyForTs(noteDate.toISOString())})
\t},
`

const arrayStartToken = 'const days: Day[] = [\n'
const arrayStart = daysSource.indexOf(arrayStartToken)

if (arrayStart === -1) {
  console.error('Could not find days array in days.ts')
  process.exit(1)
}

const insertAt = arrayStart + arrayStartToken.length
const updatedDaysSource = `${daysSource.slice(0, insertAt)}${newEntry}${daysSource.slice(insertAt)}`
fs.writeFileSync(daysFile, updatedDaysSource)

console.log(`Created diary scaffold at ${noteDir}`)
console.log('Next steps:')
console.log('1. Write the content in content.mdx')
console.log('2. Review the generated entry in src/app/diary/daily-notes/_data/days.ts')
