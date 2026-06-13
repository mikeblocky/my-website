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
	covers?: string[]
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
				title: 'Skip and Loafer (スキップとローファー)',
				creator: 'Misaki Takamatsu',
				category: 'manga',
				medium: 'Manga',
				status: 'All-time favorite',
				imageUrl: '/recommendations/skip-and-loafer-manga.jpg',
				covers: [
					'/recommendations/skip-and-loafer_manga.jpg'
				],
				thought: 'Every time I reread this, I’m reminded of how rare it is for a story to treat its characters with such complete kindness. It’s my absolute comfort read because nobody changes overnight; their growth is slow, quiet, and feels so honest. It always makes me feel like it’s okay to be a little awkward, as long as we keep trying to connect.',
				links: [
					{ label: 'Latest volume', url: 'https://www.kodansha.co.jp/comic/products/0000425789' },
					{ label: 'Comic DAYS', url: 'https://comic-days.com/episode/10834108156642600786' },
					{ label: 'Anime site', url: 'https://skip-and-loafer.com/' },
					{ label: 'Author', url: 'https://x.com/takamatsumisaki' }
				]
			},
			{
				title: 'Kemutai Hanashi (煙たい話)',
				creator: 'Fumiya Hayashi',
				category: 'manga',
				medium: 'Manga',
				status: 'Deep favorite',
				imageUrl: '/recommendations/kemutai-hanashi.png',
				covers: [
					'/recommendations/kemutai_hanashi.jpg',
					'/recommendations/kemutai-hanashi.png'
				],
				thought: 'There’s this beautiful, hazy atmosphere to the way their relationship develops. I love how it doesn’t rush to label what they are to each other. It just sits with the quiet comfort of sharing an apartment, choosing to live together, and letting the days pass without needing the outside world’s approval. Beside that, solving the lingering feelings having in each character is a beautiful thing to happen, and I appreciate the writing in that sense.',
				links: [
					{ label: 'COMIC Nettai', url: 'https://www.comicnettai.com/book/9' },
					{ label: 'Author', url: 'https://x.com/fuhit0be' },
				]
			},
			{
				title: 'I Cannot Reach You (君には届かない。)',
				creator: 'Mika',
				category: 'manga',
				medium: 'Manga',
				status: 'Recommended',
				imageUrl: '/recommendations/kiminai.jpg',
				covers: [
					'/recommendations/i-cannot-reach-you.jpg'
				],
				thought: 'What strikes me most here is how much weight is carried by the things they don’t say. They are childhood friends, so they are incredibly close, yet communicating their actual feelings is the hardest part. I love that the story respects that difficulty; it makes the small, tender moments feel so earned and fragile.',
				links: [
					{ label: 'Latest volume', url: 'https://www.kadokawa.co.jp/product/322407001875/' },
					{ label: 'pixiv Comic', url: 'https://comic.pixiv.net/works/5306' },
					{ label: 'Author', url: 'https://x.com/mika_nist' }
				]
			},
			{
				title: 'Toilet-bound Hanako-kun (地縛少年花子くん)',
				creator: 'AidaIro',
				category: 'manga',
				medium: 'Manga',
				status: 'Highly recommended',
				imageUrl: '/recommendations/hanako_manga.jpg',
				covers: [
					'/recommendations/hanako_manga.jpg'
				],
				thought: 'The artwork is what drew me in, like stepping into a fairytale, but what kept me was the sadness of the story. Beneath the playful school ghost rumors, there is this heavy, lingering feeling of regret, mortality, and wanting to protect someone even when you know your time is running out.',
				links: [
					{ label: 'Manga site', url: 'https://magazine.jp.square-enix.com/gfantasy/story/hanakokun/' },
					{ label: 'Anime site', url: 'https://hanakokun.com/2nd/' },
					{ label: 'Author', url: 'https://x.com/aidairo2009' },
					{ label: 'Latest volume', url: 'https://www.amazon.co.jp/gp/product/4757599811' },
				]
			},
			{
				title: 'The lights that are (あまたある光)',
				creator: 'hibi no anz (日々の杏)',
				category: 'manga',
				medium: 'Manga',
				status: 'Recommended',
				imageUrl: '/recommendations/hikari1.jpg',
				covers: [
					'/recommendations/hikari.jpg'
				],
				thought: 'Grief is so hard to capture without feeling performative, but this story hits me right in the chest. Watching the sister slowly piece together the life of her brother after his sudden death is incredibly painful but so tender. It reminded me of how we only ever see fragments of the people we love.',
				links: [
					{ label: 'COMIC Nettai', url: 'https://www.comicnettai.com/book/26' },
					{ label: 'Author', url: 'https://x.com/hibi_no_anz' },
					{ label: 'Purchase', url: 'https://www.amazon.co.jp/dp/B0H2H7XMHM' }
				]
			},
			{
				title: 'School of Suzume (すずめの学校)',
				creator: 'Machiko Kyo (今日マチ子)',
				category: 'manga',
				medium: 'Manga',
				status: 'Recommended',
				imageUrl: '/recommendations/gakkou.jpg',
				covers: [
					'/recommendations/gakkou.jpg'
				],
				thought: 'This really took me back to that anxiety of being young, where every exam and expectation feels like the end of the world. It captures the transition from childhood to junior high with so much empathy, showing the small, secret rebellions of girls just trying to stand on their own feet.',
				links: [
					{ label: 'Author', url: 'https://x.com/machikomemo' },
					{ label: 'Purchase', url: 'https://www.amazon.co.jp/gp/aw/d/B0CHW65D9V' }
				]
			},
			{
				title: 'Handkerchief in hand, waiting for a time machine, silent through the final scene (ハンケチーフ持って、タイムマシーン待って、ラストシーン黙って)',
				creator: 'Sagan Sagan (佐岸左岸)',
				category: 'manga',
				medium: 'Manga',
				status: 'Recommended',
				imageUrl: '/recommendations/time1.jpg',
				covers: [
					'/recommendations/time.jpg'
				],
				thought: 'I love Sagan Sagan’s art; there’s a soft, delicate texture that fits the story perfectly. It feels like a walk through nostalgia, looking at the connections we form that shape who we are, even if they only last for a single season.',
				links: [
					{ label: 'Manga preview', url: 'https://shiori-on.com/product/handkerchief' },
					{ label: 'Author', url: 'https://x.com/sagan2staff' },
					{ label: 'Purchase', url: 'https://www.amazon.co.jp/dp/4813054358' }
				]
			},
			{
				title: 'Hirayasumi (ひらやすみ)',
				creator: 'Keigo Shinzō (真造圭伍)',
				category: 'manga',
				medium: 'Manga',
				status: 'Recommended',
				imageUrl: '/recommendations/hirayasumi1.jpg',
				covers: [
					'/recommendations/hirayasumi.jpg'
				],
				thought: 'This is like a warm cup of tea on a rainy afternoon. Following Hiro’s slow, aimless days in Tokyo makes me want to slow down my own life. It finds joy in ordinary things like eating croquettes, chatting with neighbors, and sitting on the veranda. It reminds me that you don\'t need a grand purpose to live a good life.',
				links: [
					{ label: 'Author', url: 'https://x.com/shinzokeigo' },
					{ label: 'Purchase (latest volume)', url: 'https://www.amazon.co.jp/dp/4098638878' }
				]
			},
			{
				title: 'Stargazing Dog (星守る犬)',
				creator: 'Takashi Murakami (村上たかし)',
				category: 'manga',
				medium: 'Manga',
				status: 'Recommended',
				imageUrl: '/recommendations/star_gazing.jpg',
				covers: [
					'/recommendations/star_gazing.jpg'
				],
				thought: 'I don’t think I’ve ever cried as hard at a manga as I did with this one. It’s a devastating look at loneliness, but the dog Happy’s unwavering, pure devotion to his owner is what stays with me. It’s a painful read, but it makes me want to hold my own loved ones a little closer.',
				links: [
					{ label: 'Futabasha', url: 'https://www.futabasha.co.jp/book/97845753014340000000' }
				]
			},
			{
				title: 'Solanin (ソラニン)',
				creator: 'Inio Asano (浅野いにお)',
				category: 'manga',
				medium: 'Manga',
				status: 'Recommended',
				imageUrl: '/recommendations/solanin.jpg',
				covers: [
					'/recommendations/solanin.jpg'
				],
				thought: 'This was my bible during that phase of transitioning from school to being an adult, when you\'re just drifting and terrified of the future. Asano Inio captures the confusing ache of wanting to make something meaningful while struggling to pay rent. The band, the grief, the messy relationships; it all feels so real and close to home.',
				links: [
					{ label: 'Author', url: 'https://x.com/asano_inio' },
					{ label: 'Purchase', url: 'https://www.amazon.co.jp/dp/B009JZH4CY' }
				]
			},
			{
				title: 'Umibe no Stove (うみべのストーブ 大白小蟹短編集)',
				creator: 'Oshiro Kogani (大白小蟹)',
				category: 'manga',
				medium: 'Manga',
				status: 'Recommended',
				imageUrl: '/recommendations/stove1.jpg',
				covers: [
					'/recommendations/stove.jpg'
				],
				thought: 'These short stories feel like poetry. They capture those small, fleeting shifts in relationships, like the moment you realize you’re drifting apart, or the warmth of a shared room. The title story about a stove witnessing a breakup is incredibly creative and moving.',
				links: [
					{ label: 'Author', url: 'https://x.com/ROIHOS' },
					{ label: 'Purchase', url: 'https://amazon.co.jp/dp/B0BMKHQLMM' }
				]
			},
			{
				title: 'Even if you shine, even if you don’t (キラキラしても、しなくても)',
				creator: 'Sadaji Koike (小池定路)',
				category: 'manga',
				medium: 'Manga',
				status: 'Recommended',
				imageUrl: '/recommendations/kirakira1.jpg',
				covers: [
					'/recommendations/kirakira.jpg'
				],
				thought: 'I really love how grounded this collection feels. It follows high school boys without the usual dramatic tropes, focusing instead on the fragile moments of adolescence and friendship. It’s a bit melancholy but feels incredibly honest.',
				links: [
					{ label: 'Author', url: 'https://x.com/koike_sadaji' },
					{ label: 'Futabasha', url: 'https://www.futabasha.co.jp/book/97845758599660000000' }
				]
			},
			{
				title: 'One Room Angel (ワンルームエンジェル)',
				creator: 'Harada (はらだ)',
				category: 'manga',
				medium: 'Manga',
				status: 'Recommended',
				imageUrl: '/recommendations/one_room_angel.jpg',
				covers: [
					'/recommendations/one_room_angel.jpg'
				],
				thought: 'A unique story that balances crude humor with heavy emotional weight. The relationship between a broken man and a cynical angel is written with so much heart. It\'s a story about healing from trauma in the most unexpected way, and the ending always gets to me.',
				links: [
					{ label: 'Author', url: 'https://x.com/harada_info' },
					{ label: 'Shodensha', url: 'https://www.shodensha.co.jp/oneroomangel/' },
					{ label: 'Purchase', url: 'https://www.amazon.co.jp/dp/B07NP7GLKL' }
				]
			},
			{
				title: 'Erased (僕だけがいない街)',
				creator: 'Kei Sanbe (三部けい)',
				category: 'manga',
				medium: 'Manga',
				status: 'Recommended',
				imageUrl: '/recommendations/erased1.jpg',
				covers: [
					'/recommendations/erased.jpg'
				],
				thought: 'While the mystery and time-travel keep you hooked, the heart of the story is Satoru’s drive to save Hinazuki. That scene of her seeing a warm breakfast for the first time always stays with me. It’s a thriller, but at its core, it’s about how simple kindness can save a life.',
				links: [
					{ label: 'Kadokawa', url: 'https://www.kadokawa.co.jp/product/321208000180/' }
				]
			},
			{
				title: 'Summer Ghost (サマーゴースト)',
				creator: 'Yoshi Inomi (井ノ巳吉), loundraw, Adachi Hirotaka (Otsuichi) (安達寛高（乙一））',
				category: 'manga',
				medium: 'Manga',
				status: 'Recommended',
				imageUrl: '/recommendations/summer_ghost_manga.jpg',
				covers: [
					'/recommendations/summer_ghost_manga.jpg'
				],
				thought: 'It’s amazing how much emotion is packed into such a short story. The manga captures the film’s reflective mood perfectly. It deals with heavy themes of suicide and despair, but leaves you with a fragile, precious feeling of wanting to live.',
				links: [
					{ label: 'Author - loundraw', url: 'https://x.com/loundraw' },
					{ label: 'Online reading', url: 'https://tonarinoyj.jp/episode/3269754496537164447' },
					{ label: 'Purchase', url: 'https://www.amazon.co.jp/dp/4088921372' }
				]
			},
			{
				title: 'Pajama Gohan (ぱじゃまご飯)',
				creator: 'Megumi Watanabe (わたなべ萌)',
				category: 'manga',
				medium: 'Manga',
				status: 'Recommended',
				imageUrl: '/recommendations/pajama.jpg',
				covers: [
					'/recommendations/pajama.jpg'
				],
				thought: 'There’s something so comforting about Pajama Gohan. It follows a freelance guy who works from home and cooks simple, satisfying comfort meals while staying in his pajamas. Reading it feels like a lazy Sunday morning, making me want to whip up something warm and just enjoy being cozy.',
				links: [
					{ label: 'Author', url: 'https://x.com/wtnbmotimoto' },
					{ label: 'Purchase', url: 'https://www.amazon.co.jp/dp/4046842563' }
				]
			},
			{
				title: 'Tanaka-kun is Always Listless (田中くんはいつもけだるげ)',
				creator: 'Nozomi Uda',
				category: 'manga',
				medium: 'Manga',
				status: 'Comfort read',
				imageUrl: '/recommendations/tanaka_kun_manga.png',
				covers: [
					'/recommendations/tanaka_kun_manga.png'
				],
				thought: 'Uda Nozomi’s clean layouts and thin, delicate lines fit Tanaka\'s lethargy perfectly. The comedy never feels rushed, choosing instead to drift through slow school days. I love how it celebrates the ease of a friendship where you can sit together in silence without any pressure.',
				links: [
					{ label: 'Author', url: 'https://x.com/8kaichi' },
					{ label: 'Reading preview & purchase', url: 'https://www.ganganonline.com/title/86' },
				]
			},
			{
				title: "Minato's Laundromat (みなと商事コインランドリー)",
				creator: 'Yuzu Tsubaki / Sawa Kanzume',
				category: 'manga',
				medium: 'Manga',
				status: 'Recommended',
				imageUrl: '/recommendations/minato_laundromat.png',
				covers: [
					'/recommendations/minato_laundromat.png'
				],
				thought: 'There is a sun-bleached, nostalgic warmth to this run-down laundromat. While the age-gap romance has plenty of playful bickering, what really holds the story together is its emotional honesty. Akira\'s fear of growing up and facing adulthood gets constantly challenged by Shintarou\'s absolute, unswerving clarity. It feels like a lazy summer afternoon where the heat refuses to fade.',
				links: [
					{ label: 'Official account', url: 'https://x.com/minato_syouji' },
					{ label: 'pixiv Comic', url: 'https://comic.pixiv.net/works/6246' },
					{ label: 'Purchase (latest volume)', url: 'https://www.kadokawa.co.jp/product/322601000095/' }
				]
			},
			{
				title: 'Love Bullet (ラブ・バレット)',
				creator: 'inee',
				category: 'manga',
				medium: 'Manga',
				status: 'Recommended',
				imageUrl: '/recommendations/love_bullet_manga.png',
				covers: [
					'/recommendations/love_bullet_manga.png'
				],
				thought: 'On the surface, it’s a high-energy action story about Cupids using guns instead of bows to shoot bullets of love. But beneath the stylish shipping wars and shootout scenes, there is a real, lingering sadness about regret and the memories of their past human lives. It does a great job of matching its stylish look with genuine emotional weight.',
				links: [
					{ label: 'Author', url: 'https://x.com/inee' },
					{ label: 'Comic WALKER', url: 'https://comic-walker.com/detail/KC_005229_S/episodes/KC_0052290000100011_E?episodeType=first' },
					{ label: 'Purchase (volume 1)', url: 'https://www.amazon.co.jp/-/en/inee-ebook/dp/B0CW1FRJDD/' },
					{ label: 'Purchase (volume 2)', url: 'https://www.amazon.co.jp/dp/4046849266?' }
				]
			},
			{
				title: 'Sweet, Spicy, and Sour (甘くて辛くて酸っぱい)',
				creator: 'Hasha (はしゃ)',
				category: 'manga',
				medium: 'Manga',
				status: 'Recommended',
				imageUrl: '/recommendations/amakute_karakute.png',
				covers: [
					'/recommendations/amakute_karakute.png'
				],
				thought: 'Following three thirty-something women sharing a second house in the countryside feels like taking a deep breath. I love how the simple routines of cooking and eating together mirror their personal lives, where sweetness tempers acidity and a little spice brings warmth to cold days. It captures the comfort of female friendship and the slow, unhurried process of finding yourself in your thirties.',
				links: [
					{ label: 'Author', url: 'https://x.com/suya_lemon' },
					{ label: 'Official site', url: 'https://shuro.world/manga/delicious/' },
					{ label: 'Purchase', url: 'https://www.amazon.co.jp/dp/4838733208'}
				]
			},
			{
				title: 'Okaeri Aureole (おかえりオーレオール)',
				creator: 'Takatsu (高津) - former pen name of Takamatsu-sensei',
				category: 'manga',
				medium: 'Manga',
				status: 'Recommended',
				imageUrl: '/recommendations/okaeri.jpg',
				covers: [
					'/recommendations/okaeri.jpg'
				],
				thought: 'There is a real patience to how their childhood bond shifts into something heavier and harder to define. It captures that boundary where a shared history becomes both a comfort and a barrier. I love how it trusts small shifts in posture and the silence between their words to show the depth of their connection.',
				links: [
					{ label: 'Author', url: 'https://x.com/takamatsumisaki' },
					{ label: 'pixiv Comic', url: 'https://comic.pixiv.net/works/7772' },
					{ label: 'Purchase', url: 'https://www.amazon.co.jp/dp/4829685883' }
				]
			},
			{
				title: 'At the end of the mourning period (四十九日のお終いに 田沼朝作品集)',
				creator: 'Asa Tanuma (田沼朝)',
				category: 'manga',
				medium: 'Manga',
				status: 'Recommended',
				imageUrl: '/recommendations/asa.jpg',
				covers: [
					'/recommendations/asa.jpg'
				],
				thought: 'Reading this collection feels like finding a warm pocket on a cold evening. Tanuma Asa writes about human connections, like friendships, grief, and the subtle ways we lean on each other, with an incredibly down-to-earth touch. The dynamics between characters are complex and human, lingering in your head long after you close the book.',
				links: [
					{ label: 'Author', url: 'https://x.com/tanumaasa' },
					{ label: 'Comic WALKER', url: 'https://comic-walker.com/detail/KC_000574_S?episodeType=comics' },
					{ label: 'Purchase', url: 'https://www.amazon.co.jp/dp/4047373389' }
				]
			},
			{
				title: 'Stardust Family (星屑家族)',
				creator: 'Aki Horoyama (幌山あき)',
				category: 'manga',
				medium: 'Manga',
				status: 'Recommended',
				imageUrl: '/recommendations/kazoku.jpg',
				covers: [
					'/recommendations/kazoku.jpg'
				],
				thought: 'Underneath its sterile, near-future SF premise of child welfare evaluation, it is a deeply human exploration of what it means to choose to be a family. It doesn\'t look away from the messy, painful realities of parenthood, but it handles the characters\' vulnerabilities with incredible care. The final chapters are profoundly moving.',
				links: [
					{ label: 'Author', url: 'https://x.com/poroyama_aki' },
					{ label: 'Comic WALKER', url: 'https://comic-walker.com/detail/KC_004260_S?episodeType=comics' },
					{ label: 'Purchase', url: 'https://www.amazon.co.jp/dp/B0BT75QCJY' }
				]
			},
			{
				title: 'Alice, Everywhere (ありす、宇宙までも)',
				creator: 'Kiko Urino (売野機子)',
				category: 'manga',
				medium: 'Manga',
				status: 'Recommended',
				imageUrl: '/recommendations/arisu.png',
				covers: [
					'/recommendations/arisu.png'
				],
				thought: 'A story about semilingualism, isolation, and wanting to reach the stars. The bond between Alice and the class genius, Rui, is fragile but incredibly fierce. Urino Kiko does a wonderful job capturing the sensory side of language (and the painful lack of it), turning the vast, cold cosmos into a place of ultimate freedom and connection.',
				links: [
					{ label: 'Author', url: 'https://x.com/urino_kiko' },
					{ label: 'Spirits page', url: 'https://bigcomicbros.net/work/83391/' },
					{ label: 'Purchase', url: 'https://www.amazon.co.jp/gp/product/B0GMDWHTV7' }
				]
			}
		],
	},
	anime: {
		label: 'Anime',
		tag: 'Watch',
		items: [
			{
				title: 'Sonny Boy',
				creator: 'Shingo Natsume / Madhouse',
				category: 'anime',
				medium: 'Anime',
				status: 'Masterpiece',
				imageUrl: '/recommendations/sonny-boy_anime.jpg',
				thought: 'It feels like drifting through the hazy currents of adolescence, where classrooms float in an endless void and rules melt away. It’s a subtle rebellion against growing up, and a search for a compass when the stars have lost their names. A beautiful story about youth and holding onto a fragile sense of hope.',
				links: [
					{ label: 'Official site', url: 'https://anime.shochiku.co.jp/sonny-boy/' }
				]
			},
			{
				title: 'Hoshiai no Sora',
				creator: 'Kazuki Akane / 8bit',
				category: 'anime',
				medium: 'Anime',
				status: 'Personal favorite',
				imageUrl: '/recommendations/hoshai_no_sora.jpg',
				thought: 'These kids carry a heavy weight before they even have the words to name it. The tennis matches give the story movement, but what stays with me is their search for a space to belong. It captures that honest, desperate need to be noticed, understood, and allowed to exist as you are.',
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
				imageUrl: '/recommendations/skip-and-loafer_anime.webp',
				thought: 'It captures the lightness of youth without brushing past its small, everyday anxieties. The beauty lies in how much it trusts the unsaid: a sudden pause, a bad joke, or a look across a classroom. It makes the slow ease of a growing friendship feel like the most natural thing in the world.',
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
				imageUrl: '/recommendations/further_than_universe.avif',
				thought: 'It makes the act of moving forward feel physical and real. The journey to the edge of the earth is an escape from being stuck in grief. It’s a very hopeful story, but it never cheapens the pain, letting loss and fear exist without neat resolutions.',
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
				imageUrl: '/recommendations/girl_last_tour.jpg',
				thought: 'An empty world that somehow feels warm and full of life. I love the little, repetitive routines like cooking soup in the snow, maintaining the half-broken kettenkrad, and looking up at the rain. It makes the end of everything feel peaceful and comforting, filled with the traces of people who came before.',
				links: [
					{ label: 'Official site', url: 'https://girls-last-tour.com/' }
				]
			},
			{
				title: 'Toilet-bound Hanako-kun',
				creator: 'Lerche',
				category: 'anime',
				medium: 'Anime',
				status: 'Recommended watch',
				imageUrl: '/recommendations/hanako_anime.webp',
				thought: 'Seeing AidaIro\'s vintage, stained-glass artwork come alive in motion is beautiful. The anime captures the playful yet eerie atmosphere perfectly, but what stays with me is the sadness beneath the comedy: the fragile connections between the living and the dead, and the fear of being forgotten.',
				links: [
					{ label: 'Official TBS site', url: 'https://www.tbs.co.jp/anime/hanakokun/' },
					{ label: 'Official Anime X', url: 'https://x.com/hanakokun_info' }
				]
			},
			{
				title: 'Summer Ghost (サマーゴースト)',
				creator: 'loundraw / Flat Studio',
				category: 'anime',
				medium: 'Anime',
				status: 'Recommended',
				imageUrl: '/recommendations/summer_ghost.jpg',
				thought: 'A short, touching film about the fragile edge of youth, where life and death can feel almost interchangeable. Watching three teenagers seek answers from a ghost because they feel invisible in their own lives leaves you with a lasting, precious feeling of wanting to hold onto today.',
				links: [
					{ label: 'Official Site', url: 'https://summerghost.jp/' }
				]
			},
			{
				title: 'Tanaka-kun is Always Listless (田中くんはいつもけだるげ)',
				creator: 'Nozomi Uda / Silver Link.',
				category: 'anime',
				medium: 'Anime',
				status: 'Comfort watch',
				imageUrl: '/recommendations/tanaka_kun.png',
				thought: 'It makes doing absolutely nothing look like an art form. The comedy has a slow, patient rhythm, and there is a strange grace in Tanaka\'s laziness. It’s a nice reminder that napping under the afternoon sun and letting the busy world pass you by is a perfectly fine way to live.',
				links: [
					{ label: 'Official site', url: 'https://tanakakun.tv/' }
				]
			},
			{
				title: "Kino's Journey (キノの旅 -the Beautiful World-) (2003)",
				creator: 'Ryutaro Nakamura / A.C.G.T.',
				category: 'anime',
				medium: 'Anime',
				status: 'Recommended',
				imageUrl: '/recommendations/kinos_journey.png',
				thought: '"The world is not beautiful, therefore it is." That idea carries every episode. Following Kino and Hermes through a series of strange countries feels like reading a book of dark, philosophical fables. It doesn\'t judge the flaws of humanity, but simply observes them with a detached, yet deeply empathetic curiosity.',
				links: [
					{ label: 'Original site', url: 'https://kinonotabi.com/' }
				]
			},
			{
				title: 'Colorful (カラフル)',
				creator: 'Keiichi Hara / Sunrise',
				category: 'anime',
				medium: 'Anime',
				status: 'Recommended',
				imageUrl: '/recommendations/colorful.png',
				thought: 'A raw look at depression and family expectations. It never shies away from how exhausting it can be to just exist, but it reminds us that life is painted in a spectrum of messy, overlapping colors. We are all allowed to make mistakes, piece ourselves back together, and find our own pace.',
				links: [
					{ label: 'Official site', url: 'https://www.sunrise-inc.co.jp/colorful/' }
				]
			},
			{
				title: 'Nichijou (日常)',
				creator: 'Kyoto Animation',
				category: 'anime',
				medium: 'Anime',
				status: 'Personal favorite',
				imageUrl: '/recommendations/nichijou.png',
				thought: 'It turns the mundane absurdities of high school into grand, explosive spectacles. Yet, beneath the chaotic pacing and brilliant animation, there is a real affection for the ordinary. It celebrates the ridiculous, shared moments that make the everyday feel so vibrant and unforgettable.',
				links: [
					{ label: 'Kyoto Animation', url: 'https://www.kyotoanimation.co.jp/works/nichijou/' }
				]
			},
			{
				title: 'Barakamon (ばらかもん)',
				creator: 'Kinema Citrus',
				category: 'anime',
				medium: 'Anime',
				status: 'Comfort watch',
				imageUrl: '/recommendations/barakamon.png',
				thought: 'I love how Handa\'s self-discovery is bound to the slow rhythm of the island and the warmth of its villagers. It shows that failure is not a dead end, but a space to breathe and find a voice that belongs to you alone. The children\'s laughter and the salty sea breeze feel entirely real.',
				links: [
					{ label: 'Official site', url: 'https://www.vap.co.jp/barakamon/' }
				]
			},
			{
				title: 'Handa-kun (はんだくん)',
				creator: 'Diomedéa',
				category: 'anime',
				medium: 'Anime',
				status: 'Recommended watch',
				imageUrl: '/recommendations/handa_kun.png',
				thought: 'A funny, anxiety-driven mirror to Barakamon that captures the comedy of teenage isolation. It shows how easily we can get trapped in our own heads, translating genuine admiration into imagined hostility. There is a strange comfort in its absurdity, showing that we are often our own harshest critics.',
				links: [
					{ label: 'TBS official site', url: 'https://www.tbs.co.jp/anime/handaanime/' }
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
				imageUrl: '/recommendations/omori.avif',
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
				title: 'kurayamisaka (Slope of Shadows)',
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
			},
			{
				title: 'Alex G',
				creator: 'Alex G',
				category: 'music',
				medium: 'artist',
				status: 'All-time favorite',
				imageUrl: '/recommendations/alex-g.jpg',
				thought: 'His music has this raw, home-recorded intimacy that feels both comforting and nostalgic. It blends indie folk with lo-fi textures, creating melodies that are simple at first but reveal more complexity the more you listen.',
				links: [
					{ label: 'Official site', url: 'https://sandyalexg.com' },
					{ label: 'Bandcamp', url: 'https://sandy.bandcamp.com' },
					{ label: 'Instagram', url: 'https://www.instagram.com/sandyalexg/' }
				]
			},
			{
				title: 'Trooper Salute',
				creator: 'Trooper Salute',
				category: 'music',
				medium: 'Band',
				status: 'Comfort watch',
				imageUrl: '/recommendations/trooper_salute.jpeg',
				thought: 'I love the symphonic indie pop melodies they build. Under the nostalgic vocals, there is a rich keyboard and guitar arrangement that carries a lovely Nagoya light-music club energy. It is pop-rock that feels both grand and personal.',
				links: [
					{ label: 'Official site', url: 'https://troopersalute.com' }
				]
			}
		],
	}
}

