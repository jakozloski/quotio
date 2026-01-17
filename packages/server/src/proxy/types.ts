/**
 * Proxy request/response types
 * @packageDocumentation
 */

import { z } from "zod";

/**
 * OpenAI-compatible message format
 */
export const MessageSchema = z.object({
	role: z.enum(["system", "user", "assistant", "tool"]),
	content: z.union([
		z.string(),
		z.array(
			z.object({
				type: z.string(),
				text: z.string().optional(),
				image_url: z
					.object({
						url: z.string(),
						detail: z.string().optional(),
					})
					.optional(),
			}),
		),
	]),
	name: z.string().optional(),
	tool_calls: z.array(z.unknown()).optional(),
	tool_call_id: z.string().optional(),
});

export type Message = z.infer<typeof MessageSchema>;

/**
 * OpenAI-compatible chat completion request
 */
export const ChatCompletionRequestSchema = z.object({
	model: z.string(),
	messages: z.array(MessageSchema),
	temperature: z.number().optional(),
	top_p: z.number().optional(),
	n: z.number().optional(),
	stream: z.boolean().optional(),
	stop: z.union([z.string(), z.array(z.string())]).optional(),
	max_tokens: z.number().optional(),
	max_completion_tokens: z.number().optional(),
	presence_penalty: z.number().optional(),
	frequency_penalty: z.number().optional(),
	logit_bias: z.record(z.number()).optional(),
	user: z.string().optional(),
	tools: z.array(z.unknown()).optional(),
	tool_choice: z.unknown().optional(),
	response_format: z.unknown().optional(),
	seed: z.number().optional(),
});

export type ChatCompletionRequest = z.infer<typeof ChatCompletionRequestSchema>;

/**
 * Claude-compatible message request
 */
export const ClaudeMessageRequestSchema = z.object({
	model: z.string(),
	messages: z.array(
		z.object({
			role: z.enum(["user", "assistant"]),
			content: z.union([
				z.string(),
				z.array(
					z.object({
						type: z.string(),
						text: z.string().optional(),
						source: z.unknown().optional(),
					}),
				),
			]),
		}),
	),
	max_tokens: z.number(),
	system: z.union([z.string(), z.array(z.unknown())]).optional(),
	temperature: z.number().optional(),
	top_p: z.number().optional(),
	top_k: z.number().optional(),
	stream: z.boolean().optional(),
	stop_sequences: z.array(z.string()).optional(),
	tools: z.array(z.unknown()).optional(),
	tool_choice: z.unknown().optional(),
	metadata: z.record(z.unknown()).optional(),
});

export type ClaudeMessageRequest = z.infer<typeof ClaudeMessageRequestSchema>;

/**
 * Unified internal request format
 */
export interface ProxyRequest {
	/** Original model identifier from request */
	model: string;
	/** Target provider(s) for routing */
	providers: string[];
	/** Request payload as bytes */
	payload: Uint8Array;
	/** Whether to stream response */
	stream: boolean;
	/** Request metadata */
	metadata: Record<string, unknown>;
}

/**
 * Model routing configuration
 */
export interface ModelRoute {
	/** Model pattern (exact or wildcard) */
	pattern: string;
	/** Target providers in priority order */
	providers: string[];
}

/**
 * Provider-specific model mapping
 */
export const PROVIDER_MODELS: Record<string, string[]> = {
	claude: [
		"claude-3-5-sonnet-20241022",
		"claude-3-5-haiku-20241022",
		"claude-3-opus-20240229",
		"claude-sonnet-4-20250514",
		"claude-opus-4-20250514",
	],
	gemini: [
		"gemini-2.0-flash-exp",
		"gemini-2.0-flash-thinking-exp",
		"gemini-1.5-pro",
		"gemini-1.5-flash",
		"gemini-exp-1206",
	],
	openai: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo", "o1", "o1-mini", "o1-pro"],
	copilot: ["gpt-4o", "claude-3.5-sonnet", "o1"],
};

/**
 * Extract provider from model name
 * e.g., "claude-3-5-sonnet" -> "claude"
 *       "gemini-1.5-pro" -> "gemini"
 *       "gpt-4o" -> "openai"
 */
export function inferProviderFromModel(model: string): string | null {
	const lowerModel = model.toLowerCase();

	if (lowerModel.startsWith("claude")) return "claude";
	if (lowerModel.startsWith("gemini")) return "gemini";
	if (lowerModel.startsWith("gpt-") || lowerModel.startsWith("o1")) return "openai";
	if (lowerModel.startsWith("qwen")) return "qwen";

	// Check explicit provider prefixes
	const prefixMatch = model.match(/^([a-z]+):/);
	if (prefixMatch) return prefixMatch[1];

	return null;
}
