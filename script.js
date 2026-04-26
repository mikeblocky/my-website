const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, 'src', 'app', 'diary', 'daily-notes');
const daysDir = path.join(baseDir, 'days');

// Create directories
fs.mkdirSync(daysDir, { recursive: true });

// Data for the days
const daysData = [];
for (let i = 20; i <= 26; i++) {
    const slug = `april-${i}`;
    const dateStr = `2026-04-${i}`;
    const title = `April ${i}, 2026`;
    
    daysData.push({
        title: title,
        href: `/diary/daily-notes/days/${slug}`,
        date: new Date(dateStr)
    });

    const dayDir = path.join(daysDir, slug);
    fs.mkdirSync(dayDir, { recursive: true });

    // layout.tsx
    const layoutContent = `import { Metadata } from 'next'

export const metadata: Metadata = {
    title: '${title} | mikeblocky.com',
    description: 'My daily notes for ${title}',
    openGraph: {
        title: '${title} | mikeblocky.com',
        description: 'My daily notes for ${title}',
        type: 'article',
    },
    twitter: {
        card: 'summary_large_image',
        title: '${title} | mikeblocky.com',
        description: 'My daily notes for ${title}',
    }
}

export default function Layout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
} 
`;
    fs.writeFileSync(path.join(dayDir, 'layout.tsx'), layoutContent);

    // page.tsx
    const pageContent = `'use client'

import Content from './content.mdx'
import { mdxComponents } from '@/lib/mdx/mdx-components'
import BaseContainer from '@/components/layout/container/base-container'
import { StackVertical } from '@/components/layout/layout-stack/layout-stack'
import { DynamicBreadcrumb } from '@/components/ui/primitives/breadcrumb'
import { ThemeToggle } from '@/components/ui/theme/theme-toggle'
import { IndividualPageFooter } from '@/components/layout/footer/IndividualPageFooter'
import TextHeading from '@/components/ui/text-heading/text-heading'
import Text from '@/components/ui/text/text'

export default function DailyNote() {
    return (
        <BaseContainer size="md" paddingX="md" paddingY="lg">
            <StackVertical gap="md">
                <div className="flex items-center justify-between">
                    <DynamicBreadcrumb 
                        items={[
                            { href: '/', label: 'Home', emoji: '👾' },
                            { href: '/diary', label: 'Diary' },
                            { href: '/diary/daily-notes', label: 'Daily notes' },
                            { label: '${title}' }
                        ]}
                    />
                    <ThemeToggle />
                </div>

                <article>
                    <TextHeading as="h1">${title}</TextHeading>

                    <div className="prose dark:prose-invert max-w-none mt-8">
                        <Content components={mdxComponents} />
                    </div>
                </article>
            </StackVertical>

            <IndividualPageFooter parentPageName='Daily notes' showToTop={false} />
        </BaseContainer>
    )
}
`;
    fs.writeFileSync(path.join(dayDir, 'page.tsx'), pageContent);

    // content.mdx
    const mdxContent = `This is my note for ${title}.

### Today's reflection

*   Did some reading.
*   Practiced drawing.
*   Wrote some code.
`;
    fs.writeFileSync(path.join(dayDir, 'content.mdx'), mdxContent);
}

// Write _data/days.ts
const dataDir = path.join(baseDir, '_data');
fs.mkdirSync(dataDir, { recursive: true });

const daysTsContent = `interface Day {
	title: string;
	href: string;
	date: Date;
}

interface MonthGroup {
	month: string;
	days: Day[];
}

const days: Day[] = [
${daysData.reverse().map(d => `	{
		title: '${d.title}',
		href: '${d.href}',
		date: new Date('${d.date.toISOString()}')
	}`).join(',\n')}
]

export function getDaysByMonth(): MonthGroup[] {
	const groupedDays = days.reduce((acc: { [key: string]: Day[] }, day) => {
		const monthYear = day.date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
		if (!acc[monthYear]) {
			acc[monthYear] = [];
		}
		acc[monthYear].push(day);
		return acc;
	}, {});

	return Object.entries(groupedDays).map(([month, days]) => ({
		month,
		days
	})).sort((a, b) => {
		const [aMonth, aYear] = a.month.split(' ');
		const [bMonth, bYear] = b.month.split(' ');
		if (aYear !== bYear) return parseInt(bYear) - parseInt(aYear);
		return new Date(Date.parse(\`\${bMonth} 1, 2000\`)).getMonth() - 
			   new Date(Date.parse(\`\${aMonth} 1, 2000\`)).getMonth();
	});
}

export { days };
`;
fs.writeFileSync(path.join(dataDir, 'days.ts'), daysTsContent);

console.log("Created successfully");
