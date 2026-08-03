const LIVE_LEVELS = ['quick_adult', 'quick_child', 'snack'];
const ALL_LEVELS = [...LIVE_LEVELS, 'ts_adult', 'ts_child'];

export function levelFor(credit, guest) {
  if (credit === 'snack') return 'snack';
  if (credit === 'quick') return guest === 'L' ? 'quick_child' : 'quick_adult';
  return null;
}

function withoutRemovedTsEvents(events) {
  const removed = events.filter(e => e && (['ts_used', 'booked_ts_used'].includes(e.type) ||
    (e.credit && !['quick', 'snack'].includes(e.credit))));
  const removedIds = new Set(removed.map(e => e.id).filter(Boolean));
  return events.filter(e => !removed.includes(e) && !(e.type === 'undo' && removedIds.has(e.target)));
}

export function migrateLedger(raw) {
  try {
    const stored = JSON.parse(raw);
    if (stored && [1, 2, 3].includes(stored.schema) && Array.isArray(stored.events)) {
      return {
        schema: 3,
        events: withoutRemovedTsEvents(stored.events),
        seed_ids: stored.schema === 3 && Array.isArray(stored.seed_ids) ? [...new Set(stored.seed_ids)] : [],
        valid: true,
      };
    }
  } catch { /* missing or corrupt */ }
  return { schema: 3, events: [], seed_ids: [], valid: false };
}

export function applySeedEvents(store, seed) {
  const events = [...(store.events || [])];
  const applied = new Set(store.seed_ids || []);
  for (const event of events) if (event?.seed_id) applied.add(event.seed_id);

  for (const seedEvent of seed.seed_events) {
    if (applied.has(seedEvent.seed_id)) continue;
    events.push({ type: 'seed', id: seedEvent.seed_id, ...seedEvent });
    applied.add(seedEvent.seed_id);
  }
  return { ...store, schema: 3, events, seed_ids: [...applied] };
}

export function buildBreakEvenSummary(ledger, targets) {
  const live = Object.fromEntries(LIVE_LEVELS.map(level => [level, { credits_used: 0, spent: 0 }]));
  for (const entry of Object.values(ledger.entries || {})) {
    if (entry.undone || !live[entry.level] || !['redeem', 'seed'].includes(entry.type)) continue;
    live[entry.level].credits_used += 1;
    live[entry.level].spent = Math.round((live[entry.level].spent + (Number(entry.value) || 0)) * 100) / 100;
  }

  return ALL_LEVELS.map(level => {
    const target = targets[level];
    const values = level.startsWith('ts_') ? target : live[level];
    const percent = target.goal ? values.spent / target.goal * 100 : 0;
    return {
      level,
      credits_used: values.credits_used,
      credits_total: target.credits_total,
      spent: values.spent,
      goal: target.goal,
      bench: target.bench,
      percent,
      bar_percent: Math.min(100, Math.max(0, percent)),
      static: level.startsWith('ts_'),
    };
  });
}
