interface Day {
	title: string;
	href: string;
	date: Date;
}

interface MonthGroup {
	month: string;
	days: Day[];
}

const days: Day[] = [
	{
		title: 'April 26, 2026',
		href: '/diary/daily-notes/days/april-26',
		date: new Date('2026-04-26T00:00:00.000Z')
	},
	
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
		return new Date(Date.parse(`${bMonth} 1, 2000`)).getMonth() - 
			   new Date(Date.parse(`${aMonth} 1, 2000`)).getMonth();
	});
}

export { days };
