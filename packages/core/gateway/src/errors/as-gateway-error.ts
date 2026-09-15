import { APICallError } from '@ai-toolkit/provider';
import { extractApiCallResponse, GatewayError } from '.';
import { createGatewayErrorFromResponse } from './create-gateway-error';

export async function asGatewayError(
  error: unknown,
  authMethod?: 'api-key' | 'oidc',
): Promise<GatewayError> {
  if (GatewayError.isInstance(error)) {
    return error;
  }

  if (APICallError.isInstance(error)) {
    return createGatewayErrorFromResponse({
      response: await extractApiCallResponse(error),
      statusCode: error.statusCode ?? 500,
      defaultMessage: 'Gateway request failed',
      cause: error,
      authMethod,
    });
  }

  return createGatewayErrorFromResponse({
    response: {},
    statusCode: 500,
    defaultMessage:
      error instanceof Error
        ? `Gateway request failed: ${error.message}`
        : 'Unknown Gateway error',
    cause: error,
    authMethod,
  });
}
