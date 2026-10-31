import crypto from 'crypto';

// Cloudflare R2 (S3-compatible) presigned URLs, signed with AWS Signature V4.
// Free tier: 10 GB storage and no charge for students watching (no egress fees).
const accountId = process.env.R2_ACCOUNT_ID || '';
const accessKeyId = process.env.R2_ACCESS_KEY_ID || '';
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || '';
const bucket = process.env.R2_BUCKET || '';

export const r2Configured = Boolean(accountId && accessKeyId && secretAccessKey && bucket);

/** Lesson videos stored in R2 are saved on the lesson as "r2:<object key>". */
export const R2_PREFIX = 'r2:';

const hmac = (key: crypto.BinaryLike, value: string) => crypto.createHmac('sha256', key).update(value).digest();
const sha256 = (value: string) => crypto.createHash('sha256').update(value).digest('hex');
const encodeKey = (key: string) => key.split('/').map((part) => encodeURIComponent(part)).join('/');

function presign(method: 'GET' | 'PUT', key: string, expiresSeconds: number, extraQuery: Record<string, string> = {}) {
  if (!r2Configured) throw new Error('Video storage is not set up. Add the R2_* settings (see docs/video-storage.md).');
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

/** URL the browser PUTs the video file to (valid for 2 hours, enough for large uploads). */
export const presignUpload = (key: string) => presign('PUT', key, 2 * 60 * 60);

/** Short-lived URL for watching a video (valid for 4 hours). */
export const presignPlayback = (key: string) => presign('GET', key, 4 * 60 * 60);

/** Object key for a lesson video: courses/<courseId>/<lessonId>/<timestamp>-<name>. */
export function lessonVideoKey(courseId: string, lessonId: string, fileName: string) {
  const safe = (value: string) => value.replace(/[^a-zA-Z0-9._-]/g, '-').replace(/-+/g, '-').slice(0, 80) || 'video';
  return `courses/${safe(courseId)}/${safe(lessonId)}/${Date.now()}-${safe(fileName)}`;
}

/** The course a stored key belongs to, or '' if the key is not a lesson video. */
export function courseIdFromKey(key: string) {
  const match = key.match(/^courses\/([^/]+)\/[^/]+\/[^/]+$/);
  return match ? match[1] : '';
}
