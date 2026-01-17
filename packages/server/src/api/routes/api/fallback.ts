import type { AIProvider, FallbackEntry, VirtualModel } from '@quotio/core';
import { parseProvider } from '@quotio/core';
import { Hono } from 'hono';
import {
	addFallbackEntry,
	addVirtualModel,
	clearAllRouteStates,
	exportConfiguration,
	getAllRouteStates,
	getFallbackEnabled,
	getVirtualModel,
	getVirtualModels,
	importConfiguration,
	moveFallbackEntry,
	removeFallbackEntry,
	removeVirtualModel,
	renameVirtualModel,
	setFallbackEnabled,
	updateVirtualModel,
} from '../../../services/fallback/settings-service.js';

interface FallbackEntryInfo {
	id: string;
	provider: string;
	modelId: string;
	priority: number;
}

interface VirtualModelInfo {
	id: string;
	name: string;
	fallbackEntries: FallbackEntryInfo[];
	isEnabled: boolean;
}

function toFallbackEntryInfo(entry: FallbackEntry): FallbackEntryInfo {
	return {
		id: entry.id,
		provider: entry.provider,
		modelId: entry.modelId,
		priority: entry.priority,
	};
}

function toVirtualModelInfo(model: VirtualModel): VirtualModelInfo {
	return {
		id: model.id,
		name: model.name,
		fallbackEntries: model.fallbackEntries.map(toFallbackEntryInfo),
		isEnabled: model.isEnabled,
	};
}

export function fallbackRoutes(): Hono {
	const app = new Hono();

	app.get('/fallback', async (c) => {
		const config = await getFallbackEnabled();
		const models = await getVirtualModels();
		return c.json({
			isEnabled: config,
			virtualModels: models.map(toVirtualModelInfo),
		});
	});

	app.patch('/fallback/enabled', async (c) => {
		const body = (await c.req.json().catch(() => ({ enabled: undefined }))) as {
			enabled?: boolean;
		};

		if (typeof body.enabled !== 'boolean') {
			return c.json({ error: 'Missing enabled flag' }, 400);
		}

		await setFallbackEnabled(body.enabled);
		return c.json({ success: true });
	});

	app.get('/fallback/models', async (c) => {
		const models = await getVirtualModels();
		return c.json({ models: models.map(toVirtualModelInfo) });
	});

	app.get('/fallback/models/:id', async (c) => {
		const model = await getVirtualModel(c.req.param('id'));
		return c.json({ model: model ? toVirtualModelInfo(model) : null });
	});

	app.post('/fallback/models', async (c) => {
		const body = (await c.req.json().catch(() => ({ name: undefined }))) as {
			name?: string;
		};

		if (!body.name || body.name.trim() === '') {
			return c.json({ success: false, error: 'Missing model name' }, 400);
		}

		const model = await addVirtualModel(body.name);
		return c.json({
			success: model !== null,
			model: model ? toVirtualModelInfo(model) : undefined,
		});
	});

	app.delete('/fallback/models/:id', async (c) => {
		const success = await removeVirtualModel(c.req.param('id'));
		return c.json({ success });
	});

	app.patch('/fallback/models/:id', async (c) => {
		const body = (await c.req.json().catch(() => ({}))) as {
			name?: string;
			isEnabled?: boolean;
		};
		const id = c.req.param('id');
		const model = await getVirtualModel(id);
		if (!model) {
			return c.json({ success: false }, 404);
		}

		if (body.name !== undefined && body.name !== model.name) {
			const renamed = await renameVirtualModel(id, body.name);
			if (!renamed) {
				return c.json({ success: false });
			}
		}

		if (typeof body.isEnabled === 'boolean' && body.isEnabled !== model.isEnabled) {
			const updatedModel = await getVirtualModel(id);
			if (!updatedModel) {
				return c.json({ success: false }, 404);
			}

			const success = await updateVirtualModel({
				...updatedModel,
				isEnabled: body.isEnabled,
			});
			return c.json({ success });
		}

		return c.json({ success: true });
	});

	app.post('/fallback/models/:id/entries', async (c) => {
		const body = (await c.req.json().catch(() => ({
			provider: undefined,
			modelName: undefined,
		}))) as {
			provider?: string;
			modelName?: string;
		};
		const provider = body.provider ? parseProvider(body.provider) : null;
		if (!provider) {
			return c.json({ success: false }, 400);
		}
		if (!body.modelName) {
			return c.json({ success: false }, 400);
		}

		const entry = await addFallbackEntry(c.req.param('id'), provider as AIProvider, body.modelName);
		return c.json({
			success: entry !== null,
			entry: entry ? toFallbackEntryInfo(entry) : undefined,
		});
	});

	app.delete('/fallback/models/:id/entries/:entryId', async (c) => {
		const success = await removeFallbackEntry(c.req.param('id'), c.req.param('entryId'));
		return c.json({ success });
	});

	app.post('/fallback/models/:id/entries/reorder', async (c) => {
		const body = (await c.req.json().catch(() => ({
			fromIndex: undefined,
			toIndex: undefined,
		}))) as {
			fromIndex?: number;
			toIndex?: number;
		};
		const fromIndex = body.fromIndex;
		const toIndex = body.toIndex;
		if (typeof fromIndex !== 'number' || typeof toIndex !== 'number') {
			return c.json({ success: false }, 400);
		}

		const moved = await moveFallbackEntry(c.req.param('id'), fromIndex, toIndex);
		return c.json({ success: moved });
	});

	app.get('/fallback/routes', async (c) => {
		const states = getAllRouteStates();
		return c.json({
			states: states.map((state) => ({
				virtualModelName: state.virtualModelName,
				currentEntryIndex: state.currentEntryIndex,
				currentEntry: toFallbackEntryInfo(state.currentEntry),
				lastUpdated: state.lastUpdated.toISOString(),
				totalEntries: state.totalEntries,
			})),
		});
	});

	app.delete('/fallback/routes', async (c) => {
		clearAllRouteStates();
		return c.json({ success: true });
	});

	app.get('/fallback/export', async (c) => {
		const json = await exportConfiguration();
		return c.json({ json });
	});

	app.post('/fallback/import', async (c) => {
		const body = (await c.req.json().catch(() => ({ json: undefined }))) as {
			json?: string;
		};
		if (!body.json) {
			return c.json({ success: false }, 400);
		}
		const success = await importConfiguration(body.json);
		return c.json({ success });
	});

	return app;
}
