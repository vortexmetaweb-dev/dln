"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

type ChargeItemInput = {
  conceptName: string;
  equipmentType: string;
  quantity: number;
  unitPrice: number;
  vatMode: "sin_iva" | "mas_iva";
  currency: "USD" | "MXN" | "EUR";
  notes: string;
  orderIndex: number;
};

type OtherItemInput = {
  name: string;
  valueType: "monto" | "porcentaje";
  value: number;
  vatMode: "sin_iva" | "mas_iva";
  notes: string;
  orderIndex: number;
};

const IVA_RATE = 0.16;

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  if (typeof value !== "string") return "";
  return value.trim();
}

function readOptionalString(formData: FormData, key: string) {
  const value = readString(formData, key);
  return value.length > 0 ? value : null;
}

function readOptionalInt(formData: FormData, key: string) {
  const raw = readString(formData, key);
  if (!raw) return null;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function readOptionalDate(formData: FormData, key: string) {
  const raw = readString(formData, key);
  return raw.length > 0 ? raw : null;
}

function parseCurrencies(raw: string) {
  const tokens = raw
    .toUpperCase()
    .split(/[^A-Z]+/g)
    .map((token) => token.trim())
    .filter(Boolean);

  const allowed = new Set(["USD", "MXN", "EUR"]);
  const unique = Array.from(new Set(tokens)).filter((token) => allowed.has(token));

  return unique.length > 0 ? unique : ["USD", "MXN"];
}

function parseIndexedObjects(formData: FormData, prefix: string) {
  const entries = Array.from(formData.entries());
  const map = new Map<number, Record<string, string>>();

  for (const [key, value] of entries) {
    if (typeof value !== "string") continue;
    if (!key.startsWith(prefix + ".")) continue;

    const rest = key.slice(prefix.length + 1);
    const [indexRaw, field] = rest.split(".", 2);
    const index = Number.parseInt(indexRaw ?? "", 10);

    if (!Number.isFinite(index) || !field) continue;

    if (!map.has(index)) {
      map.set(index, {});
    }

    map.get(index)![field] = value;
  }

  return Array.from(map.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([index, fields]) => ({ index, fields }));
}

function toNumber(raw: string, fallback = 0) {
  const normalized = raw.replace(/,/g, "").trim();
  const value = Number.parseFloat(normalized);
  return Number.isFinite(value) ? value : fallback;
}

export async function createMaritimeQuote(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/");
  }

  const quotePayload = {
    issuer_trade_name: readString(formData, "issuer_trade_name"),
    issuer_legal_name: readString(formData, "issuer_legal_name"),
    issuer_rfc: readString(formData, "issuer_rfc"),
    issuer_tax_address: readString(formData, "issuer_tax_address"),
    issuer_phone: readString(formData, "issuer_phone"),
    issuer_website: readString(formData, "issuer_website"),
    issuer_seller_name: readOptionalString(formData, "issuer_seller_name"),
    issuer_contact_email: readOptionalString(formData, "issuer_contact_email"),
    client_company_name: readString(formData, "client_company_name"),
    client_contact_name: readString(formData, "client_contact_name"),
    route_origin_port: readString(formData, "route_origin_port"),
    route_destination_port: readString(formData, "route_destination_port"),
    route_incoterm: readString(formData, "route_incoterm"),
    route_shipping_line: readString(formData, "route_shipping_line"),
    route_free_days: readOptionalInt(formData, "route_free_days"),
    route_transit_time: readOptionalString(formData, "route_transit_time"),
    quote_issue_date: readOptionalDate(formData, "quote_issue_date"),
    quote_valid_until: readOptionalDate(formData, "quote_valid_until"),
    quote_number: readOptionalString(formData, "quote_number"),
    document_currencies: parseCurrencies(readString(formData, "quote_currencies")),
    status: "draft",
  };

  const chargeRows = parseIndexedObjects(formData, "charge_concepts")
    .map(({ index, fields }): ChargeItemInput | null => {
      const conceptName = (fields.concept_name ?? "").trim();
      if (!conceptName) return null;

      const vatMode = ((fields.vat_mode ?? "sin_iva").trim() as ChargeItemInput["vatMode"]) || "sin_iva";
      const currency = ((fields.currency ?? "USD").trim() as ChargeItemInput["currency"]) || "USD";

      return {
        conceptName,
        equipmentType: (fields.equipment_type ?? "").trim(),
        quantity: Math.max(0, toNumber(fields.quantity ?? "1", 1)),
        unitPrice: Math.max(0, toNumber(fields.price ?? "0", 0)),
        vatMode: vatMode === "mas_iva" ? "mas_iva" : "sin_iva",
        currency: currency === "MXN" || currency === "EUR" ? currency : "USD",
        notes: (fields.notes ?? "").trim(),
        orderIndex: index,
      };
    })
    .filter((row): row is ChargeItemInput => row !== null);

  const otherRows = parseIndexedObjects(formData, "other_concepts")
    .map(({ index, fields }): OtherItemInput | null => {
      const name = (fields.name ?? "").trim();
      if (!name) return null;

      const valueType =
        ((fields.value_type ?? "monto").trim() as OtherItemInput["valueType"]) || "monto";
      const vatMode = ((fields.vat_mode ?? "sin_iva").trim() as OtherItemInput["vatMode"]) || "sin_iva";

      return {
        name,
        valueType: valueType === "porcentaje" ? "porcentaje" : "monto",
        value: Math.max(0, toNumber(fields.value ?? "0", 0)),
        vatMode: vatMode === "mas_iva" ? "mas_iva" : "sin_iva",
        notes: (fields.notes ?? "").trim(),
        orderIndex: index,
      };
    })
    .filter((row): row is OtherItemInput => row !== null);

  const chargeTotals = chargeRows.reduce(
    (acc, row) => {
      const base = row.quantity * row.unitPrice;
      const vat = row.vatMode === "mas_iva" ? base * IVA_RATE : 0;
      const total = base + vat;
      const key = row.currency;

      acc.base[key] = (acc.base[key] ?? 0) + base;
      acc.vat[key] = (acc.vat[key] ?? 0) + vat;
      acc.total[key] = (acc.total[key] ?? 0) + total;

      return acc;
    },
    {
      base: {} as Record<string, number>,
      vat: {} as Record<string, number>,
      total: {} as Record<string, number>,
    },
  );

  const otherTotals = otherRows.reduce(
    (acc, row) => {
      const base = row.valueType === "monto" ? row.value : 0;
      const vat = row.vatMode === "mas_iva" ? base * IVA_RATE : 0;
      acc.baseMxn += base;
      acc.vatMxn += vat;
      acc.totalMxn += base + vat;
      return acc;
    },
    { baseMxn: 0, vatMxn: 0, totalMxn: 0 },
  );

  const totalsPayload = {
    charge: chargeTotals,
    other: otherTotals,
  };

  const { data: insertedQuote, error: quoteError } = await supabase
    .from("maritime_quotes")
    .insert({ ...quotePayload, totals: totalsPayload })
    .select("id")
    .single();

  if (quoteError || !insertedQuote) {
    redirect("/platform/new");
  }

  const quoteId = insertedQuote.id as string;

  if (chargeRows.length > 0) {
    const chargeInsert = chargeRows.map((row) => {
      const base = row.quantity * row.unitPrice;
      const vat = row.vatMode === "mas_iva" ? base * IVA_RATE : 0;
      const total = base + vat;

      return {
        quote_id: quoteId,
        concept_name: row.conceptName,
        equipment_type: row.equipmentType || null,
        quantity: row.quantity,
        unit_price: row.unitPrice,
        currency: row.currency,
        vat_mode: row.vatMode,
        vat_rate: IVA_RATE,
        base_amount: base,
        vat_amount: vat,
        total_amount: total,
        notes: row.notes || null,
        order_index: row.orderIndex,
      };
    });

    await supabase.from("maritime_quote_charge_items").insert(chargeInsert);
  }

  if (otherRows.length > 0) {
    const otherInsert = otherRows.map((row) => {
      const base = row.valueType === "monto" ? row.value : 0;
      const vat = row.vatMode === "mas_iva" ? base * IVA_RATE : 0;
      const total = base + vat;

      return {
        quote_id: quoteId,
        name: row.name,
        value_type: row.valueType,
        value: row.value,
        currency: "MXN",
        vat_mode: row.vatMode,
        vat_rate: IVA_RATE,
        base_amount_mxn: base,
        vat_amount_mxn: vat,
        total_amount_mxn: total,
        notes: row.notes || null,
        order_index: row.orderIndex,
      };
    });

    await supabase.from("maritime_quote_other_items").insert(otherInsert);
  }

  revalidatePath("/platform");
  revalidatePath("/platform/new");
  redirect("/platform");
}
