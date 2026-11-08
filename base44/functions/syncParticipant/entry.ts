import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

const clampText = (value, max) => String(value || '').slice(0, max);

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const deviceId = clampText(body.deviceId, 80).trim();
    const name = clampText(body.name, 80).trim();
    const startDate = clampText(body.startDate, 10);
    const challengeLength = Math.max(1, Math.min(365, Number(body.challengeLength) || 0));
    const completedDays = Math.max(0, Math.min(365, Number(body.completedDays) || 0));

    if (deviceId.length < 6) return Response.json({ error: 'deviceId is required' }, { status: 400 });
    if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
      return Response.json({ error: 'startDate is required' }, { status: 400 });
    }

    const payload = {
      deviceId,
      name: name || 'Anonymous',
      startDate,
      challengeLength,
      completedDays,
      lastActive: new Date().toISOString(),
    };

    const existing = await base44.asServiceRole.entities.Participant.filter({ deviceId }, { limit: 1 });
    const record = (existing?.items || [])[0];

    if (record) {
      await base44.asServiceRole.entities.Participant.update(record.id, payload);
    } else {
      await base44.asServiceRole.entities.Participant.create(payload);
    }

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}