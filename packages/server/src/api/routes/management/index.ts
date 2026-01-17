/**
 * Management API routes
 *
 * Endpoints for server administration and monitoring.
 */
import { Hono } from "hono";
import type { Config } from "../../../config/index.js";
import type { AuthManager } from "../../../auth/index.js";
import type { TokenStore } from "../../../store/index.js";
import type { MetricsRegistry, RequestLogger } from "../../../logging/index.js";
import { healthRoutes } from "./health.js";
import { oauthManagementRoutes } from "./oauth.js";
import { usageRoutes } from "./usage.js";
import { logsRoutes } from "./logs.js";

interface ManagementRoutesDeps {
	config: Config;
	authManager: AuthManager;
	store: TokenStore;
	metrics: MetricsRegistry;
	logger: RequestLogger;
}

export function managementRoutes(deps: ManagementRoutesDeps): Hono {
	const app = new Hono();
	const { config, authManager, store, metrics, logger } = deps;

	// Mount health routes at /
	app.route("/", healthRoutes({ config }));

	// Mount OAuth management routes
	app.route("/", oauthManagementRoutes({ authManager }));

	// Mount usage routes
	app.route("/usage", usageRoutes({ metrics, store }));

	// Mount logs routes
	app.route("/logs", logsRoutes({ logger }));

	return app;
}
