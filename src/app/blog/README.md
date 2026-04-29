Fastest flow for a new post:

1. Run:
   `npm run create:blog -- --slug=my-post --title="My Post" --description="Short description" --date="April 29th, 2026" --publishedAt="2026-04-29T00:00:00.000Z" --readingTime="5 min read" --themes="Personal"`
2. Write the post in `src/app/blog/posts/<slug>/content.mdx`
3. Optionally add `opengraph-image.*` and `twitter-image.*`
4. Review the generated entry in `src/app/blog/_data/posts.ts`

The shared post shell lives in `src/app/blog/_components/BlogPostTemplate.tsx`, and standard MDX blog posts are rendered through the shared route/template automatically.

Structure:

```
src/app/blog/
├── _components/
│   ├── BlogCard.tsx
│   ├── BlogHeader.tsx
│   ├── BlogPostMdxPage.tsx
│   └── BlogPostTemplate.tsx
├── _data/
│   └── posts.ts
├── _types/
│   └── blog.ts
├── [slug]/
│   └── page.tsx
├── page.tsx
└── posts/
    └── <slug>/
        ├── content.mdx
        ├── opengraph-image.png|jpg|jpeg|webp
        └── twitter-image.png|jpg|jpeg|webp
```
