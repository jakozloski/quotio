/**
 * Lifecycle API routes
 *
 * Health check, status, and proxy lifecycle endpoints.
 * Replaces daemon IPC methods: daemon.ping, daemon.status, proxy.*
 */
import * as os from 'node:os';
import { Hono } from 'hono';

// Server version - should match package.json
const SERVER_VERSION = '0.1.0';

// GitHub repo for version checks
const GITHUB_REPO = 'nguyenphutrong/quotio';

// Server start time for uptime calculation
const startTime = Date.now();

interface LifecycleRoutesDeps {
	config: {
		port: number;
		host?: string;
		debug: boolean;
	};
}

export function lifecycleRoutes(deps: LifecycleRoutesDeps): Hono {
	const app = new Hono();
	const { config } = deps;

	/**
	 * GET /api/health
	 * Basic health check - replaces daemon.ping
	 */
	app.get('/health', (c) => {
		return c.json({
			status: 'ok',
			version: SERVER_VERSION,
			timestamp: new Date().toISOString(),
			uptime: Math.floor((Date.now() - startTime) / 1000),
		});
	});

	/**
	 * GET /api/status
	 * Detailed server status - replaces daemon.status
	 */
	app.get('/status', (c) => {
		const memoryUsage = process.memoryUsage();
		return c.json({
			status: 'ok',
			version: SERVER_VERSION,
			runtime: 'bun',
			timestamp: new Date().toISOString(),
			uptime: Math.floor((Date.now() - startTime) / 1000),
			server: {
				port: config.port,
				host: config.host || '0.0.0.0',
				debug: config.debug,
			},
			system: {
				platform: os.platform(),
				arch: os.arch(),
				nodeVersion: process.version,
				memory: {
					heapUsed: memoryUsage.heapUsed,
					heapTotal: memoryUsage.heapTotal,
					rss: memoryUsage.rss,
				},
			},
		});
	});

	/**
	 * GET /api/proxy/status
	 * Proxy running state
	 * Since server IS the proxy, if this returns, proxy is running
	 */
	app.get('/proxy/status', (c) => {
		return c.json({
			running: true,
			port: config.port,
			version: SERVER_VERSION,
			uptime: Math.floor((Date.now() - startTime) / 1000),
		});
	});

	/**
	 * POST /api/proxy/start
	 * Start proxy - no-op since server IS the proxy
	 */
	app.post('/proxy/start', (c) => {
		return c.json({
			success: true,
			message: 'Proxy is already running (server is the proxy)',
			port: config.port,
		});
	});

	/**
	 * POST /api/proxy/stop
	 * Stop proxy - graceful shutdown
	 */
	app.post('/proxy/stop', async (c) => {
		// Schedule shutdown after response
		setTimeout(() => {
			console.log('[server] Graceful shutdown requested via API');
			process.exit(0);
		}, 100);

		return c.json({
			success: true,
			message: 'Server shutting down',
		});
	});

	/**
	 * GET /api/proxy/version
	 * Current server version
	 */
	app.get('/proxy/version', (c) => {
		return c.json({
			version: SERVER_VERSION,
			runtime: 'bun',
			framework: 'hono',
		});
	});

	/**
	 * GET /api/proxy/latest-version
	 * Fetch latest version from GitHub releases
	 */
	app.get('/proxy/latest-version', async (c) => {
		try {
			const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases/latest`, {
				headers: {
					Accept: 'application/vnd.github.v3+json',
					'User-Agent': 'quotio-server',
				},
			});

			if (!response.ok) {
				if (response.status === 404) {
					return c.json({
						version: SERVER_VERSION,
						isLatest: true,
						message: 'No releases found',
					});
				}
				throw new Error(`GitHub API error: ${response.status}`);
			}

			const data = (await response.json()) as {
				tag_name: string;
				html_url: string;
				published_at: string;
			};
			const latestVersion = data.tag_name.replace(/^v/, '');

			return c.json({
				currentVersion: SERVER_VERSION,
				latestVersion,
				isLatest: SERVER_VERSION === latestVersion,
				releaseUrl: data.html_url,
				publishedAt: data.published_at,
			});
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Unknown error';
			return c.json(
				{
					error: 'Failed to check latest version',
					message,
					currentVersion: SERVER_VERSION,
				},
				500,
			);
		}
	});

	return app;
}
