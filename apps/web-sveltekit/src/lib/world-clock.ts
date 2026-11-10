const cache = new Map<string, {
  time: Intl.DateTimeFormat;
  date: Intl.DateTimeFormat;
  calendar: Intl.DateTimeFormat;
  offset: Intl.DateTimeFormat;
}>();

export function formatWorldClock(now: Date, timeZone: string) {
  let formats = cache.get(timeZone);
  if (!formats) {
    formats = {
      time: new Intl.DateTimeFormat('en-GB', { timeZone, hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' }),
      date: new Intl.DateTimeFormat('en-US', { timeZone, weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
      calendar: new Intl.DateTimeFormat('en-US', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }),
      offset: new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'shortOffset' })
    };
    cache.set(timeZone, formats);
  }
  const parts = formats.calendar.formatToParts(now);
  const part = (name: string) => parts.find(item => item.type === name)?.value ?? '';
  return {
    time: formats.time.format(now),
    date: formats.date.format(now),
    dateKey: `${part('year')}-${part('month')}-${part('day')}`,
    offset: formats.offset.formatToParts(now).find(item => item.type === 'timeZoneName')?.value.replace('GMT', 'UTC') ?? '',
    iso: now.toISOString()
  };
}
