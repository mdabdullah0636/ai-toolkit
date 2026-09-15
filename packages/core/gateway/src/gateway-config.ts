import {
  createJsonErrorResponseHandler,
  type FetchFunction,
  type Resolvable,
} from '@ai-toolkit/provider-utils';
import { z } from 'zod/v4';

export type GatewayConfig = {
  baseURL: string;
  headers: () => Resolvable<Record<string, string | undefined>>;
  fetch?: FetchFunction;
};

/**
 * Configuration shared by all gateway model implementations.
 */
export type GatewayModelConfig = GatewayConfig & {
  provider: string;
  o11yHeaders: Resolvable<Record<string, string>>;
};

/**
 * Failed-response handler shared by all gateway API calls.
 */
export const gatewayErrorResponseHandler = createJsonErrorResponseHandler({
  errorSchema: z.any(),
  errorToMessage: data => data,
});
