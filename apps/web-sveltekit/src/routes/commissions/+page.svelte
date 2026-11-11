<script lang="ts">
  import { enhance } from '$app/forms';
  import { commissionStatuses } from '$lib/commissions';
  import type { Commission } from '$lib/commissions';
  import SectionPageShell from '$lib/components/SectionPageShell.svelte';
  import { Plus, LockKeyhole, Search, ArrowUpRight, Pencil, Archive } from '@lucide/svelte';
  export let data;
  export let form: any;
  let search = '', status = 'all', showArchived = false, draft: any = null, saving = false;
  $: entries = data.entries as Commission[];
  $: active = entries.filter(entry => !entry.archived && !['delivered', 'cancelled'].includes(entry.status));
  $: today = data.today;
  $: overdue = active.filter(entry => entry.dueDate && entry.dueDate < today);
  $: visible = entries.filter(entry => entry.archived === showArchived && (status === 'all' || entry.status === status) && [entry.title, entry.person, entry.brief, entry.notes].some(text => String(text || '').toLowerCase().includes(search.trim().toLowerCase())));
  const money = (cents: number, currency: string) => new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 2 }).format(cents / 100);
  function edit(entry?: Commission) {
    draft = entry ? { ...entry, amount: entry.amountCents / 100, paid: entry.paidCents / 100 } : {
      id: '', revision: '', title: '', person: '', direction: 'making for', kind: 'commission', status: 'planned', currency: 'USD', amount: '', paid: '',
      orderedDate: '', dueDate: '', deliveredDate: '', referenceUrl: '', deliveryUrl: '', brief: '', deliverables: '', notes: ''
    };
  }
</script>

