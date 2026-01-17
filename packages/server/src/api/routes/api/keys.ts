import { mkdir } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { Hono } from 'hono';
import type { Config } from '../../../config/index.js';
import { ConfigSchema } from '../../../config/index.js';

const CONFIG_FILE_NAME = 'server-config.json';

interface KeysRoutesDeps {
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

async function writeConfigFile(configDir: string, data: Record<string, unknown>): Promise<void> {
	const configPath = expandPath(configDir);
	const configFile = join(configPath, CONFIG_FILE_NAME);
	await mkdir(configPath, { recursive: true });
	await Bun.write(configFile, JSON.stringify(data, null, 2));
}

async function persistApiKeys(config: Config, apiKeys: string[]): Promise<string[]> {
	const fileConfig = await readConfigFile(config.configDir);
	const nextConfig = {
		...fileConfig,
		apiKeys,
	};

	const parsed = ConfigSchema.safeParse({ ...config, ...nextConfig });
	if (!parsed.success) {
		throw new Error('Invalid api keys configuration');
	}

	config.apiKeys = apiKeys;
	await writeConfigFile(config.configDir, nextConfig);
	return apiKeys;
}

export function apiKeysRoutes(deps: KeysRoutesDeps): Hono {
	const app = new Hono();
	const { config } = deps;

	app.get('/api-keys', (c) => {
		return c.json({ 'api-keys': config.apiKeys });
	});

	app.post('/api-keys', async (c) => {
		const newKey = crypto.randomUUID();
		const apiKeys = [...config.apiKeys, newKey];
		await persistApiKeys(config, apiKeys);
		return c.json({ 'api-key': newKey });
	});

	app.delete('/api-keys', async (c) => {
		const key = c.req.query('key');
		if (!key) {
			return c.json({ success: false }, 400);
		}
		const apiKeys = config.apiKeys.filter((entry) => entry !== key);
		await persistApiKeys(config, apiKeys);
		return c.json({ success: true });
	});

	return app;
}
