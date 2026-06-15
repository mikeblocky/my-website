import type { SuggestionCategory, SuggestionReference } from '@mikeblocky/site-data';

export type SuggestionStatus = 'planning' | 'progressing' | 'completed' | 'dropped';

export const categories: Array<{ value: SuggestionCategory; label: string }> = [
  { value: 'manga', label: 'Manga' },
  { value: 'anime', label: 'Anime' },
  { value: 'film', label: 'Film' },
  { value: 'series', label: 'Series' },
  { value: 'book', label: 'Book' },
  { value: 'game', label: 'Game' },
  { value: 'music', label: 'Music' },
  { value: 'other', label: 'Other' }
];

export function getStatusConfig(status: SuggestionStatus | undefined, category: SuggestionCategory) {
  if (!status) return null;

  const isBook = category === 'book' || category === 'manga';
  const isShow = category === 'anime' || category === 'film' || category === 'series';
  const isMusic = category === 'music';
  const isGame = category === 'game';

  switch (status) {
    case 'planning':
      return {
        label: isBook ? 'Plan to read' : isShow ? 'Plan to watch' : isMusic ? 'Plan to listen' : isGame ? 'Plan to play' : 'Plan to check',
        color: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-150'
      };
    case 'progressing':
      return {
        label: isBook ? 'Reading' : isShow ? 'Watching' : isMusic ? 'Listening' : isGame ? 'Playing' : 'Checking',
        color: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-150'
      };
    case 'completed':
      return {
        label: isBook ? 'Read' : isShow ? 'Watched' : isMusic ? 'Listened' : isGame ? 'Played' : 'Checked',
        color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-150'
      };
    case 'dropped':
      return {
        label: 'Dropped',
        color: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-150'
      };
  }
}

export function getHighQualitySuggestionImageUrl(url: string | undefined) {
  if (!url) return undefined;

  try {
    const parsed = new URL(url);

    if (parsed.hostname === 'upload.wikimedia.org' && parsed.pathname.includes('/thumb/')) {
      const parts = parsed.pathname.split('/');
      const fileName = parts.at(-1);
      if (fileName) {
        parts[parts.length - 1] = `1200px-${fileName.replace(/^\d+px-/, '')}`;
        parsed.pathname = parts.join('/');
        return parsed.toString();
      }
    }

    if (parsed.hostname.endsWith('static.wikia.nocookie.net')) {
      parsed.pathname = parsed.pathname.replace(/\/scale-to-width-down\/\d+/i, '/scale-to-width-down/1200');
      return parsed.toString();
    }

    if (parsed.hostname.includes('myanimelist.net')) {
      parsed.pathname = parsed.pathname.replace(/\/r\/\d+x\d+\//i, '/');
      return parsed.toString();
    }
  } catch (_error) {
    return url;
  }

  return url;
}

export function getAutomaticReference(title: string, category: SuggestionCategory): SuggestionReference {
  const query = encodeURIComponent(title);
  switch (category) {
    case 'manga':
      return {
        url: `https://myanimelist.net/manga.php?q=${query}`,
        siteName: 'MyAnimeList',
        title: `${title} (Manga)`
      };
    case 'anime':
      return {
        url: `https://myanimelist.net/anime.php?q=${query}`,
        siteName: 'MyAnimeList',
        title: `${title} (Anime)`
      };
    case 'music':
      return {
        url: `https://open.spotify.com/search/${query}`,
        siteName: 'Spotify',
        title: `${title} (Music)`
      };
    case 'film':
      return {
        url: `https://www.imdb.com/find?q=${query}`,
        siteName: 'IMDb',
        title: `${title} (Film)`
      };
    case 'series':
      return {
        url: `https://www.imdb.com/find?q=${query}`,
        siteName: 'IMDb',
        title: `${title} (Series)`
      };
    case 'book':
      return {
        url: `https://www.goodreads.com/search?q=${query}`,
        siteName: 'Goodreads',
        title: `${title} (Book)`
      };
    case 'game':
      return {
        url: `https://store.steampowered.com/search/?term=${query}`,
        siteName: 'Steam',
        title: `${title} (Game)`
      };
    default:
      return {
        url: `https://www.google.com/search?q=${query}`,
        siteName: 'Google Search',
        title: `${title}`
      };
  }
}
