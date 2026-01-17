import { mkdir } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { Hono } from 'hono';
import type { Config } from '../../../config/index.js';

const CONFIG_FILE_NAME = 'server-config.json';

interface ConfigRoutesDeps {
	config: Config;
}

function expandPath(path: string): string {
	if (path.startsWith('~')) {
		return join(homedir(), path.slice(1));
	}
	return path;
}

async function readConfigFile(configDir: string): Promise<Record<string, unknown>> {
	const configPath = expandPath(configDir);
	const configFile = join(configPath, CONFIG_FILE_NAME);

	try {
		const file = Bun.file(configFile);
		if (await file.exists()) {
			return (await file.json()) as Record<string, unknown>;
		}
	} catch {
		return {};
	}

	return {};
}

function mergeConfig(
	base: Record<string, unknown>,
	updates: Record<string, unknown>,
): Record<string, unknown> {
	const merged: Record<string, unknown> = { ...base, ...updates };

	if (updates.routing) {
		merged.routing = {
			...(base.routing as Record<string, unknown> | undefined),
			...(updates.routing as Record<string, unknown>),
		};
	}

	if (updates.quotaExceeded) {
		merged.quotaExceeded = {
			...(base.quotaExceeded as Record<string, unknown> | undefined),
			...(updates.quotaExceeded as Record<string, unknown>),
		};
	}

	if (updates.remoteManagement) {
		merged.remoteManagement = {
			...(base.remoteManagement as Record<string, unknown> | undefined),
			...(updates.remoteManagement as Record<string, unknown>),
		};
	}

	if (updates.tls) {
		merged.tls = {
			...(base.tls as Record<string, unknown> | undefined),
			...(updates.tls as Record<string, unknown>),
		};
	}

	return merged;
}

async function persistConfig(config: Config, updates: Record<string, unknown>): Promise<void> {
	const configPath = expandPath(config.configDir);
	const configFile = join(configPath, CONFIG_FILE_NAME);
	const existing = await readConfigFile(config.configDir);
	const merged = mergeConfig(existing, updates);
	await mkdir(configPath, { recursive: true });
	await Bun.write(configFile, JSON.stringify(merged, null, 2));
}

function buildConfigResponse(config: Config): Record<string, unknown> {
	return {
		host: config.host,
		port: config.port,
		'auth-dir': config.authDir,
		'proxy-url': '',
		'api-keys': config.apiKeys,
		debug: config.debug,
		'logging-to-file': config.loggingToFile,
		'usage-statistics-enabled': true,
		'request-retry': config.requestRetry,
		'max-retry-interval': config.maxRetryInterval,
		'ws-auth': false,
		routing: {
			strategy: config.routing.strategy,
		},
		'quota-exceeded': {
			'switch-project': config.quotaExceeded.switchProject,
			'switch-preview-model': config.quotaExceeded.switchPreviewModel,
		},
		'remote-management': {
			'allow-remote': config.remoteManagement.allowRemote,
			'secret-key': config.remoteManagement.secretKey ?? '',
			'disable-control-panel': config.remoteManagement.disableControlPanel,
		},
	};
}

function isRoutingStrategy(value: string): value is 'round-robin' | 'fill-first' {
	return value === 'round-robin' || value === 'fill-first';
}

function parseNumericValue(value: unknown): number | null {
	if (typeof value === 'number' && Number.isFinite(value)) return value;
	if (typeof value === 'string' && value.trim() !== '') {
		const parsed = Number(value);
		return Number.isFinite(parsed) ? parsed : null;
	}
	return null;
}

