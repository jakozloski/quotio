/**
 * Logs routes
 * @packageDocumentation
 */
import { Hono } from "hono";
import type { RequestLogger, RequestLogEntry } from "../../../logging/index.js";

interface LogsRoutesDeps {
	logger: RequestLogger;
}

export function logsRoutes(deps: LogsRoutesDeps): Hono {
	const app = new Hono();
	const { logger } = deps;

	/**
	 * Get recent logs
	 * GET /logs?limit=100
	 */
	app.get("/", (c) => {
		const limitStr = c.req.query("limit");
		const limit = limitStr ? parseInt(limitStr, 10) : 100;

		const logs = logger.getRecentLogs(Math.min(limit, 1000));

		return c.json({
			logs,
			count: logs.length,
		});
	});

	/**
	 * Get logs filtered by provider
	 * GET /logs/provider/:provider
	 */
	app.get("/provider/:provider", (c) => {
		const provider = c.req.param("provider");
		const limitStr = c.req.query("limit");
		const limit = limitStr ? parseInt(limitStr, 10) : 100;

		const allLogs = logger.getRecentLogs(1000);
		const filtered = allLogs
			.filter((log: RequestLogEntry) => log.provider === provider)
			.slice(-limit);

		return c.json({
			logs: filtered,
			count: filtered.length,
			provider,
		});
	});

	/**
	 * Get logs filtered by status code range
	 * GET /logs/status/:range (e.g., /logs/status/4xx or /logs/status/5xx)
	 */
	app.get("/status/:range", (c) => {
		const range = c.req.param("range");
		const limitStr = c.req.query("limit");
		const limit = limitStr ? parseInt(limitStr, 10) : 100;

		const allLogs = logger.getRecentLogs(1000);

		let filtered: RequestLogEntry[];

		if (range === "4xx") {
			filtered = allLogs.filter(
				(log: RequestLogEntry) => log.status && log.status >= 400 && log.status < 500
			);
		} else if (range === "5xx") {
			filtered = allLogs.filter((log: RequestLogEntry) => log.status && log.status >= 500);
		} else if (range === "2xx") {
			filtered = allLogs.filter(
				(log: RequestLogEntry) => log.status && log.status >= 200 && log.status < 300
			);
		} else if (range === "errors") {
			filtered = allLogs.filter((log: RequestLogEntry) => log.error !== undefined);
		} else {
			filtered = allLogs;
		}

		return c.json({
			logs: filtered.slice(-limit),
			count: filtered.length,
			range,
		});
	});

	/**
	 * Clear logs
	 * DELETE /logs
	 */
	app.delete("/", (c) => {
		logger.clearLogs();
		return c.json({ success: true, message: "Logs cleared" });
	});

	/**
	 * Get log by request ID
	 * GET /logs/:requestId
	 */
	app.get("/:requestId", (c) => {
		const requestId = c.req.param("requestId");
		const allLogs = logger.getRecentLogs(1000);
		const log = allLogs.find((l: RequestLogEntry) => l.requestId === requestId);

		if (!log) {
			return c.json({ error: "Log not found" }, 404);
		}

		return c.json(log);
	});

	return app;
}
