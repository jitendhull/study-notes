// GitHub webhook: validates signature, triggers ISR revalidation.
// Set GitHub webhook secret = WEBHOOK_SECRET env var.

import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import crypto from 'crypto';

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET ?? '';

async function verifySignature(req: NextRequest, body: string): Promise<boolean> {
  const sig = req.headers.get('x-hub-signature-256');
  if (!sig || !WEBHOOK_SECRET) return false;
  const expected = 'sha256=' + crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(body)
    .digest('hex');
  // Timing-safe compare
  try {
    return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  const body = await req.text();

  if (!await verifySignature(req, body)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const event = req.headers.get('x-github-event');
  if (event !== 'push') {
    return NextResponse.json({ ok: true, skipped: 'not a push event' });
  }

  // Revalidate all note-related paths
  revalidatePath('/', 'layout');

  return NextResponse.json({ ok: true, revalidated: true });
}
