// Cliente HTTP centralizado. Usa EXPO_PUBLIC_API_URL se definido, senão localhost.
// Nas telas, importe API_URL ou apiRequest daqui (não declare hardcoded).

export const API_URL =
  process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export async function apiRequest(path, options = {}) {
  const { body, ...restOptions } = options;
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...restOptions.headers,
    },
    ...restOptions,
    ...(body !== undefined && { body: JSON.stringify(body) }),
  });
  if (!response.ok) {
    const msg = await response.text().catch(() => `HTTP ${response.status}`);
    throw new Error(msg);
  }
  return response.json();
}
