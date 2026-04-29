export interface BlogPost {
    id: number;
    title: string;
    description: string;
    date: string;
    publishedAt: string;
    readingTime: string;
    slug: string;
    themes?: string[];
    imageFormat?: 'png' | 'jpg';
    contentClassName?: string;
    renderMode?: 'mdx' | 'custom';
}
