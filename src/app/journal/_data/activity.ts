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

export const musicActivities: PlaybackActivity[] = []

