import { trackBatchedViews } from "@/app/actions/interactionActions";

// Configuration
const FLUSH_INTERVAL = 2000; // 2 seconds
const BATCH_THRESHOLD = 10; // Flush if more than 10 items

class InteractionBatcher {
    private pendingBuffer: Set<string> = new Set();
    private seenSessionIds: Set<string> = new Set();
    private flushTimer: NodeJS.Timeout | null = null;
    private isProcessing: boolean = false;

    constructor() {
        if (typeof window !== "undefined") {
            // Flush on visibility change (e.g. user minimizing tab/switching app)
            document.addEventListener("visibilitychange", () => {
                if (document.hidden) {
                    this.flush();
                }
            });
        }
    }

    /**
     * Add a memberId to the pending buffer.
     * If already seen in this session, it is ignored safely.
     */
    public add(memberId: string) {
        // 1. Deduplicate per session
        if (this.seenSessionIds.has(memberId)) {
            return;
        }

        // 2. Add to buffer
        this.pendingBuffer.add(memberId);
        this.seenSessionIds.add(memberId);

        // 3. Check threshold
        if (this.pendingBuffer.size >= BATCH_THRESHOLD) {
            this.flush();
        } else {
            this.scheduleFlush();
        }
    }

    /**
     * Schedule a flush if one isn't already running.
     */
    private scheduleFlush() {
        if (!this.flushTimer) {
            this.flushTimer = setTimeout(() => {
                this.flush();
            }, FLUSH_INTERVAL);
        }
    }

    /**
     * Send pending views to the server.
     * Fire-and-forget style.
     */
    private async flush() {
        // Clear timer
        if (this.flushTimer) {
            clearTimeout(this.flushTimer);
            this.flushTimer = null;
        }

        // Check if anything to flush
        if (this.pendingBuffer.size === 0) return;

        // Snapshot and clear buffer
        const batch = Array.from(this.pendingBuffer);
        this.pendingBuffer.clear();

        // Prevent concurrent flushes if logic gets complex (optional guard)
        if (this.isProcessing) {
            // If busy, re-add to buffer (or just fire concurrent request)
            // For views, fire-and-forget concurrent is fine.
        }

        try {
            this.isProcessing = true;
            // Fire and forget - don't await response in UI
            await trackBatchedViews(batch);
        } catch (err) {
            console.warn("Failed to flush view batch", err);
            // Optional: retry logic, but for "views" it's okay to drop on failure
        } finally {
            this.isProcessing = false;
        }
    }
}

// Module-level singleton
export const batcher = new InteractionBatcher();
