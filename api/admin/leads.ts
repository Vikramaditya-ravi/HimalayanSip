import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/db.js';
import { type ApiRequest, type ApiResponse, readJsonBody } from '../../lib/http.js';
import { requireAdmin } from '../../lib/identity.js';
import { visitorIdOf } from '../../lib/stitch.js';
import { contextFromRequest, track } from '../../lib/track.js';
import type { EventName } from '../../src/analytics/catalog.js';

/**
 * Lead lifecycle. The admin surface where an enquiry becomes revenue.
 *
 * This is a business CRUD endpoint, not an analytics one — it reads the Lead
 * table directly. lib/metrics.ts still never touches it: the dashboard's revenue
 * numbers come from `lead_won` events and their props, not from these rows.
 */

export const config = { runtime: 'nodejs' };

const STATUS_EVENT: Record<string, EventName> = {
  contacted: 'lead_contacted',
  won: 'lead_won',
  lost: 'lead_lost',
  on_hold: 'lead_on_hold',
  dispatched: 'lead_dispatched',
};

const VALID_STATUS = new Set(['new', ...Object.keys(STATUS_EVENT)]);

export default async function handler(req: ApiRequest, res: ApiResponse): Promise<void> {
  if (!requireAdmin(req)) {
    res.status(401).json({ error: 'unauthorized' });
    return;
  }

  if (req.method === 'GET') {
    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
    res.status(200).json({
      data: leads.map((l) => ({ ...l, value: l.value ? Number(l.value) : null })),
    });
    return;
  }

  if (req.method !== 'PATCH') {
    res.status(405).json({ error: 'method_not_allowed' });
    return;
  }

  const body = readJsonBody(req) as { id?: unknown; status?: unknown; value?: unknown } | null;
  const id = typeof body?.id === 'string' ? body.id : null;
  const status = typeof body?.status === 'string' ? body.status : null;

  if (!id || !status || !VALID_STATUS.has(status)) {
    res.status(400).json({ error: 'invalid_request' });
    return;
  }

  const value =
    body?.value === null || body?.value === undefined || body.value === ''
      ? null
      : Number(body.value);
  if (value !== null && (!Number.isFinite(value) || value < 0)) {
    res.status(400).json({ error: 'invalid_value' });
    return;
  }

  try {
    const updated = await prisma.lead.update({
      where: { id },
      data: {
        status: status as never,
        value: value === null ? null : new Prisma.Decimal(value),
        contactedAt: status === 'contacted' ? new Date() : undefined,
        closedAt: status === 'won' || status === 'lost' ? new Date() : undefined,
      },
      select: { id: true, status: true, value: true, visitorId: true },
    });

    const ctx = contextFromRequest(req, 'admin');

    // Log WHICH fields changed, never the values. A field name is metadata; a
    // field value is customer data and belongs in the Lead row, not the stream.
    await track(
      'admin_lead_updated',
      { leadId: id, props: { fields: value === null ? ['status'] : ['status', 'value'] } },
      ctx,
    );

    const lifecycleEvent = STATUS_EVENT[status];
    if (lifecycleEvent) {
      // THE deliberate identity override. The admin is clicking, but the event
      // belongs to the buyer — otherwise every won deal would attribute to the
      // admin's own visitor id and revenue-by-source would credit the dashboard
      // operator for all revenue on the site.
      const buyerVisitorId = (await visitorIdOf(id)) ?? updated.visitorId;

      await track(
        lifecycleEvent,
        {
          leadId: id,
          overrideVisitorId: buyerVisitorId,
          overrideActor: 'customer',
          props: value === null ? {} : { value },
        },
        ctx,
      );
    }

    res.status(200).json({ ok: true, lead: { ...updated, value: updated.value ? Number(updated.value) : null } });
  } catch (err) {
    console.error('[admin/leads] update failed', err);
    res.status(500).json({ error: 'update_failed' });
  }
}
