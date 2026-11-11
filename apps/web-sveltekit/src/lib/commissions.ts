export const commissionStatuses = ['planned', 'discussing', 'queued', 'in progress', 'review', 'delivered', 'cancelled'] as const;
export type CommissionStatus = typeof commissionStatuses[number];
export type CommissionInput = {
  title: string; person: string; direction: 'making for' | 'ordering from';
  kind: 'commission' | 'order' | 'gift'; status: CommissionStatus;
  currency: string; amountCents: number; paidCents: number;
  orderedDate: string; dueDate: string; deliveredDate: string;
  referenceUrl: string; deliveryUrl: string; brief: string; deliverables: string; notes: string;
};
export type Commission = CommissionInput & { id: string; revision: string; createdAt: string; updatedAt: string; archived: boolean };

export function parseCommission(form: FormData): CommissionInput {
  const text = (name: string, max: number) => {
    const raw = form.get(name);
    if (raw !== null && typeof raw !== 'string') throw new Error(`Invalid ${name}.`);
    const value = String(raw || '').trim();
    if (value.length > max) throw new Error(`${name} is too long.`);
    return value;
  };
  const title = text('title', 160), person = text('person', 80).replace(/^@/, '');
  if (!title || !person) throw new Error('Add a project title and person.');
  const direction = text('direction', 30), kind = text('kind', 20), status = text('status', 30);
  if (!['making for', 'ordering from'].includes(direction) || !['commission', 'order', 'gift'].includes(kind) || !commissionStatuses.includes(status as CommissionStatus)) throw new Error('Choose a valid direction, type, and status.');
  const currency = text('currency', 3).toUpperCase();
  if (!/^[A-Z]{3}$/.test(currency)) throw new Error('Use a three-letter currency code, such as USD or VND.');
  try { new Intl.NumberFormat('en', { style: 'currency', currency }); } catch { throw new Error('Invalid currency.'); }
  const money = (name: string) => {
    const value = text(name, 20);
    if (!/^\d{1,9}(\.\d{1,2})?$/.test(value || '0')) throw new Error(`${name} must be a positive amount with up to two decimals.`);
    return Math.round(Number(value || 0) * 100);
  };
  const amountCents = money('amount'), paidCents = money('paid');
  if (paidCents > amountCents) throw new Error('Paid amount cannot exceed the total.');
  const date = (name: string) => {
    const value = text(name, 10);
    if (value && (!/^\d{4}-\d{2}-\d{2}$/.test(value) || !Number.isFinite(Date.parse(value)) || new Date(value).toISOString().slice(0, 10) !== value)) throw new Error(`Invalid ${name}.`);
    return value;
  };
  const link = (name: string) => {
    const value = text(name, 2000);
    if (value) { try { if (!['https:', 'http:'].includes(new URL(value).protocol)) throw new Error(); } catch { throw new Error(`Use an http or https ${name}.`); } }
    return value;
  };
  return { title, person, direction: direction as CommissionInput['direction'], kind: kind as CommissionInput['kind'], status: status as CommissionStatus, currency, amountCents, paidCents,
    orderedDate: date('orderedDate'), dueDate: date('dueDate'), deliveredDate: date('deliveredDate'), referenceUrl: link('referenceUrl'), deliveryUrl: link('deliveryUrl'), brief: text('brief', 4000), deliverables: text('deliverables', 2000), notes: text('notes', 6000) };
}

/** Explicit allowlist: internal notes, prices, links, and edit tokens never reach public page data. */
export function publicCommission(entry: Commission) {
  return { id: entry.id, title: entry.title, person: entry.person, direction: entry.direction, kind: entry.kind, status: entry.status,
    orderedDate: entry.orderedDate, dueDate: entry.dueDate, deliveredDate: entry.deliveredDate, brief: entry.brief, deliverables: entry.deliverables, updatedAt: entry.updatedAt, archived: false };
}
