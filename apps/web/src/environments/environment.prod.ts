const runtimeApiUrl =
  (globalThis as { __env?: { API_URL?: string } }).__env?.API_URL ??
  (globalThis as { process?: { env?: { API_URL?: string } } }).process?.env?.API_URL;

export const environment = {
  production: true,
  apiBaseUrl: runtimeApiUrl ?? '',
};
