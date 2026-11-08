import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { secrets } from 'base44:runtime';

const safeEqual = (a, b) => {
  const left = String(a || '');
  const right = String(b || '');
  if (!left || !right || left.length !== right.length) return false;
  let diff = 0;
  for (let i = 0; i < left.length; i += 1) {
    diff |= left.charCodeAt(i) ^ right.charCodeAt(i);
  }
  return diff === 0;
};

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const password = String(body.password || '');

    const expected = secrets.get('ADMIN_PASSWORD');
    if (!expected) {
      return Response.json({ error: 'Admin password is not configured yet.' }, { status: 503 });
    }
    if (!safeEqual(password, expected)) {
      return Response.json({ error: 'Wrong password.' }, { status: 403 });
    }

    const page = await base44.asServiceRole.entities.Participant.filter(
      {},
      { sort: '-lastActive', limit: 500 },
    );

    const participants = (page?.items || []).map((row) => ({
      deviceId: row.deviceId,
      name: row.name || 'Anonymous',
      startDate: row.startDate || '',
      challengeLength: Number(row.challengeLength) || 0,
      completedDays: Number(row.completedDays) || 0,
      lastActive: row.lastActive || row.updated_date || row.created_date || '',
    }));

    return Response.json({ participants });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}