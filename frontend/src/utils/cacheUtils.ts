// ─── localStorage caching for poll results ─────────────────────

const RESULTS_KEY = "livepoll_results";
const VOTED_PREFIX = "livepoll_voted_";
const CACHE_TTL_MS = 30_000; // 30 seconds

interface CachedResults {
    yes: number;
    no: number;
    timestamp: number;
}

export function getCachedResults(): { yes: number; no: number } | null {
    try {
        const raw = localStorage.getItem(RESULTS_KEY);
        if (!raw) return null;
        const data: CachedResults = JSON.parse(raw);
        const age = Date.now() - data.timestamp;
        if (age > CACHE_TTL_MS) return null; // stale
        return { yes: data.yes, no: data.no };
    } catch {
        return null;
    }
}

export function setCachedResults(yes: number, no: number): void {
    try {
        const data: CachedResults = { yes, no, timestamp: Date.now() };
        localStorage.setItem(RESULTS_KEY, JSON.stringify(data));
    } catch {
        // ignore storage errors
    }
}

export function getCachedHasVoted(address: string): boolean {
    try {
        return localStorage.getItem(`${VOTED_PREFIX}${address}`) === "true";
    } catch {
        return false;
    }
}

export function setCachedHasVoted(address: string): void {
    try {
        localStorage.setItem(`${VOTED_PREFIX}${address}`, "true");
    } catch {
        // ignore
    }
}

export function clearCache(): void {
    try {
        localStorage.removeItem(RESULTS_KEY);
    } catch {
        // ignore
    }
}
