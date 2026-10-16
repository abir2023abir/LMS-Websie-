import path from 'path';

// Vercel functions can only write under /tmp, and /tmp is wiped between cold starts.
const root = process.env.VERCEL ? path.join('/tmp', 'lms-data') : path.join(process.cwd(), 'data');

export function dataPath(...parts: string[]) {
  return path.join(root, ...parts);
}
