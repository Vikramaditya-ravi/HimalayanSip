import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/db.js';
import { type ApiRequest, type ApiResponse, readJsonBody } from '../../lib/http.js';
import { requireAdmin } from '../../lib/identity.js';

/**
 * Contact directory CRUD. The admin surface for customers and suppliers.
 *
 * A business CRUD endpoint like api/admin/leads.ts, not an analytics one — it
 * reads and writes the Contact table directly and emits no events. This directory
 * is outside the analytics product: lib/metrics.ts never touches it.
 */

export const config = { runtime: 'nodejs' };

const TYPES = new Set(['customer', 'bottle_supplier', 'water_plant']);
const STATUSES = new Set(['active', 'inactive']);

/** Serialize a Contact row for the wire — Decimal `rate` becomes a plain number. */
function toWire(c: { rate: Prisma.Decimal | null } & Record<string, unknown>) {
  return { ...c, rate: c.rate == null ? null : Number(c.rate) };
}

function firstQuery(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

/** Optional string field: trims, and treats empty string as an explicit null. */
function optionalStr(value: unknown): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

/**
 * Coerce a rate. Returns undefined when the field is absent (leave unchanged on
 * PATCH), null when explicitly cleared, a Decimal when a valid non-negative
 * number is given, and the symbol `INVALID` when the value cannot be used.
 */
const INVALID = Symbol('invalid');
function parseRate(value: unknown): Prisma.Decimal | null | undefined | typeof INVALID {
  if (value === undefined) return undefined;
  if (value === null || value === '') return null;
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return INVALID;
  return new Prisma.Decimal(n);
}

export default async function handler(req: ApiRequest, res: ApiResponse): Promise<void> {
  if (!requireAdmin(req)) {
    res.status(401).json({ error: 'unauthorized' });
    return;
  }

  // ---- List ----
  if (req.method === 'GET') {
    const typeFilter = firstQuery(req.query.type);
    const where = typeFilter && TYPES.has(typeFilter) ? { type: typeFilter as never } : {};
    const contacts = await prisma.contact.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 500,
    });
    res.status(200).json({ data: contacts.map(toWire) });
    return;
  }

  // ---- Create ----
  if (req.method === 'POST') {
    const body = readJsonBody(req) as Record<string, unknown> | null;
    const type = typeof body?.type === 'string' ? body.type : null;
    const name = typeof body?.name === 'string' ? body.name.trim() : '';

    if (!type || !TYPES.has(type) || !name) {
      res.status(400).json({ error: 'invalid_request' });
      return;
    }

    const rate = parseRate(body?.rate);
    if (rate === INVALID) {
      res.status(400).json({ error: 'invalid_rate' });
      return;
    }

    const status =
      typeof body?.status === 'string' && STATUSES.has(body.status) ? body.status : 'active';

    try {
      const contact = await prisma.contact.create({
        data: {
          type: type as never,
          name,
          company: optionalStr(body?.company) ?? null,
          contactPerson: optionalStr(body?.contactPerson) ?? null,
          phone: optionalStr(body?.phone) ?? null,
          email: optionalStr(body?.email) ?? null,
          location: optionalStr(body?.location) ?? null,
          address: optionalStr(body?.address) ?? null,
          supplyQuantity: optionalStr(body?.supplyQuantity) ?? null,
          unit: optionalStr(body?.unit) ?? null,
          rate: rate ?? null,
          notes: optionalStr(body?.notes) ?? null,
          status: status as never,
        },
      });
      res.status(200).json({ ok: true, contact: toWire(contact) });
    } catch (err) {
      console.error('[admin/contacts] create failed', err);
      res.status(500).json({ error: 'create_failed' });
    }
    return;
  }

  // ---- Update ----
  if (req.method === 'PATCH') {
    const body = readJsonBody(req) as Record<string, unknown> | null;
    const id = typeof body?.id === 'string' ? body.id : null;
    if (!id) {
      res.status(400).json({ error: 'invalid_request' });
      return;
    }

    if (body?.type !== undefined && !(typeof body.type === 'string' && TYPES.has(body.type))) {
      res.status(400).json({ error: 'invalid_type' });
      return;
    }
    if (body?.status !== undefined && !(typeof body.status === 'string' && STATUSES.has(body.status))) {
      res.status(400).json({ error: 'invalid_status' });
      return;
    }
    if (body?.name !== undefined && (typeof body.name !== 'string' || body.name.trim() === '')) {
      res.status(400).json({ error: 'invalid_request' });
      return;
    }

    const rate = parseRate(body?.rate);
    if (rate === INVALID) {
      res.status(400).json({ error: 'invalid_rate' });
      return;
    }

    // Only assign fields that were actually present in the body.
    const data: Prisma.ContactUpdateInput = {};
    if (typeof body?.type === 'string') data.type = body.type as never;
    if (typeof body?.name === 'string') data.name = body.name.trim();
    if (typeof body?.status === 'string') data.status = body.status as never;
    for (const key of [
      'company',
      'contactPerson',
      'phone',
      'email',
      'location',
      'address',
      'supplyQuantity',
      'unit',
      'notes',
    ] as const) {
      const next = optionalStr(body?.[key]);
      if (next !== undefined) (data as Record<string, unknown>)[key] = next;
    }
    if (rate !== undefined) data.rate = rate;

    try {
      const contact = await prisma.contact.update({ where: { id }, data });
      res.status(200).json({ ok: true, contact: toWire(contact) });
    } catch (err) {
      console.error('[admin/contacts] update failed', err);
      res.status(500).json({ error: 'update_failed' });
    }
    return;
  }

  // ---- Delete ----
  if (req.method === 'DELETE') {
    const body = readJsonBody(req) as { id?: unknown } | null;
    const id =
      (typeof body?.id === 'string' ? body.id : null) ?? firstQuery(req.query.id);
    if (!id) {
      res.status(400).json({ error: 'invalid_request' });
      return;
    }
    try {
      await prisma.contact.delete({ where: { id } });
      res.status(200).json({ ok: true });
    } catch (err) {
      console.error('[admin/contacts] delete failed', err);
      res.status(500).json({ error: 'delete_failed' });
    }
    return;
  }

  res.status(405).json({ error: 'method_not_allowed' });
}
