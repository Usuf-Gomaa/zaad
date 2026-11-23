// Commit-level barrier shared by all application writes. No storage deletion is performed here.
import { buildId } from "../release";
const leaseKey = "zaad-update-lease";
const owner = crypto.randomUUID();
type Lease = { owner: string; expires: number; target?: string };
let renewal: ReturnType<typeof setInterval> | undefined;
function lease(): Lease | undefined {
  try {
    return JSON.parse(localStorage.getItem(leaseKey) || "null") || undefined;
  } catch {
    return undefined;
  }
}
// Only the target build clears a completed update lease. Older/newly opened tabs stay write-blocked.
const previous = lease();
if (previous?.target === buildId)
  try {
    localStorage.removeItem(leaseKey);
  } catch {
    /* In-place activation will be unavailable if storage cannot be leased. */
  }
let frozen = false;
const transactions = new Set<Promise<void>>();
let failureVersion = 0;
const guards = new Map<string, () => void | Promise<void>>();
export function writesFrozen() {
  const other = lease();
  return frozen || (!!other && other.expires > Date.now());
}
export function freezeWrites(value: boolean) {
  if (value) {
    const existing = lease();
    if (existing && existing.owner !== owner && existing.expires > Date.now())
      throw Error("update.tabs");
    const renew = () => {
      const current = lease();
      localStorage.setItem(
        leaseKey,
        JSON.stringify({
          owner,
          expires: Date.now() + 15000,
          ...(current?.owner === owner && current.target
            ? { target: current.target }
            : {}),
        }),
      );
    };
    try {
      renew();
    } catch {
      throw Error("update.unsupported");
    }
    frozen = true;
    renewal = setInterval(() => {
      try {
        renew();
      } catch {
        /* Remain frozen; no additional writes are permitted. */
      }
    }, 3000);
  } else {
    frozen = false;
    clearInterval(renewal);
    if (lease()?.owner === owner)
      try {
        localStorage.removeItem(leaseKey);
      } catch {
        /* No user data is stored here. */
      }
  }
}
export function setUpdateTarget(target: string) {
  const current = lease();
  if (!frozen || current?.owner !== owner) throw Error("update.failed");
  localStorage.setItem(leaseKey, JSON.stringify({ ...current, target }));
}
export function registerUpdateGuard(
  id: string,
  guard: () => void | Promise<void>,
) {
  guards.set(id, guard);
  return () => {
    guards.delete(id);
  };
}
export async function checkUpdateGuards() {
  for (const guard of guards.values()) await guard();
}
export function trackTransaction(tx: IDBTransaction) {
  let resolve!: () => void, reject!: (error: Error) => void;
  const complete = new Promise<void>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  transactions.add(complete);
  void complete.catch(() => {});
  const finish = () => {
    transactions.delete(complete);
    resolve();
  };
  const fail = () => {
    failureVersion++;
    transactions.delete(complete);
    reject(Error("update.failed"));
  };
  tx.addEventListener("complete", finish, { once: true });
  tx.addEventListener("abort", fail, { once: true });
}
export async function waitForTransactions() {
  while (transactions.size) await Promise.all([...transactions]);
}
export async function prepareUpdate(
  flush: () => Promise<void>,
  lockUI: (locked: boolean) => void,
) {
  lockUI(true);
  const started = failureVersion;
  try {
    // Blurring commits existing task-edit fields; the flush event commits debounced du’a drafts.
    if (
      typeof document !== "undefined" &&
      document.activeElement instanceof HTMLElement
    )
      document.activeElement.blur();
    await flush();
    await checkUpdateGuards();
    await waitForTransactions();
    if (failureVersion !== started) throw Error("update.failed");
    freezeWrites(true);
    await waitForTransactions();
    if (failureVersion !== started) throw Error("update.failed");
  } catch (error) {
    freezeWrites(false);
    lockUI(false);
    throw error;
  }
}
export function releaseUpdate(lockUI: (locked: boolean) => void) {
  freezeWrites(false);
  lockUI(false);
}
