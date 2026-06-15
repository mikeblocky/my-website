export interface SketchbookDrawing {
  id: string;
  author: string;
  body?: string;
  imageUrl: string; // Base64 data URL
  createdAt: string;
  likes?: number;
  thread?: SketchbookThreadMessage[];
}

export interface SketchbookThreadMessage {
  id: string;
  role: 'admin' | 'asker';
  body: string;
  createdAt: string;
  imageUrl?: string;
}
