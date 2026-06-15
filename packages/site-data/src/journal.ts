export type DailyNote = {
  title: string;
  slug: string;
  href: string;
  description: string;
  date: string;
};

export type ActivityItem = {
  title: string;
  description: string;
  href?: string;
  status: string;
};

export type UtensilItem = {
  title: string;
  description: string;
  href?: string;
  label?: string;
};

export const readingSeries: DailyNote[] = [
  {
    title: "Witch Hat Atelier's reading",
    slug: 'witch-hat-atelier-reading',
    href: '/diary/daily-notes/days/witch-hat-atelier-reading',
    description: 'Temporary reading notes for Witch Hat Atelier chapters and opinions so far.',
    date: '2026-06-01T00:00:00.000Z'
  }
];

export const dailyNotes: DailyNote[] = [
  {
    title: 'April 26, 2026',
    slug: 'april-26',
    href: '/diary/daily-notes/days/april-26',
    description: 'My daily notes for April 26, 2026.',
    date: '2026-04-26T00:00:00.000Z'
  }
];

export const journalActivities: ActivityItem[] = [
  {
    title: 'Listening activity',
    description: 'A live log of music and tracks from Spotify, including the currently playing endpoint and recorded listening history.',
    href: '/api/activity/currently-playing',
    status: 'Live'
  },
  {
    title: 'Essays and translations',
    description: 'Recent writing includes Kemutai Hanashi reflections, Skip and Loafer translations, and personal learning notes.',
    href: '/journal?tab=essays',
    status: 'Restored'
  },
  {
    title: 'Daily notes',
    description: 'Small diary records and reading logs are grouped into a quieter archive surface.',
    href: '/journal?tab=notes',
    status: 'Restored'
  }
];

export const stationeryUtensils: UtensilItem[] = [
  {
    title: 'Mechanical keyboard',
    description: 'Used for rapid typing, drafting essays, and digital records.',
    href: 'https://www.logitech.com/en-us/products/keyboards/pop-keys-wireless-mechanical.920-010708.html',
    label: 'logitech pop keys'
  },
  {
    title: 'Workspace mouse',
    description: 'Smooth navigation across files, tabs, and vector design sketches.',
    href: 'https://www.logitech.com/en-us/products/mice/pop-wireless-mouse.html',
    label: 'logitech pop mouse'
  },
  {
    title: 'Physical diary',
    description: 'A traditional lined paper notebook from Muji Japan for offline scripting.'
  },
  {
    title: 'Writing instrument',
    description: 'A standard 0.5mm black ink ballpoint gel pen from Muji for precise note taking.'
  }
];

export function getDailyNotesByMonth() {
  const grouped = dailyNotes.reduce<Record<string, DailyNote[]>>((groups, note) => {
    const date = new Date(note.date);
    const month = date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
    groups[month] = groups[month] ?? [];
    groups[month].push(note);
    return groups;
  }, {});

  return Object.entries(grouped)
    .map(([month, days]) => ({ month, days }))
    .sort((a, b) => new Date(b.days[0]?.date ?? 0).getTime() - new Date(a.days[0]?.date ?? 0).getTime());
}
