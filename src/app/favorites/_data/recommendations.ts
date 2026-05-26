import type { SuggestionCategory } from '@/app/suggestions/_types/suggestion'

export type RecommendationTab = 'manga' | 'anime' | 'films' | 'games' | 'music'

export interface RecommendationLink {
	label: string
	url: string
}

export interface Recommendation {
	title: string
	creator: string
	category: SuggestionCategory
	medium: string
	status: string
	imageUrl?: string
	thought: string
	links: RecommendationLink[]
}

export const recommendationGroups: Record<RecommendationTab, {
	label: string
	tag: string
	items: Recommendation[]
}> = {
	manga: {
		label: 'Manga',
		tag: 'Read',
		items: [
			{
				title: 'Skip and Loafer',
				creator: 'Misaki Takamatsu',
				category: 'manga',
				medium: 'Manga',
				status: 'All-time favorite',
				imageUrl: '/recommendations/skip-and-loafer.jpg',
				thought: 'This is the one I keep coming back to when I want something gentle but still honest. I love how nobody changes all at once. Everyone is still awkward, a little selfish, a little kind, and somehow that makes their growth feel more real to me.',
				links: [
					{ label: 'Latest volume', url: 'https://www.kodansha.co.jp/comic/products/0000425789' },
					{ label: 'Comic DAYS', url: 'https://comic-days.com/episode/10834108156642600786' },
					{ label: 'Anime site', url: 'https://skip-and-loafer.com/' }
				]
			},
			{
				title: 'Kemutai Hanashi',
				creator: 'Fumiya Hayashi',
				category: 'manga',
				medium: 'Manga',
				status: 'Deep favorite',
				imageUrl: '/recommendations/kemutai-hanashi.png',
				thought: 'I really like how this story lets the relationship stay a little hard to explain. It does not rush to name everything. It just sits with the feeling of choosing someone, sharing daily life, and not needing the outside world to fully understand it.',
				links: [
					{ label: 'COMIC Nettai', url: 'https://www.comicnettai.com/book/9' }
				]
			},
			{
				title: 'I Cannot Reach You',
				creator: 'Mika',
				category: 'manga',
				medium: 'Manga',
				status: 'Recommended',
				imageUrl: '/recommendations/i-cannot-reach-you.jpg',
				thought: 'This one is sweet in a way that feels easy to understand. They are already close, but saying what they actually mean is still difficult. I like that it keeps the tenderness simple without making it feel effortless.',
				links: [
					{ label: 'Latest volume', url: 'https://www.kadokawa.co.jp/product/322407001875/' },
					{ label: 'pixiv Comic', url: 'https://comic.pixiv.net/works/5306' }
				]
			}
		],
	},
	anime: {
		label: 'Anime',
		tag: 'Watch',
		items: [
			{
				title: 'Hoshiai no Sora',
				creator: 'Kazuki Akane / 8bit',
				category: 'anime',
				medium: 'Anime',
				status: 'Personal favorite',
				imageUrl: 'https://www.tbs.co.jp/anime/hoshiai/img/ogp.png',
				thought: 'What stays with me is how much these kids are carrying before they even have the words for it. The tennis gives the story movement, but what I remember most is the need to be noticed, understood, and allowed to exist as you are.',
				links: [
					{ label: 'TBS official site', url: 'https://www.tbs.co.jp/anime/hoshiai/' }
				]
			},
			{
				title: 'Skip and Loafer',
				creator: 'P.A. Works',
				category: 'anime',
				medium: 'Anime',
				status: 'Comfort watch',
				imageUrl: 'https://skip-and-loafer.com/og-image4.jpg',
				thought: 'The anime keeps the lightness of the manga without making it feel shallow. I like how much it trusts small moments: a pause, a bad joke, a look across the classroom, or a friendship becoming easier without anyone announcing it.',
				links: [
					{ label: 'Anime site', url: 'https://skip-and-loafer.com/' },
					{ label: 'Comic DAYS', url: 'https://comic-days.com/episode/10834108156642600786' }
				]
			},
			{
				title: 'A Place Further than the Universe',
				creator: 'Madhouse',
				category: 'anime',
				medium: 'Anime',
				status: 'Recommended',
				imageUrl: 'https://yorimoi.com/images/top-main-v1.jpg',
				thought: 'I like how this makes moving forward feel physical. The girls are going to Antarctica, but emotionally it feels like they are running away from being stuck. It is hopeful without pretending grief or fear disappear cleanly.',
				links: [
					{ label: 'Official site', url: 'https://yorimoi.com/' }
				]
			},
			{
				title: "Girl's Last Tour",
				creator: 'White Fox',
				category: 'anime',
				medium: 'Anime',
				status: 'Recommended',
				imageUrl: 'https://girls-last-tour.com/assets/top/kv1.jpg',
				thought: 'The world is empty, but the show never feels empty to me. I like the little routines: eating, moving, talking, wondering. It makes the end of everything feel quiet, warm, and strangely full of traces people left behind.',
				links: [
					{ label: 'Official site', url: 'https://girls-last-tour.com/' }
				]
			}
		],
	},
	films: {
		label: 'Films',
		tag: 'Watch',
		items: [
			{
				title: 'Four Adventures of Reinette and Mirabelle',
				creator: 'Eric Rohmer',
				category: 'film',
				medium: 'Film',
				status: 'Quiet favorite',
				imageUrl: '/recommendations/four-adventures.webp',
				thought: 'I like how small this movie feels on purpose. It is just two people meeting, talking, misunderstanding each other, and noticing the world in different ways. The charm is in how light it seems until one little conversation stays with you.',
				links: [
					{ label: 'MUBI', url: 'https://mubi.com/en/us/films/four-adventures-of-reinette-and-mirabelle' }
				]
			},
			{
				title: 'Everything Everywhere All at Once',
				creator: 'Daniels',
				category: 'film',
				medium: 'Film',
				status: 'Favorite',
				imageUrl: '/recommendations/eeaao.jpg',
				thought: 'I love how messy and loud this is while still being so simple at the center. Under all the universes and jokes, it is really about being tired, loving badly, and still trying to choose kindness when everything feels impossible.',
				links: [
					{ label: 'A24', url: 'https://a24films.com/films/everything-everywhere-all-at-once' }
				]
			},
			{
				title: 'Perfect Days',
				creator: 'Wim Wenders',
				category: 'film',
				medium: 'Film',
				status: 'Quiet favorite',
				imageUrl: '/recommendations/perfect-days.webp',
				thought: 'This movie makes routine feel almost sacred. I like how it pays attention to small repeated things without pretending they solve loneliness. It just shows a life being lived carefully, with little flashes of beauty passing through it.',
				links: [
					{ label: 'Official site', url: 'https://www.perfectdays-movie.jp/en/' }
				]
			}
		],
	},
	games: {
		label: 'Games',
		tag: 'Play',
		items: [
			{
				title: 'OMORI',
				creator: 'OMOCAT',
				category: 'game',
				medium: 'Game',
				status: 'Emotional favorite',
				imageUrl: 'https://www.omori-game.com/card.png',
				thought: 'I like how cute and uneasy it is at the same time. It feels like walking through a mind that is trying very hard to protect itself, even when that protection has started hurting everyone around it.',
				links: [
					{ label: 'Official site', url: 'https://www.omori-game.com/' },
					{ label: 'Fangamer', url: 'https://www.fangamer.com/collections/omori' }
				]
			}
		],
	},
	music: {
		label: 'Music',
		tag: 'Listen',
		items: [
			{
				title: 'Bialystocks',
				creator: 'Bialystocks',
				category: 'music',
				medium: 'Band',
				status: 'Repeat artist',
				imageUrl: '/recommendations/bialystocks.jpg',
				thought: 'Their music feels polished but not cold. I like how the songs move with this soft, cinematic shape, where everything sounds carefully arranged but still loose enough to breathe.',
				links: [
					{ label: 'Official site', url: 'https://bialystocks.com/' },
					{ label: 'X', url: 'https://x.com/Bialystocks' }
				]
			},
			{
				title: 'Crumb',
				creator: 'Crumb',
				category: 'music',
				medium: 'Band',
				status: 'Repeat artist',
				imageUrl: '/recommendations/crumb.jpg',
				thought: 'Crumb is easy to sink into because the songs feel hazy and half-lit. The grooves are relaxed, but the textures keep moving around, so the music stays dreamy without becoming passive.',
				links: [
					{ label: 'Official site', url: 'https://www.crumbtheband.com/' },
					{ label: 'Instagram', url: 'https://www.instagram.com/some_crumb/' }
				]
			},
			{
				title: 'Lowertown',
				creator: 'Lowertown',
				category: 'music',
				medium: 'Band',
				status: 'Repeat artist',
				imageUrl: '/recommendations/lowertown.jpg',
				thought: 'I like the roughness in their music. It can sound fragile and messy at the same time, like the song is still deciding whether it wants to fall apart or push forward.',
				links: [
					{ label: 'Official site', url: 'https://www.lowertown.band/' },
					{ label: 'Instagram', url: 'https://www.instagram.com/lowrtown/' }
				]
			},
			{
				title: 'kurayamisaka',
				creator: 'kurayamisaka',
				category: 'music',
				medium: 'Band',
				status: 'Repeat artist',
				imageUrl: '/recommendations/kurayamisaka.jpg',
				thought: 'Their songs have this bright ache that I really like. The guitars are noisy and sentimental, and the whole thing feels like a memory that is too big to say plainly.',
				links: [
					{ label: 'KLEW', url: 'https://klew.jp/artists/kurayamisaka' },
					{ label: 'Linktree', url: 'https://linktr.ee/kurayamisaka.band' }
				]
			}
		],
	}
}
