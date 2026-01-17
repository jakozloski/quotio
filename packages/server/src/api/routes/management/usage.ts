/**
 * Usage statistics routes
 * @packageDocumentation
 */
import { Hono } from "hono";
import type { MetricsRegistry } from "../../../logging/index.js";
import type { TokenStore, StoredAuthFile } from "../../../store/index.js";

interface UsageRoutesDeps {
	metrics: MetricsRegistry;
	store: TokenStore;
}

/**
 * Usage response types
 */
interface ProviderStats {
	provider: string;
	requests: number;
	tokens: number;
	errors: number;
	avgLatencyMs: number;
}

interface UsageOverview {
	totalRequests: number;
	totalTokens: number;
	totalErrors: number;
	avgLatencyMs: number;
	byProvider: ProviderStats[];
	uptime: number;
	startedAt: string;
}

const serverStartedAt = new Date();

export function usageRoutes(deps: UsageRoutesDeps): Hono {
	const app = new Hono();
	const { metrics, store } = deps;

	/**
	 * Get usage overview
	 * GET /usage
	 */
	app.get("/", async (c) => {
		const requestsTotal = metrics.counter("proxy_requests_total");
		const requestsByProvider = metrics.counter("proxy_requests_by_provider");
		const requestsByStatus = metrics.counter("proxy_requests_by_status");
		const tokensUsed = metrics.counter("proxy_tokens_used");
		const requestDuration = metrics.histogram("proxy_request_duration_ms");

		// Calculate error count (4xx + 5xx)
		const allStatuses = requestsByStatus.getAll();
		let errorCount = 0;
		for (const [key, count] of allStatuses) {
			const status = key.split("=")[1];
			if (status && (status.startsWith("4") || status.startsWith("5"))) {
				errorCount += count;
			}
		}

		// Get per-provider stats
		const providerCounts = requestsByProvider.getAll();
		const byProvider: ProviderStats[] = [];

		for (const [key, requests] of providerCounts) {
			const provider = key.split("=")[1] || "unknown";
			byProvider.push({
				provider,
				requests,
				tokens: tokensUsed.getByLabels({ provider }),
				errors: 0, // Would need more detailed tracking
				avgLatencyMs: 0, // Would need per-provider histograms
			});
		}

		const durationStats = requestDuration.getStats();
		const uptime = Math.floor((Date.now() - serverStartedAt.getTime()) / 1000);

		const overview: UsageOverview = {
			totalRequests: requestsTotal.get(),
			totalTokens: tokensUsed.get(),
			totalErrors: errorCount,
			avgLatencyMs: Math.round(durationStats.mean),
			byProvider,
			uptime,
			startedAt: serverStartedAt.toISOString(),
		};

		return c.json(overview);
	});

	/**
	 * Get usage for a specific provider
	 * GET /usage/:provider
	 */
	app.get("/:provider", async (c) => {
		const provider = c.req.param("provider");
		const requestsByProvider = metrics.counter("proxy_requests_by_provider");
		const tokensUsed = metrics.counter("proxy_tokens_used");

		const requests = requestsByProvider.getByLabels({ provider });
		const tokens = tokensUsed.getByLabels({ provider });

		return c.json({
			provider,
			requests,
			tokens,
		});
	});

	/**
	 * Get quota status for all accounts
	 * GET /usage/quotas
	 */
	app.get("/quotas/all", async (c) => {
		const authFiles = await store.listAuthFiles();

		const quotas = authFiles.map((f: StoredAuthFile) => ({
			id: f.id,
			provider: f.provider,
			email: f.email,
			quotaUsed: f.quotaUsed ?? 0,
			quotaLimit: f.quotaLimit,
			quotaResetAt: f.quotaResetAt,
			tier: f.tier ?? "unknown",
			status: f.status,
			disabled: f.disabled,
			cooldownUntil: f.cooldownUntil,
		}));

		return c.json({ quotas });
	});

	/**
	 * Reset metrics
	 * POST /usage/reset
	 */
	app.post("/reset", (c) => {
		metrics.reset();
		return c.json({ success: true, message: "Metrics reset" });
	});

	return app;
}
