import { getWeeksByMonth } from '@mikeblocky/site-data/learning';

export const prerender = true;

export function load() {
  return { monthGroups: getWeeksByMonth() };
}
