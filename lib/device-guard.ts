import { randomBytes } from 'node:crypto';
import type { NextResponse } from 'next/server';
import { kvGet, kvSet } from '@/lib/kv-store';

/**
 * Single-device rule for student accounts: the first device a student signs in on becomes
 * their authorized device; a sign-in from any other device is refused and shown to the admin
 * as a security alert. The admin can allow a new device for one student, or turn the rule off.
 * Staff accounts (instructor, admin) are never limited.
 */
const KEY = 'device-guard';
const COOKIE = 'cbs_device';
const MAX_ALERTS = 100;

type Bound = { deviceId: string; boundAt: string; agent: string };
export type DeviceAlert = { id: string; at: string; studentId: string; name: string; email: string; agent: string; ip: string };
type Store = { enabled: boolean; devices: Record<string, Bound>; alerts: DeviceAlert[] };

async function read(): Promise<Store> {
  const saved = await kvGet<Partial<Store> | null>(KEY, null).catch(() => null);
  return { enabled: saved?.enabled !== false, devices: saved?.devices || {}, alerts: Array.isArray(saved?.alerts) ? saved!.alerts : [] };
}

function cookieDevice(request: Request) {
  const raw = request.headers.get('cookie') || '';
  const part = raw.split(';').map((item) => item.trim()).find((item) => item.startsWith(`${COOKIE}=`));
  const value = part ? part.slice(COOKIE.length + 1) : '';
  return /^[a-f0-9]{32}$/.test(value) ? value : '';
}

/** A short, readable name for the browser, e.g. "Chrome on Windows". */
function describeAgent(agent: string) {
  const browser = /Edg\//.test(agent) ? 'Edge' : /OPR\//.test(agent) ? 'Opera' : /Chrome\//.test(agent) ? 'Chrome' : /Firefox\//.test(agent) ? 'Firefox' : /Safari\//.test(agent) ? 'Safari' : 'Browser';
  const system = /Android/.test(agent) ? 'Android' : /iPhone|iPad/.test(agent) ? 'iOS' : /Windows/.test(agent) ? 'Windows' : /Mac OS X/.test(agent) ? 'macOS' : /Linux/.test(agent) ? 'Linux' : 'unknown device';
  return `${browser} on ${system}`;
}

type Person = { id: string; name: string; email: string; roles: string[] };

/**
 * Call after the password (or Google sign-in) is accepted and before the session is set.
 * `ok: false` means this device is not the student's authorized one.
 */
export async function checkDevice(request: Request, person: Person, ip: string): Promise<{ ok: true; deviceId: string } | { ok: false; message: string }> {
  const deviceId = cookieDevice(request) || randomBytes(16).toString('hex');
  const limited = person.roles.includes('Student') && !person.roles.includes('Instructor') && !person.roles.includes('Admin');
  if (!limited) return { ok: true, deviceId };

  const store = await read();
  if (!store.enabled) return { ok: true, deviceId };
  const agent = describeAgent(request.headers.get('user-agent') || '');
  const bound = store.devices[person.id];

  if (!bound) {
    store.devices[person.id] = { deviceId, boundAt: new Date().toISOString(), agent };
    await kvSet(KEY, store);
    return { ok: true, deviceId };
  }
  if (bound.deviceId === deviceId) return { ok: true, deviceId };

  store.alerts = [
    { id: randomBytes(6).toString('hex'), at: new Date().toISOString(), studentId: person.id, name: person.name, email: person.email, agent, ip },
    ...store.alerts,
  ].slice(0, MAX_ALERTS);
  await kvSet(KEY, store);
  return { ok: false, message: 'This account is already in use on another device. Ask the admin to allow this device.' };
}

/** Remembers the device in the browser for a year, so the same browser is recognised next time. */
export function attachDeviceCookie(response: NextResponse, deviceId: string) {
  response.cookies.set(COOKIE, deviceId, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 60 * 60 * 24 * 365 });
}

export async function deviceOverview() {
  const store = await read();
  return {
    enabled: store.enabled,
    protectedCount: Object.keys(store.devices).length,
    devices: store.devices,
    alerts: store.alerts.slice(0, 10),
  };
}

export async function setDeviceRule(enabled: boolean) {
  const store = await read();
  await kvSet(KEY, { ...store, enabled });
}

/** Forgets the student's authorized device: the next device they sign in on becomes the new one. */
export async function resetDevice(studentId: string) {
  const store = await read();
  delete store.devices[studentId];
  await kvSet(KEY, store);
}
