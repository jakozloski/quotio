/**
 * Proxy module exports
 * @packageDocumentation
 */

export type {
	Message,
	ChatCompletionRequest,
	ClaudeMessageRequest,
	ProxyRequest,
	ModelRoute,
} from "./types.js";

export {
	MessageSchema,
	ChatCompletionRequestSchema,
	ClaudeMessageRequestSchema,
	PROVIDER_MODELS,
	inferProviderFromModel,
} from "./types.js";

export type {
	ProxyResponse,
	ProxyStreamChunk,
	DispatcherConfig,
} from "./dispatcher.js";

export { ProxyDispatcher, DispatchError } from "./dispatcher.js";
