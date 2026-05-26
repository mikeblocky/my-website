'use client'

import Image from 'next/image'
import { Calendar, ExternalLink, Link as LinkIcon, Star, User } from 'lucide-react'
import { cn } from '@/lib/utils/utils'
import { decodeHtmlEntities } from '@/lib/text/html-entities'
import type { SuggestionReference } from '../_types/suggestion'

export function ReferencePreview({ reference, compact = false }: { reference: SuggestionReference; compact?: boolean }) {
  const hasMeta = reference.author || reference.releaseDate || reference.episodes || reference.chapters || reference.rating
  const title = decodeHtmlEntities(reference.title)
  const description = decodeHtmlEntities(reference.description)
  const author = decodeHtmlEntities(reference.author)
  const releaseDate = decodeHtmlEntities(reference.releaseDate)
  const rating = decodeHtmlEntities(reference.rating)
  const siteName = decodeHtmlEntities(reference.siteName)
  const hasImage = !!reference.image

  return (
    <div className={cn(
      'flex min-w-0 items-stretch rounded-xl bg-teal-50/45 dark:bg-teal-950/10 border border-teal-100/40 dark:border-teal-950/20 overflow-hidden',
      compact && 'bg-slate-100/40 dark:bg-slate-900/50 border-0',
      hasImage ? 'p-0 gap-0' : (compact ? 'p-3 sm:p-4 gap-4' : 'p-4 gap-4')
    )}>
      {hasImage && (
        <div className={cn(
          'relative shrink-0 bg-slate-100 dark:bg-slate-900 border-r border-slate-200/20 dark:border-slate-800/20',
          compact ? 'w-20 sm:w-24' : 'w-24 sm:w-32'
        )}>
          <Image
            src={reference.image!}
            alt=""
            fill
            unoptimized
            sizes={compact ? '96px' : '128px'}
            className="object-cover object-center"
          />
        </div>
      )}
      <div className={cn(
        'min-w-0 flex-1 space-y-2',
        hasImage && (compact ? 'p-3 sm:p-4' : 'p-4')
      )}>
        <div className="flex min-w-0 items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-1.5">
            <LinkIcon size={12} className="shrink-0 text-teal-600 dark:text-teal-400" />
            {reference.url ? (
              <a
                href={reference.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-w-0 items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-teal-700 hover:underline dark:text-teal-300"
              >
                <span className="truncate">{siteName || 'Link'}</span>
                <ExternalLink size={10} className="shrink-0" />
              </a>
            ) : (
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300">Reference</span>
            )}
          </div>

          {rating && (
            <div className="flex items-center gap-1 rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300 border border-amber-500/20">
              <Star size={10} className="fill-amber-500 text-amber-600 dark:text-amber-400" />
              <span>{rating}</span>
            </div>
          )}
        </div>

        <div className="space-y-1">
          {title && (
            <p className="line-clamp-2 text-sm font-bold text-slate-800 dark:text-slate-100">
              {title}
            </p>
          )}

          {hasMeta && (
            <div className="flex flex-wrap gap-x-3 gap-y-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400 pt-0.5">
              {author && (
                <span className="flex items-center gap-1">
                  <User size={11} className="text-teal-600/70" />
                  <span className="truncate max-w-[120px]" title={author}>{author}</span>
                </span>
              )}
              {releaseDate && (
                <span className="flex items-center gap-1">
                  <Calendar size={11} className="text-teal-600/70" />
                  <span>{releaseDate}</span>
                </span>
              )}
              {reference.episodes && (
                <span className="flex items-center gap-1 rounded-full bg-teal-50 px-2 py-0.25 text-[10px] font-semibold text-teal-700 dark:bg-teal-950/40 dark:text-teal-400">
                  {reference.episodes} eps
                </span>
              )}
              {reference.chapters && (
                <span className="flex items-center gap-1 rounded-full bg-teal-50 px-2 py-0.25 text-[10px] font-semibold text-teal-700 dark:bg-teal-950/40 dark:text-teal-400">
                  {reference.chapters}
                </span>
              )}
            </div>
          )}

          {description && (
            <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground pt-0.5">
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
