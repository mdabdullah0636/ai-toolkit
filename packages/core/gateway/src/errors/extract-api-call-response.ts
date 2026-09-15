import type { APICallError } from '@ai-toolkit/provider';
import { safeParseJSON } from '@ai-toolkit/provider-utils';

export async function extractApiCallResponse(
  error: APICallError,
): Promise<unknown> {
  if (error.data !== undefined) {
    return error.data;
  }
  if (error.responseBody != null) {
    const result = await safeParseJSON({ text: error.responseBody });
    return result.success ? result.value : error.responseBody;
  }
  return {};
}
