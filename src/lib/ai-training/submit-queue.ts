// Resilience for POST /api/assessment/submit when a workshop venue's
// network is flaky: retries a few times, then — only if every retry
// fails — parks the payload in localStorage so it can be resent next
// time this device loads /ai-training (e.g. the next participant's
// page load, or this same participant reopening the tab). Without this,
// a transient network blip silently drops a participant's result with
// no way to recover it.

const PENDING_STORAGE_KEY = "wit-ai-training-pending-submits";
const RETRY_DELAYS_MS = [500, 1500, 3000];

async function postSubmit(payload: unknown): Promise<boolean> {
  try {
    const res = await fetch("/api/assessment/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return res.ok;
  } catch {
    return false;
  }
}

function readQueue(): unknown[] {
  try {
    const raw = window.localStorage.getItem(PENDING_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeQueue(queue: unknown[]) {
  try {
    window.localStorage.setItem(PENDING_STORAGE_KEY, JSON.stringify(queue));
  } catch {
    // ignore (private browsing, storage disabled, etc.)
  }
}

function enqueue(payload: unknown) {
  const queue = readQueue();
  queue.push(payload);
  writeQueue(queue);
}

/** Tries the submit a few times with backoff; queues it locally if every attempt fails. */
export async function submitWithRetry(payload: unknown): Promise<void> {
  for (const delay of [0, ...RETRY_DELAYS_MS]) {
    if (delay > 0) await new Promise((r) => setTimeout(r, delay));
    if (await postSubmit(payload)) return;
  }
  enqueue(payload);
}

let flushing = false;

/**
 * Best-effort resend of anything queued from a previous failed attempt.
 * Call on mount — e.g. the next person using this device, or this same
 * participant back online, gets their earlier result synced quietly.
 *
 * Claims the queue (reads it, then immediately clears storage) before
 * sending anything, so two overlapping calls — React Strict Mode's
 * double-invoked effect in dev, two tabs open, a reload mid-flush —
 * can't both read the same pending items and double-submit them. An
 * in-memory flag additionally short-circuits same-tab re-entrancy.
 */
export async function flushPendingSubmissions(): Promise<void> {
  if (flushing) return;
  const queue = readQueue();
  if (queue.length === 0) return;

  flushing = true;
  writeQueue([]);
  try {
    const stillPending: unknown[] = [];
    for (const payload of queue) {
      if (!(await postSubmit(payload))) stillPending.push(payload);
    }
    if (stillPending.length > 0) {
      // Merge back with anything enqueued while this flush was running.
      writeQueue([...readQueue(), ...stillPending]);
    }
  } finally {
    flushing = false;
  }
}