export function configRoutes(deps: ConfigRoutesDeps): Hono {
	const app = new Hono();
	const { config } = deps;

	app.get('/config', (c) => {
		return c.json(buildConfigResponse(config));
	});

	app.put('/debug', async (c) => {
		const body = (await c.req.json().catch(() => ({ value: undefined }))) as {
			value?: boolean;
		};

		if (typeof body.value !== 'boolean') {
			return c.json({ error: 'Missing debug value' }, 400);
		}

		config.debug = body.value;
		await persistConfig(config, { debug: body.value });
		return c.json({ success: true });
	});

	app.get('/debug', (c) => {
		return c.json({ debug: config.debug });
	});

	app.put('/routing/strategy', async (c) => {
		const body = (await c.req.json().catch(() => ({ value: undefined }))) as {
			value?: string;
		};

		if (!body.value || !isRoutingStrategy(body.value)) {
			return c.json({ error: 'Invalid routing strategy' }, 400);
		}

		config.routing.strategy = body.value;
		await persistConfig(config, { routing: { strategy: body.value } });
		return c.json({ success: true });
	});

	app.get('/routing/strategy', (c) => {
		return c.json({ strategy: config.routing.strategy });
	});

	app.put('/request-retry', async (c) => {
		const body = (await c.req.json().catch(() => ({ value: undefined }))) as {
			value?: number | string;
		};
		const parsed = parseNumericValue(body.value);

		if (parsed === null) {
			return c.json({ error: 'Invalid request retry value' }, 400);
		}

		config.requestRetry = parsed;
		await persistConfig(config, { requestRetry: parsed });
		return c.json({ success: true });
	});

	app.get('/request-retry', (c) => {
		return c.json({ request_retry: config.requestRetry });
	});

	app.put('/max-retry-interval', async (c) => {
		const body = (await c.req.json().catch(() => ({ value: undefined }))) as {
			value?: number | string;
		};
		const parsed = parseNumericValue(body.value);

		if (parsed === null) {
			return c.json({ error: 'Invalid max retry interval value' }, 400);
		}

		config.maxRetryInterval = parsed;
		await persistConfig(config, { maxRetryInterval: parsed });
		return c.json({ success: true });
	});

	app.get('/max-retry-interval', (c) => {
		return c.json({ max_retry_interval: config.maxRetryInterval });
	});

	app.put('/proxy-url', async (c) => {
		const body = (await c.req.json().catch(() => ({ value: undefined }))) as {
			value?: string;
		};

		if (typeof body.value !== 'string') {
			return c.json({ error: 'Missing proxy URL value' }, 400);
		}

		await persistConfig(config, { proxyURL: body.value });
		return c.json({ success: true });
	});

	app.get('/proxy-url', async (c) => {
		const stored = await readConfigFile(config.configDir);
		const proxyURL = typeof stored.proxyURL === 'string' ? stored.proxyURL : '';
		return c.json({ proxy_url: proxyURL });
	});

	app.delete('/proxy-url', async (c) => {
		await persistConfig(config, { proxyURL: '' });
		return c.json({ success: true });
	});

	app.put('/logging-to-file', async (c) => {
		const body = (await c.req.json().catch(() => ({ value: undefined }))) as {
			value?: boolean;
		};

		if (typeof body.value !== 'boolean') {
			return c.json({ error: 'Missing logging value' }, 400);
		}

		config.loggingToFile = body.value;
		await persistConfig(config, { loggingToFile: body.value });
		return c.json({ success: true });
	});

	app.get('/logging-to-file', (c) => {
		return c.json({ logging_to_file: config.loggingToFile });
	});

	app.patch('/quota-exceeded/switch-project', async (c) => {
		const body = (await c.req.json().catch(() => ({ value: undefined }))) as {
			value?: boolean;
		};

		if (typeof body.value !== 'boolean') {
			return c.json({ error: 'Missing switch project value' }, 400);
		}

		config.quotaExceeded.switchProject = body.value;
		await persistConfig(config, {
			quotaExceeded: { switchProject: body.value },
		});
		return c.json({ success: true });
	});

	app.patch('/quota-exceeded/switch-preview-model', async (c) => {
		const body = (await c.req.json().catch(() => ({ value: undefined }))) as {
			value?: boolean;
		};

		if (typeof body.value !== 'boolean') {
			return c.json({ error: 'Missing switch preview model value' }, 400);
		}

		config.quotaExceeded.switchPreviewModel = body.value;
		await persistConfig(config, {
			quotaExceeded: { switchPreviewModel: body.value },
		});
		return c.json({ success: true });
	});

	return app;
}
