/**
 * Application context types
 */
import type { Config } from "../config/index.js";
import type { AuthManager } from "../auth/index.js";
import type { TokenStore } from "../store/index.js";
import type { ProxyDispatcher } from "../proxy/index.js";

export interface AppContext {
	config: Config;
	authManager: AuthManager;
	store: TokenStore;
	dispatcher: ProxyDispatcher;
}

export interface AppEnv {
	Variables: {
		config: Config;
		authManager: AuthManager;
		store: TokenStore;
		dispatcher: ProxyDispatcher;
	};
}
