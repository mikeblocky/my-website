export interface PlaybackActivity {
	id: string
	song: string
	artist: string
	album: string
	artworkUrl: string
	platform: 'spotify' | 'apple-music' | 'youtube'
	songUrl: string
	timestamp: string // ISO string
}

export const musicActivities: PlaybackActivity[] = [
	{
		id: 'act-1',
		song: 'Kirari',
		artist: 'Fujii Kaze',
		album: 'LOVE ALL SERVE ALL',
		artworkUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=120&h=120&fit=crop',
		platform: 'spotify',
		songUrl: 'https://open.spotify.com/track/3ciq34944iZ5C45saJ8v7d',
		timestamp: '2026-05-25T14:15:00+07:00'
	},
	{
		id: 'act-2',
		song: 'Shinunoga E-Wa',
		artist: 'Fujii Kaze',
		album: 'HELP EVER HURT NEVER',
		artworkUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=120&h=120&fit=crop',
		platform: 'apple-music',
		songUrl: 'https://music.apple.com/jp/album/shinunoga-e-wa/1501511216',
		timestamp: '2026-05-25T13:40:00+07:00'
	},
	{
		id: 'act-3',
		song: 'Sparkle',
		artist: 'RADWIMPS',
		album: 'Your Name. (Original Motion Picture Soundtrack)',
		artworkUrl: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=120&h=120&fit=crop',
		platform: 'youtube',
		songUrl: 'https://www.youtube.com/watch?v=a2GujJZfALL',
		timestamp: '2026-05-25T11:20:00+07:00'
	},
	{
		id: 'act-4',
		song: 'Gurenge',
		artist: 'LiSA',
		album: 'LEO-NiNE',
		artworkUrl: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=120&h=120&fit=crop',
		platform: 'spotify',
		songUrl: 'https://open.spotify.com/track/2qOm74hi6oGFlj7v66n4eU',
		timestamp: '2026-05-25T10:05:00+07:00'
	},
	{
		id: 'act-5',
		song: 'Nandemonaiya',
		artist: 'RADWIMPS',
		album: 'Your Name. (Original Motion Picture Soundtrack)',
		artworkUrl: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=120&h=120&fit=crop',
		platform: 'spotify',
		songUrl: 'https://open.spotify.com/track/303D815saU8uG78C7n5e8X',
		timestamp: '2026-05-24T22:15:00+07:00'
	},
	{
		id: 'act-6',
		song: 'Pretender',
		artist: 'Official HIGE DANDism',
		album: 'Traveler',
		artworkUrl: 'https://images.unsplash.com/photo-1487180142328-0c4e37023af5?w=120&h=120&fit=crop',
		platform: 'apple-music',
		songUrl: 'https://music.apple.com/jp/album/pretender/1460570381',
		timestamp: '2026-05-24T20:30:00+07:00'
	},
	{
		id: 'act-7',
		song: 'Kaibutsu (Monster)',
		artist: 'YOASOBI',
		album: 'THE BOOK 2',
		artworkUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=120&h=120&fit=crop',
		platform: 'youtube',
		songUrl: 'https://www.youtube.com/watch?v=dy90tA3TT1c',
		timestamp: '2026-05-24T18:45:00+07:00'
	},
	{
		id: 'act-8',
		song: 'Yoru ni Kakeru',
		artist: 'YOASOBI',
		album: 'THE BOOK',
		artworkUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=120&h=120&fit=crop',
		platform: 'spotify',
		songUrl: 'https://open.spotify.com/track/3ciq34944iZ5C45saJ8v7d',
		timestamp: '2026-05-24T09:10:00+07:00'
	},
	{
		id: 'act-9',
		song: 'Dried Flowers',
		artist: 'Yuuri',
		album: 'Ichi',
		artworkUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=120&h=120&fit=crop',
		platform: 'spotify',
		songUrl: 'https://open.spotify.com/track/1ciq34944iZ5C45saJ8v7d',
		timestamp: '2026-05-23T23:10:00+07:00'
	},
	{
		id: 'act-10',
		song: 'Lemon',
		artist: 'Kenshi Yonezu',
		album: 'BOOTLEG',
		artworkUrl: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=120&h=120&fit=crop',
		platform: 'apple-music',
		songUrl: 'https://music.apple.com/jp/album/lemon/1352125475',
		timestamp: '2026-05-23T15:30:00+07:00'
	}
]
