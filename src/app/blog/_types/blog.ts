export interface BlogPost {
    id: number;
    title: string;
    description: string;
    date: string;
    readingTime: string;
    slug: string;
    theme?: 'Skip and Loafer' | 'Kemutai Hanashi' | 'Fanfiction' | 'Translation' | 'Personal';
    imageFormat?: 'png' | 'jpg';
}