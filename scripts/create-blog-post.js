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
npm run create:blog -- --slug=my-post --title="My Post" --description="Short description" --date="April 29th, 2026" --publishedAt="2026-04-29T00:00:00.000Z" --readingTime="5 min read" --themes="Personal,Translation"
`)
}

const args = parseArgs(process.argv.slice(2))
const {
  slug,
  title,
  description,
  date,
  publishedAt,
  readingTime,
  themes = ''
} = args

if (!slug || !title || !description || !date || !publishedAt || !readingTime) {
  usage()
  process.exit(1)
}

const projectRoot = path.join(__dirname, '..')
const postDir = path.join(projectRoot, 'src', 'app', 'blog', 'posts', slug)
const postsFile = path.join(projectRoot, 'src', 'app', 'blog', '_data', 'posts.ts')

if (fs.existsSync(postDir)) {
  console.error(`Post directory already exists: ${postDir}`)
  process.exit(1)
}

const postsSource = fs.readFileSync(postsFile, 'utf8')
const idMatches = [...postsSource.matchAll(/\bid:\s*(\d+)/g)]
const nextId = idMatches.length > 0
  ? Math.max(...idMatches.map((match) => Number(match[1]))) + 1
  : 1

const themeList = themes
  .split(',')
  .map((theme) => theme.trim())
  .filter(Boolean)

fs.mkdirSync(postDir, { recursive: true })

const mdxContent = `Write your post here.
`

fs.writeFileSync(path.join(postDir, 'content.mdx'), mdxContent)

const newEntry = `    {
        id: ${nextId},
        title: ${stringifyForTs(title)},
        description: ${stringifyForTs(description)},
        date: ${stringifyForTs(date)},
        publishedAt: ${stringifyForTs(publishedAt)},
        readingTime: ${stringifyForTs(readingTime)},
        slug: ${stringifyForTs(slug)},
        themes: [${themeList.map((theme) => stringifyForTs(theme)).join(', ')}]
    },
`

const insertionPoint = postsSource.indexOf('export function getBlogPostBySlug')
if (insertionPoint === -1) {
  console.error('Could not find insertion point in posts.ts')
  process.exit(1)
}

const arrayEnd = postsSource.lastIndexOf(']', insertionPoint)
if (arrayEnd === -1) {
  console.error('Could not find posts array end in posts.ts')
  process.exit(1)
}

const updatedPostsSource = `${postsSource.slice(0, arrayEnd)}${newEntry}${postsSource.slice(arrayEnd)}`
fs.writeFileSync(postsFile, updatedPostsSource)

console.log(`Created blog scaffold at ${postDir}`)
console.log('Next steps:')
console.log('1. Write the content in content.mdx')
console.log('2. Add optional opengraph-image.* and twitter-image.* files')
console.log('3. Review the generated entry in src/app/blog/_data/posts.ts')
