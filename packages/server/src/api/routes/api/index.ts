/**
 * API Routes - Management API for cross-platform clients
 *
 * All routes are prefixed with /api
 * This replaces the daemon IPC methods with HTTP endpoints.
 */
import { Hono } from 'hono';
import type { AuthManager } from '../../../auth/index.js';
import type { Config } from '../../../config/index.js';
import type { MetricsRegistry, RequestLogger } from '../../../logging/index.js';
import type { TokenStore } from '../../../store/index.js';
import { logsRoutes } from '../management/logs.js';
import { agentRoutes } from './agents.js';
import { authRoutes } from './auth.js';
import { configRoutes } from './config.js';
import { fallbackRoutes } from './fallback.js';
import { lifecycleRoutes } from './lifecycle.js';
import { quotaRoutes } from './quota.js';
import { statsRoutes } from './stats.js';

export interface ApiRoutesDeps {
	config: Config;
	authManager: AuthManager;
	store: TokenStore;
	metrics: MetricsRegistry;
	logger: RequestLogger;
}

export function apiRoutes(deps: ApiRoutesDeps): Hono {
	const app = new Hono();
	const { config } = deps;

	// Mount lifecycle routes (/api/health, /api/status, /api/proxy/*)
	app.route('/', lifecycleRoutes({ config }));

	// Auth routes (/api/auth, /api/oauth, /api/device-code)
	app.route('/', authRoutes({ authManager: deps.authManager, store: deps.store }));

	app.route('/', quotaRoutes());

	app.route('/', agentRoutes());

	app.route('/', configRoutes({ config }));

	app.route('/', fallbackRoutes());

	app.route('/', statsRoutes());
	app.route('/logs', logsRoutes({ logger: deps.logger }));

	// Future routes will be mounted here:
	// app.route('/', apiKeysRoutes({ store }));                 // QUO-44

	return app;
}
