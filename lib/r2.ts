import crypto from 'crypto';
import { kvGet, kvSet } from '@/lib/kv-store';

// Cloudflare R2 (S3-compatible) presigned URLs, signed with AWS Signature V4.
// Free tier: 10 GB storage and no charge for students watching (no egress fees).
//
// The connection comes from the R2_* environment variables, or, when those are not set, from
// the settings an admin saves in the panel (Course builder → Upload video → Connect video storage).
export type R2Config = { accountId: string; accessKeyId: string; secretAccessKey: string; bucket: string };
const SETTINGS_KEY = 'video-storage-settings';

const envConfig = (): R2Config => ({
  accountId: process.env.R2_ACCOUNT_ID || '',
  accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  bucket: process.env.R2_BUCKET || '',
});
const complete = (config: Partial<R2Config> | null | undefined): config is R2Config =>
  Boolean(config?.accountId && config.accessKeyId && config.secretAccessKey && config.bucket);

/** The R2 connection in use and where it comes from, or null when none is set. */
export async function getR2Config(): Promise<{ config: R2Config; source: 'env' | 'panel' } | null> {
  const env = envConfig();
  if (complete(env)) return { config: env, source: 'env' };
  const saved = await kvGet<Partial<R2Config> | null>(SETTINGS_KEY, null).catch(() => null);
  return complete(saved) ? { config: saved, source: 'panel' } : null;
}

export async function r2Configured() {
  return Boolean(await getR2Config());
}

export async function saveR2Config(input: R2Config) {
  const clean: R2Config = {
    accountId: input.accountId.trim().replace(/[^a-f0-9]/gi, ''),
    accessKeyId: input.accessKeyId.trim(),
    secretAccessKey: input.secretAccessKey.trim(),
    bucket: input.bucket.trim().toLowerCase(),
  };
  if (!complete(clean)) throw new Error('Fill in all four fields.');
  if (!/^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/.test(clean.bucket)) throw new Error('The bucket name can only have lowercase letters, numbers and dashes.');
  await testR2(clean);
  await kvSet(SETTINGS_KEY, clean);
  return clean;
}

/** Writes and deletes a tiny file, so a wrong key, bucket or account is caught before saving. */
export async function testR2(config: R2Config) {
  const key = `connection-check/${Date.now()}.txt`;
  const put = await fetch(presignWith(config, 'PUT', key, 300), { method: 'PUT', body: 'ok' }).catch(() => null);
  if (!put) throw new Error('Could not reach Cloudflare R2. Check the Account ID.');
  if (put.status === 403 || put.status === 401) throw new Error('Cloudflare refused the key. Check the Access Key ID and Secret, and that the token has Object Read & Write for this bucket.');
  if (put.status === 404) throw new Error('The bucket was not found. Check the bucket name.');
  if (!put.ok) throw new Error(`Cloudflare R2 answered with status ${put.status}.`);
  await fetch(presignWith(config, 'DELETE', key, 300), { method: 'DELETE' }).catch(() => undefined);
}

/** Lesson videos stored in R2 are saved on the lesson as "r2:<object key>". */
export const R2_PREFIX = 'r2:';

const hmac = (key: crypto.BinaryLike, value: string) => crypto.createHmac('sha256', key).update(value).digest();
const sha256 = (value: string) => crypto.createHash('sha256').update(value).digest('hex');
const encodeKey = (key: string) => key.split('/').map((part) => encodeURIComponent(part)).join('/');

function presignWith({ accountId, accessKeyId, secretAccessKey, bucket }: R2Config, method: 'GET' | 'PUT' | 'DELETE', key: string, expiresSeconds: number, extraQuery: Record<string, string> = {}) {
  const host = `${accountId}.r2.cloudflarestorage.com`;
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
  const date = amzDate.slice(0, 8);
  const scope = `${date}/auto/s3/aws4_request`;
  const path = `/${bucket}/${encodeKey(key)}`;

  const query: Record<string, string> = {
    'X-Amz-Algorithm': 'AWS4-HMAC-SHA256',
    'X-Amz-Credential': `${accessKeyId}/${scope}`,
    'X-Amz-Date': amzDate,
    'X-Amz-Expires': String(expiresSeconds),
    'X-Amz-SignedHeaders': 'host',
    ...extraQuery,
  };
  const canonicalQuery = Object.keys(query).sort()
    .map((name) => `${encodeURIComponent(name)}=${encodeURIComponent(query[name])}`)
    .join('&');
  const canonicalRequest = [method, path, canonicalQuery, `host:${host}\n`, 'host', 'UNSIGNED-PAYLOAD'].join('\n');
  const stringToSign = ['AWS4-HMAC-SHA256', amzDate, scope, sha256(canonicalRequest)].join('\n');
  const signingKey = hmac(hmac(hmac(hmac(`AWS4${secretAccessKey}`, date), 'auto'), 's3'), 'aws4_request');
  const signature = crypto.createHmac('sha256', signingKey).update(stringToSign).digest('hex');
  return `https://${host}${path}?${canonicalQuery}&X-Amz-Signature=${signature}`;
}

async function presign(method: 'GET' | 'PUT', key: string, expiresSeconds: number) {
  const found = await getR2Config();
  if (!found) throw new Error('Video storage is not connected yet.');
  return presignWith(found.config, method, key, expiresSeconds);
}

/** URL the browser PUTs the video file to (valid for 2 hours, enough for large uploads). */
export const presignUpload = (key: string) => presign('PUT', key, 2 * 60 * 60);

/** Short-lived URL for watching a video (valid for 4 hours). */
export const presignPlayback = (key: string) => presign('GET', key, 4 * 60 * 60);

/** Object key for a lesson video: courses/<courseId>/<lessonId>/<timestamp>-<name>. */
export function lessonVideoKey(courseId: string, lessonId: string, fileName: string) {
  const safe = (value: string) => value.replace(/[^a-zA-Z0-9._-]/g, '-').replace(/-+/g, '-').slice(0, 80) || 'video';
  return `courses/${safe(courseId)}/${safe(lessonId)}/${Date.now()}-${safe(fileName)}`;
}

/** The lesson a stored key belongs to, or ''. */
export function lessonIdFromKey(key: string) {
  const match = key.match(/^courses\/[^/]+\/([^/]+)\/[^/]+$/);
  return match ? match[1] : '';
}

/** The course a stored key belongs to, or '' if the key is not a lesson video. */
export function courseIdFromKey(key: string) {
  const match = key.match(/^courses\/([^/]+)\/[^/]+\/[^/]+$/);
  return match ? match[1] : '';
}
