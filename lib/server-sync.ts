// Background copy of browser-side records to the server. The local UI never waits on it.
export function sendRecord(url: string, body: object, method: 'POST' | 'PATCH' = 'POST') {
  if (typeof window === 'undefined') return;
  fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    keepalive: true,
  }).catch(() => undefined);
}