<svelte:head><title>Commissions & orders | mikeblocky.com</title><meta name="robots" content="noindex,nofollow" /></svelte:head>
<SectionPageShell title="Commissions & orders" currentLabel="Commissions">
  <section class="commission-workspace">
    <header class="tracker-top"><span class="private-label"><LockKeyhole size={14} />{data.authenticated ? 'Admin' : 'Read only'}</span>{#if data.authenticated}<form method="POST" action="?/lock"><button class="quiet">Stop editing</button></form>{/if}</header>
      <div class="tracker-stats"><div><strong>{active.length}</strong><span>Active</span></div><div><strong>{overdue.length}</strong><span>Overdue</span></div><div><strong>{entries.filter(entry => !entry.archived && entry.status === 'delivered').length}</strong><span>Delivered</span></div></div>
      {#if data.storageError}<p class="notice error" role="alert">{data.storageError}</p>{/if}
      {#if form?.error}<p class="notice error" role="alert">{form.error}</p>{:else if form?.message}<p class="notice" role="status">{form.message}</p>{/if}
      <div class="tracker-tools"><label class="search"><Search size={17} /><input aria-label="Search commissions" placeholder="Find a person or project…" bind:value={search} /></label><select class="site-native-select" aria-label="Filter by status" bind:value={status}><option value="all">All statuses</option>{#each commissionStatuses as item}<option value={item}>{item}</option>{/each}</select>{#if data.authenticated}<button class="primary" disabled={!!data.storageError || saving} on:click={() => edit()}><Plus size={17} />New order</button>{/if}</div>
      {#if data.authenticated}<label class="archive-filter"><input type="checkbox" bind:checked={showArchived} />Archived orders</label>{/if}
      {#if data.authenticated && draft}
        <form class="order-editor" method="POST" action="?/save" use:enhance={() => { saving = true; return async ({ update, result }) => { await update({ reset: false }); saving = false; if (result.type === 'success' && result.data?.saved) draft = null; }; }}>
          <header><h2>{draft.id ? 'Edit order' : 'New order'}</h2><button type="button" class="quiet" disabled={saving} on:click={() => draft = null}>Cancel</button></header>
          <input type="hidden" name="id" value={draft.id} /><input type="hidden" name="revision" value={draft.revision} />
          <fieldset disabled={saving}>
            <div class="field full"><label for="order-title">Project title</label><input id="order-title" name="title" bind:value={draft.title} required maxlength="160" placeholder="Project title" /></div>
            <div class="field"><label for="order-person">Person</label><input id="order-person" name="person" bind:value={draft.person} list="commission-people" required maxlength="80" placeholder="@username or name" /><datalist id="commission-people">{#each data.people as person}<option value={person}></option>{/each}</datalist></div>
            <div class="field"><label for="order-direction">Direction</label><select id="order-direction" class="site-native-select" name="direction" bind:value={draft.direction}><option value="making for">I’m making this for them</option><option value="ordering from">I’m ordering from them</option></select></div>
            <div class="field"><label for="order-kind">Type</label><select id="order-kind" class="site-native-select" name="kind" bind:value={draft.kind}><option>commission</option><option>order</option><option>gift</option></select></div>
            <div class="field"><label for="order-status">Status</label><select id="order-status" class="site-native-select" name="status" bind:value={draft.status}>{#each commissionStatuses as item}<option>{item}</option>{/each}</select></div>
            <div class="payment-fields full"><div class="field"><label for="order-currency">Currency</label><input id="order-currency" name="currency" bind:value={draft.currency} minlength="3" maxlength="3" required list="commission-currencies" /><datalist id="commission-currencies"><option>USD</option><option>VND</option><option>JPY</option><option>EUR</option><option>SEK</option><option>GBP</option></datalist></div><div class="field"><label for="order-amount">Total agreed</label><input id="order-amount" name="amount" type="number" min="0" step="0.01" bind:value={draft.amount} placeholder="0" /></div><div class="field"><label for="order-paid">Already paid</label><input id="order-paid" name="paid" type="number" min="0" step="0.01" bind:value={draft.paid} placeholder="0" /></div></div>
            <div class="date-fields full"><div class="field"><label for="order-ordered">Started / ordered</label><input id="order-ordered" name="orderedDate" type="date" bind:value={draft.orderedDate} /></div><div class="field"><label for="order-due">Due date</label><input id="order-due" name="dueDate" type="date" bind:value={draft.dueDate} /></div><div class="field"><label for="order-delivered">Delivered on</label><input id="order-delivered" name="deliveredDate" type="date" bind:value={draft.deliveredDate} /></div></div>
            <div class="field full"><label for="order-brief">Brief / request</label><textarea id="order-brief" name="brief" bind:value={draft.brief} rows="3" maxlength="4000" placeholder="Characters, size, medium, preferences…"></textarea></div>
            <div class="field full"><label for="order-deliverables">Deliverables / checklist</label><textarea id="order-deliverables" name="deliverables" bind:value={draft.deliverables} rows="3" maxlength="2000" placeholder="Sketch approval, final PNG, print, shipping…"></textarea></div>
            <div class="field"><label for="order-reference">Reference / conversation link</label><input id="order-reference" name="referenceUrl" type="url" bind:value={draft.referenceUrl} maxlength="2000" placeholder="https://…" /></div>
            <div class="field"><label for="order-delivery">Final files / tracking link</label><input id="order-delivery" name="deliveryUrl" type="url" bind:value={draft.deliveryUrl} maxlength="2000" placeholder="https://…" /></div>
            <div class="field full"><label for="order-notes">Private notes</label><textarea id="order-notes" name="notes" bind:value={draft.notes} rows="3" maxlength="6000" placeholder="Revisions, payment reminders, next steps…"></textarea></div>
          </fieldset>
          <footer><button class="primary" disabled={saving}>{saving ? 'Saving…' : 'Save order'}</button></footer>
        </form>
      {/if}
      <div class="order-list">
        {#each visible as entry (entry.id)}
          <details class="order-card">
            <summary><div><span class="order-person">{entry.direction} {entry.person} · {entry.kind}</span><h2>{entry.title}</h2><span class="order-due" class:late={!!entry.dueDate && entry.dueDate < today && !['delivered', 'cancelled'].includes(entry.status)}>{entry.dueDate ? `Due ${entry.dueDate}` : 'No deadline'}</span></div><div class="order-summary"><span class="status">{entry.status}</span>{#if data.authenticated}<strong>{money(entry.amountCents, entry.currency)}</strong><small>{money(entry.amountCents - entry.paidCents, entry.currency)} remaining</small>{/if}</div></summary>
            <div class="order-details"><div class="order-dates"><span>Ordered: {entry.orderedDate || '—'}</span><span>Delivered: {entry.deliveredDate || '—'}</span>{#if data.authenticated}<span>Paid: {money(entry.paidCents, entry.currency)}</span>{/if}</div>{#if entry.brief}<h3>Brief</h3><p>{entry.brief}</p>{/if}{#if entry.deliverables}<h3>Deliverables</h3><p>{entry.deliverables}</p>{/if}{#if data.authenticated && entry.notes}<h3>Notes</h3><p>{entry.notes}</p>{/if}{#if data.authenticated}<div class="order-links">{#if entry.referenceUrl}<a href={entry.referenceUrl} target="_blank" rel="noreferrer">References <ArrowUpRight size={14} /></a>{/if}{#if entry.deliveryUrl}<a href={entry.deliveryUrl} target="_blank" rel="noreferrer">Files / tracking <ArrowUpRight size={14} /></a>{/if}</div><footer><button class="quiet" disabled={saving} on:click={() => edit(entry)}><Pencil size={15} />Edit</button><form method="POST" action="?/archive" use:enhance><input type="hidden" name="id" value={entry.id} /><input type="hidden" name="revision" value={entry.revision} /><button class="quiet"><Archive size={15} />{entry.archived ? 'Restore' : 'Archive'}</button></form><small>Updated {entry.updatedAt.slice(0, 10)}</small></footer>{:else}<small>Updated {entry.updatedAt.slice(0, 10)}</small>{/if}</div>
          </details>
        {:else}<div class="empty"><p>{search || status !== 'all' ? 'No matching orders.' : showArchived ? 'No archived orders.' : 'No orders yet.'}</p></div>{/each}
      </div>
    {#if !data.authenticated}
      <details class="tracker-lock" open={!!form?.error}>
        <summary>Mike’s edit access</summary>
        <form method="POST" action="?/unlock" use:enhance>
          <label for="tracker-passcode">Admin passcode</label>
          <input id="tracker-passcode" name="passcode" type="password" autocomplete="current-password" required maxlength="256" disabled={!data.configured} />
          <button class="primary" disabled={!data.configured}>Enable editing</button>
        </form>
        {#if !data.configured}<p class="notice">Editing is not configured on this server yet.</p>{/if}
      </details>
    {/if}
  </section>
</SectionPageShell>

<style>
  .commission-workspace { font-family:var(--font-sans); min-width:0; }
  .tracker-lock { max-width:400px; margin:32px 0; padding:16px 0; border-top:1px solid hsl(var(--border)); }
  .tracker-lock > summary { padding:10px 0; color:hsl(var(--muted-foreground)); font-size:var(--font-size-xs); }
  h2 { margin:12px 0; font-size:var(--font-size-md); font-weight:600; }
  p { color:hsl(var(--muted-foreground)); line-height:1.6; }
  label { display:block; color:hsl(var(--muted-foreground)); font-size:var(--font-size-xs); }
  input:not([type='checkbox']), textarea, select { width:100%; min-width:0; box-sizing:border-box; min-height:44px; border:1px solid hsl(var(--border)); border-radius:9px; background:hsl(var(--background)); color:hsl(var(--foreground)); padding:10px 12px; font:inherit; font-size:var(--font-size-sm); }
  textarea { resize:vertical; line-height:1.6; }
  button { display:inline-flex; align-items:center; justify-content:center; gap:8px; min-height:44px; padding:10px 15px; border:0; border-radius:9px; background:transparent; color:inherit; font:inherit; font-size:var(--font-size-sm); cursor:pointer; }
  button:disabled { opacity:.45; cursor:default; }
  .primary { background:hsl(var(--site-blue)); color:white; }
  .quiet { color:hsl(var(--muted-foreground)); }
  .quiet:hover { background:hsl(var(--muted)/.5); }
  .tracker-lock form { display:grid; gap:12px; margin-top:24px; }
  .tracker-top, .tracker-top form, .private-label, .order-editor header, footer { display:flex; align-items:center; gap:12px; }
  .tracker-top, .order-editor header { justify-content:space-between; }
  .private-label { font-size:var(--font-size-xs); color:hsl(var(--muted-foreground)); }
  .tracker-stats { display:grid; grid-template-columns:repeat(3,1fr); border-block:1px solid hsl(var(--border)); margin:20px 0 28px; padding:24px 0; gap:20px; }
  .tracker-stats div { display:grid; gap:4px; }.tracker-stats strong { font-size:var(--font-size-xl); font-weight:500; font-variant-numeric:tabular-nums; }.tracker-stats span, small { font-size:var(--font-size-xs); color:hsl(var(--muted-foreground)); }
  .tracker-tools { display:flex; gap:12px; align-items:center; flex-wrap:wrap; }.tracker-tools > select { width:auto; }.search { flex:1; min-width:200px; display:flex; align-items:center; gap:10px; }.search input { border:0; padding-left:0; }.archive-filter { display:flex; align-items:center; gap:8px; padding:12px 0 20px; min-height:44px; }
  .order-editor { border:1px solid hsl(var(--border)); border-radius:14px; padding:24px; margin-bottom:24px; }.order-editor h2 { margin:0; }.order-editor > footer { justify-content:flex-end; }.order-editor header { margin-bottom:24px; }fieldset { border:0; padding:0; margin:0; display:grid; grid-template-columns:1fr 1fr; gap:20px; min-width:0; }.field { display:grid; gap:7px; min-width:0; }.full { grid-column:1/-1; }.payment-fields, .date-fields { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:16px; }footer { margin-top:24px; flex-wrap:wrap; }footer > span { margin-right:auto; color:hsl(var(--muted-foreground)); font-size:var(--font-size-xs); }
  .notice { padding:14px 16px; background:hsl(var(--muted)/.5); border-radius:9px; font-size:var(--font-size-sm); }.error { color:hsl(var(--foreground)); border-left:3px solid #d47048; }
  .order-card { border-top:1px solid hsl(var(--border)); }.order-card:last-child { border-bottom:1px solid hsl(var(--border)); }summary { display:flex; justify-content:space-between; gap:24px; padding:24px 0; cursor:pointer; list-style:none; }summary::-webkit-details-marker { display:none; }.order-person, .order-due { font-size:var(--font-size-xs); color:hsl(var(--muted-foreground)); }.order-due.late { color:#c96741; }summary h2 { margin:7px 0; }.order-summary { display:flex; flex-direction:column; align-items:flex-end; gap:8px; flex-shrink:0; }.status { padding:4px 9px; border-radius:20px; font-size:var(--font-size-2xs); background:hsl(var(--site-blue)/.08); color:hsl(var(--site-blue)); }.order-summary strong { font-weight:500; font-variant-numeric:tabular-nums; }
  .order-details { padding:0 0 24px; }.order-details p { white-space:pre-wrap; overflow-wrap:anywhere; }.order-details h3 { font-size:var(--font-size-sm); font-weight:600; margin-top:24px; }.order-dates, .order-links { display:flex; flex-wrap:wrap; gap:16px; font-size:var(--font-size-xs); color:hsl(var(--muted-foreground)); }.order-links a { display:inline-flex; align-items:center; gap:5px; color:hsl(var(--site-blue)); }.order-details footer small { margin-left:auto; }.empty { padding:40px 0 64px; }.empty p { margin-bottom:8px; }.empty span { color:hsl(var(--muted-foreground)); font-size:var(--font-size-sm); }
  @media(max-width:600px) { .order-editor { padding:18px 14px; }fieldset { grid-template-columns:1fr; }.payment-fields { gap:8px; }.date-fields { grid-template-columns:1fr; }.tracker-tools > select { flex:1; }.search { flex-basis:100%; }.tracker-stats { gap:12px; }.tracker-stats span { font-size:var(--font-size-2xs); }summary { gap:12px; }.order-summary { max-width:42%; }.order-summary small { text-align:right; } }
</style>
