import { createRequestLog } from '@quotio/core';
import type { RequestLog } from '@quotio/core';
import { Hono } from 'hono';
import { requestTrackerService } from '../../../services/stats/request-tracker-service.js';

function toRequestLogInfo(entry: RequestLog) {
	return {
		id: entry.id,
		timestamp: entry.timestamp,
		method: entry.method,
		endpoint: entry.endpoint,
		provider: entry.provider,
		model: entry.model,
		inputTokens: entry.inputTokens,
		outputTokens: entry.outputTokens,
		durationMs: entry.durationMs,
		statusCode: entry.statusCode,
		requestSize: entry.requestSize,
		responseSize: entry.responseSize,
		errorMessage: entry.errorMessage,
	};
}

export function statsRoutes(): Hono {
	const app = new Hono();

	app.get('/stats', async (c) => {
		const provider = c.req.query('provider');
		const minutesParam = c.req.query('minutes');
		const minutes = minutesParam ? Number(minutesParam) : undefined;

		let entries = requestTrackerService.getHistory();
		if (provider) {
			entries = entries.filter((entry) => entry.provider === provider);
		}
		if (minutes && Number.isFinite(minutes)) {
			entries = requestTrackerService.getRecentRequests(minutes);
		}
		return c.json({ entries: entries.map(toRequestLogInfo) });
	});

	app.get('/stats/summary', async (c) => {
		return c.json({ stats: requestTrackerService.getStats() });
	});

	app.post('/stats', async (c) => {
		const body = (await c.req.json().catch(() => ({}))) as {
			method?: string;
			endpoint?: string;
			provider?: string;
			model?: string;
			inputTokens?: number;
			outputTokens?: number;
			durationMs?: number;
			statusCode?: number;
			requestSize?: number;
			responseSize?: number;
			errorMessage?: string;
		};

		if (!body.method || !body.endpoint || typeof body.durationMs !== 'number') {
			return c.json({ success: false }, 400);
		}

		const entry = createRequestLog({
			method: body.method,
			endpoint: body.endpoint,
			provider: body.provider ?? null,
			model: body.model ?? null,
			inputTokens: body.inputTokens ?? null,
			outputTokens: body.outputTokens ?? null,
			durationMs: body.durationMs,
			statusCode: body.statusCode ?? null,
			requestSize: body.requestSize ?? 0,
			responseSize: body.responseSize ?? 0,
			errorMessage: body.errorMessage ?? null,
		});

		requestTrackerService.addEntry(entry);
		return c.json({ success: true });
	});

	app.delete('/stats', async (c) => {
		requestTrackerService.clear();
		return c.json({ success: true });
	});

	app.get('/stats/status', async (c) => {
		return c.json(requestTrackerService.getStatus());
	});

	return app;
}
