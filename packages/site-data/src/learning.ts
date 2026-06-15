export type Week = {
  title: string;
  href: string;
  date: string;
};

export type MonthGroup = {
  month: string;
  weeks: Week[];
};

export const weeks: Week[] = [
  { title: 'Week 7, 2025 (Feb 10 - Feb 16)', href: '/learning/weekly-reflections/week-7', date: '2025-02-16' },
  { title: 'Week 6, 2025 (Feb 3 - Feb 9)', href: '/learning/weekly-reflections/week-6', date: '2025-02-09' },
  { title: 'Week 5, 2025 (Jan 27 - Feb 2)', href: '/learning/weekly-reflections/week-5', date: '2025-02-02' },
  { title: 'Week 4, 2025 (Jan 20 - Jan 26)', href: '/learning/weekly-reflections/week-4', date: '2025-01-26' },
  { title: 'Week 3, 2025 (Jan 14 - Jan 19)', href: '/learning/weekly-reflections/week-3', date: '2025-01-19' },
  { title: 'Week 2, 2025 (Jan 6 - Jan 12)', href: '/learning/weekly-reflections/week-2', date: '2025-01-12' },
  { title: 'Week 1, 2025 (Jan 1 - Jan 5)', href: '/learning/weekly-reflections/week-1', date: '2025-01-05' }
];

export function getWeeksByMonth(): MonthGroup[] {
  const groupedWeeks = weeks.reduce<Record<string, Week[]>>((groups, week) => {
    const date = new Date(week.date);
    const month = date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
    groups[month] = groups[month] ?? [];
    groups[month].push(week);
    return groups;
  }, {});

  return Object.entries(groupedWeeks)
    .map(([month, grouped]) => ({ month, weeks: grouped }))
    .sort((a, b) => {
      const aDate = new Date(a.weeks[0]?.date ?? 0).getTime();
      const bDate = new Date(b.weeks[0]?.date ?? 0).getTime();
      return bDate - aDate;
    });
}
