export type ThreadMessage = {
  id: string;
  role: 'asker' | 'admin';
  body: string;
  createdAt: string;
  imageUrl?: string;
  imageUrls?: string[];
};

export type TalkTopic = {
  id: string;
  author?: string;
  body: string;
  createdAt: string;
  imageUrl?: string;
  imageUrls?: string[];
  reply?: string;
  repliedAt?: string;
  thread?: ThreadMessage[];
};

export type DrawPrompt = {
  id: string;
  author?: string;
  body: string;
  createdAt: string;
  character?: string;
  media?: string;
  imageUrl?: string;
  imageUrls?: string[];
  thread?: ThreadMessage[];
};

export type SuggestionCategory = 'manga' | 'anime' | 'film' | 'series' | 'book' | 'game' | 'music' | 'other';

export type SuggestionReference = {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
  type?: string;
  episodes?: string;
  chapters?: string;
  author?: string;
  releaseDate?: string;
  rating?: string;
};

export type SuggestionStatus = 'planning' | 'progressing' | 'completed' | 'dropped';

export type MediaSuggestion = {
  id: string;
  author?: string;
  title: string;
  category: SuggestionCategory;
  note?: string;
  bestPart?: string;
  reference?: SuggestionReference;
  createdAt: string;
  imageUrl?: string;
  imageUrls?: string[];
  status?: SuggestionStatus;
  thread?: ThreadMessage[];
};

export const initialTalks: TalkTopic[] = [];
export const initialPrompts: DrawPrompt[] = [];
export const initialSuggestions: MediaSuggestion[] = [];
