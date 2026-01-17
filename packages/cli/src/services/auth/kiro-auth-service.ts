/**
 * Kiro Authentication Service
 *
 * Implements Kiro authentication via Google OAuth and AWS Builder ID.
 * @see https://kiro.dev
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { readdir } from 'node:fs/promises';

const KIRO_GOOGLE_AUTH_URL = 'https://prod.us-east-1.auth.desktop.kiro.dev/oauth2/google';
const KIRO_TOKEN_URL = 'https://prod.us-east-1.auth.desktop.kiro.dev/oauth2/token';
const KIRO_CLIENT_ID = '0c1f5541-7f7d-4321-9c20-9f2c935e74c9';

interface KiroGoogleAuthResponse {
	url?: string;
	state?: string;
	error?: string;
}

interface KiroTokenResponse {
	access_token: string;
	refresh_token: string;
	expires_in: number;
	token_type: string;
}

export interface KiroGoogleAuthResult {
	success: boolean;
	url?: string;
	state?: string;
	error?: string;
}

export interface KiroGooglePollResult {
	status: 'pending' | 'success' | 'error';
	email?: string;
	error?: string;
}

/**
 * Start Kiro Google OAuth flow
 */
export async function startKiroGoogleAuth(): Promise<KiroGoogleAuthResult> {
	try {
		const response = await fetch(KIRO_GOOGLE_AUTH_URL, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/json',
			},
			body: JSON.stringify({
				clientId: KIRO_CLIENT_ID,
				redirectUri: 'https://desktop.kiro.dev/oauth/callback',
				scope: 'openid profile email',
			}),
		});

		if (!response.ok) {
			const error = await response.text();
			return {
				success: false,
				error: `Kiro API error: ${response.status} - ${error}`,
			};
		}

		const data = (await response.json()) as KiroGoogleAuthResponse;

		if (data.error) {
			return {
				success: false,
				error: data.error,
			};
		}

		return {
			success: true,
			url: data.url,
			state: data.state,
		};
	} catch (err) {
		return {
			success: false,
			error: err instanceof Error ? err.message : String(err),
		};
	}
}

/**
 * Poll for Kiro Google OAuth completion
 */
export async function pollKiroGoogleAuth(state: string): Promise<KiroGooglePollResult> {
	try {
		const response = await fetch(KIRO_TOKEN_URL, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/json',
			},
			body: JSON.stringify({
				grantType: 'oauth2/google',
				state,
				clientId: KIRO_CLIENT_ID,
			}),
		});

		if (!response.ok) {
			const errorText = await response.text();
			let error = `HTTP ${response.status}`;

			try {
				const errorJson = JSON.parse(errorText);
				if (errorJson.error) {
					error = errorJson.error;
				}
			} catch {
				// Not JSON, use status text
			}

			if (error.includes('pending') || error.includes('authorization_pending')) {
				return { status: 'pending' };
			}

			return {
				status: 'error',
				error,
			};
		}

		const data = (await response.json()) as KiroTokenResponse & { email?: string };

		if (data.access_token) {
			// Save the auth file
			const email = data.email || 'kiro-user';
			await saveKiroAuthFile('google', email, data.access_token, data.refresh_token);

			return {
				status: 'success',
				email,
			};
		}

		return { status: 'pending' };
	} catch (err) {
		return {
			status: 'error',
			error: err instanceof Error ? err.message : String(err),
		};
	}
}

/**
 * Save Kiro auth file to ~/.cli-proxy-api/
 */
export async function saveKiroAuthFile(
	method: 'google' | 'aws',
	email: string,
	accessToken: string,
	refreshToken: string,
): Promise<string> {
	const authDir = getAuthDir();
	const timestamp = Date.now();
	const fileName = `kiro-${method}-${email}-${timestamp}.json`;
	const filePath = `${authDir}/${fileName}`;

	const content = JSON.stringify(
		{
			access_token: accessToken,
			refresh_token: refreshToken,
			email,
			auth_method: method === 'google' ? 'Social' : 'IdC',
			created_at: timestamp,
			provider: 'kiro',
		},
		null,
		2,
	);

	writeFileSync(filePath, content);
	return fileName;
}

/**
 * Delete Kiro auth file
 */
export async function deleteKiroAuthFile(
	method: 'google' | 'aws',
	email: string,
): Promise<boolean> {
	const authDir = getAuthDir();

	try {
		const files = await readdir(authDir);
		const prefix = `kiro-${method}-`;

		for (const fileName of files) {
			if (fileName.startsWith(prefix) && fileName.endsWith('.json')) {
				// Extract email from filename
				let name = fileName.slice(prefix.length);
				if (name.endsWith('.json')) {
					name = name.slice(0, -'.json'.length);
				}

				// Match by email (remove timestamp suffix if present)
				const emailPattern = new RegExp(`^${email}(-\\d+)?$`);
				if (emailPattern.test(name)) {
					const filePath = `${authDir}/${fileName}`;
					const { unlinkSync } = await import('node:fs');
					unlinkSync(filePath);
					return true;
				}
			}
		}
	} catch {
		// Auth directory doesn't exist or other error
	}

	return false;
}

/**
 * List all Kiro auth files
 */
export async function listKiroAuthFiles(): Promise<
	Array<{
		email: string;
		method: 'google' | 'aws';
		createdAt: string;
	}>
> {
	const authDir = getAuthDir();
	const results: Array<{ email: string; method: 'google' | 'aws'; createdAt: string }> = [];

	try {
		const files = await readdir(authDir);

		for (const fileName of files) {
			if (fileName.startsWith('kiro-') && fileName.endsWith('.json')) {
				const filePath = `${authDir}/${fileName}`;
				try {
					const content = readFileSync(filePath, 'utf-8');
					const data = JSON.parse(content);

					// Extract method and email from filename
					let name = fileName.slice('kiro-'.length);
					if (name.endsWith('.json')) {
						name = name.slice(0, -'.json'.length);
					}

					const isGoogle = name.startsWith('google-');
					const isAws = name.startsWith('aws-');
					let email = name;

					if (isGoogle) {
						email = name.slice('google-'.length);
					} else if (isAws) {
						email = name.slice('aws-'.length);
					}

					results.push({
						email: data.email || email,
						method: isGoogle ? 'google' : 'aws',
						createdAt: data.created_at
							? new Date(data.created_at).toISOString()
							: new Date().toISOString(),
					});
				} catch {
					// Skip invalid files
				}
			}
		}
	} catch {
		// Auth directory doesn't exist
	}

	return results;
}

function getAuthDir(): string {
	const home = process.env.HOME ?? Bun.env.HOME ?? '';
	return `${home}/.cli-proxy-api`;
}
