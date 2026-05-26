import type { SuggestionCategory, SuggestionReference } from '../_types/suggestion'

export function getAutomaticReference(title: string, category: SuggestionCategory): SuggestionReference {
  const query = encodeURIComponent(title)
  switch (category) {
    case 'manga':
      return {
        url: `https://myanimelist.net/manga.php?q=${query}`,
        siteName: 'MyAnimeList',
        title: `${title} (Manga)`
      }
    case 'anime':
      return {
        url: `https://myanimelist.net/anime.php?q=${query}`,
        siteName: 'MyAnimeList',
        title: `${title} (Anime)`
      }
    case 'music':
      return {
        url: `https://open.spotify.com/search/${query}`,
        siteName: 'Spotify',
        title: `${title} (Music)`
      }
    case 'film':
      return {
        url: `https://www.imdb.com/find?q=${query}`,
        siteName: 'IMDb',
        title: `${title} (Film)`
      }
    case 'series':
      return {
        url: `https://www.imdb.com/find?q=${query}`,
        siteName: 'IMDb',
        title: `${title} (Series)`
      }
    case 'book':
      return {
        url: `https://www.goodreads.com/search?q=${query}`,
        siteName: 'Goodreads',
        title: `${title} (Book)`
      }
    case 'game':
      return {
        url: `https://store.steampowered.com/search/?term=${query}`,
        siteName: 'Steam',
        title: `${title} (Game)`
      }
    default:
      return {
        url: `https://www.google.com/search?q=${query}`,
        siteName: 'Google Search',
        title: `${title}`
      }
  }
}
