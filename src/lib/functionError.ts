import { supabase } from './supabase';

/**
 * Recovers the actual human-readable message a Supabase edge function put in its JSON
 * error body — not the SDK's generic "Edge Function returned a non-2xx status code". On a
 * non-2xx response, supabase-js discards the response body and only exposes it via
 * `error.context`, an unread Response, so it has to be parsed by hand.
 */
export async function getFunctionErrorMessage(
  error: unknown,
  fallback = 'Something went wrong. Please try again.'
): Promise<string> {
  const context: Response | undefined = (error as { context?: Response } | undefined)?.context;
  if (context && typeof context.clone === 'function') {
    try {
      const body = await context.clone().json();
      if (body?.error) return body.error;
    } catch {
      // Response wasn't JSON — keep the fallback.
    }
  }
  return fallback;
}

/**
 * Invokes a Supabase edge function and throws with the real error message on failure —
 * either an HTTP-level failure (via `getFunctionErrorMessage`) or a logical failure the
 * function reported inside a 200 response body (`{ error: "..." }`).
 */
export async function invokeFunction<T = any>(
  functionName: string,
  body?: Record<string, unknown>
): Promise<T> {
  const { data, error } = await supabase.functions.invoke(functionName, body !== undefined ? { body } : undefined);

  if (error) {
    throw new Error(await getFunctionErrorMessage(error));
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  return data as T;
}
