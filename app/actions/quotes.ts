"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  composeEightDigitQuoteNumber,
  getNextMaritimeQuoteSerial,
  type PlatformQuoteChargeItem,
  type PlatformQuoteOtherItem,
} from "@/lib/quotes";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient as createServerCookieClient } from "@/lib/supabase/server";

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
  goodsDeclaredValue: number;
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

export async function createMaritimeQuote(formData: FormData): Promise<{
  ok: true;
  id: string;
  quoteNumber: string;
  eightDigit: string;
}> {
  const authClient = await createServerCookieClient();
  const {
    data: { user },
    error: authError,
  } = await authClient.auth.getUser();

  if (authError || !user) {
    throw new Error("No se autenticó al usuario.");
  }

  const supabase = createAdminClient();

  const stateCode =
    (readOptionalString(formData, "quote_number_state") || "PUE").slice(0, 3).toUpperCase() ||
    "PUE";
  const yearTwo = (readOptionalString(formData, "quote_number_year") || "")
    .replace(/\D/g, "")
    .slice(0, 2)
    .padEnd(2, "0");
  const yearForSerial = yearTwo
    ? 2000 + Number(yearTwo)
    : new Date().getFullYear();
  const { nextEightDigit, nextSerial } = await getNextMaritimeQuoteSerial({
    stateCode,
    yearTwoDigits: yearTwo || String(new Date().getFullYear()).slice(-2),
    supabaseClient: supabase,
  });
  const finalQuoteNumber = `${stateCode}${yearTwo || String(yearForSerial).slice(-2)}-${nextEightDigit}`;

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
    quote_number: finalQuoteNumber,
    document_currencies: parseCurrencies(readString(formData, "quote_currencies")),
    status: "draft",
    created_by: user.id,
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
        goodsDeclaredValue: Math.max(0, toNumber(fields.goods_declared_value ?? "0", 0)),
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
      const base =
        row.valueType === "monto"
          ? row.value
          : (row.goodsDeclaredValue * Math.max(0, row.value)) / 100;
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
    throw new Error(quoteError?.message || "No se pudo guardar la cotización.");
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
      const base =
        row.valueType === "monto"
          ? row.value
          : (row.goodsDeclaredValue * Math.max(0, row.value)) / 100;
      const vat = row.vatMode === "mas_iva" ? base * IVA_RATE : 0;
      const total = base + vat;

      return {
        quote_id: quoteId,
        name: row.name,
        goods_declared_value: row.goodsDeclaredValue,
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
  return {
    ok: true as const,
    id: quoteId,
    quoteNumber: finalQuoteNumber,
    eightDigit: nextEightDigit,
  };
}

export type EditableQuoteDraft = {
  id: string | null;
  issuer: {
    tradeName: string;
    legalName: string;
    rfc: string;
    taxAddress: string;
    phone: string;
    website: string;
    sellerName: string;
    contactEmail: string;
  };
  client: {
    companyName: string;
    contactName: string;
  };
  control: {
    issueDate: string;
    validUntil: string;
    stateCode: string;
    yearTwo: string;
    eightDigit: string;
    currencies: string;
  };
  route: {
    originPort: string;
    destinationPort: string;
    incoterm: string;
    shippingLine: string;
    freeDays: string;
    transitTime: string;
  };
  chargeItems: Array<{
    conceptName: string;
    equipmentType: string;
    quantity: string;
    price: string;
    vatMode: "sin_iva" | "mas_iva";
    currency: "USD" | "MXN" | "EUR";
    notes: string;
  }>;
  otherItems: Array<{
    name: string;
    goodsDeclaredValue: string;
    valueType: "monto" | "porcentaje";
    value: string;
    vatMode: "sin_iva" | "mas_iva";
    notes: string;
  }>;
};

export async function getEditableQuote(id: string): Promise<EditableQuoteDraft | null> {
  const authClient = await createServerCookieClient();
  const {
    data: { user },
    error: authError,
  } = await authClient.auth.getUser();

  if (authError || !user) {
    redirect("/");
  }

  const supabase = createAdminClient();

  const { data: profileRow, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    return null;
  }

  const isAdmin = (profileRow as { role?: string | null } | null)?.role === "Admin";

  const { data: quoteRow, error: quoteError } = await supabase
    .from("maritime_quotes")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (quoteError || !quoteRow) {
    return null;
  }

  const quote = quoteRow as Record<string, unknown>;
  const createdBy = typeof quote.created_by === "string" ? quote.created_by : null;
  if (!isAdmin && createdBy !== user.id) {
    return null;
  }

  const { data: chargeRowsRaw, error: chargeError } = await supabase
    .from("maritime_quote_charge_items")
    .select("*")
    .eq("quote_id", id)
    .order("order_index", { ascending: true });

  const { data: otherRowsRaw, error: otherError } = await supabase
    .from("maritime_quote_other_items")
    .select("*")
    .eq("quote_id", id)
    .order("order_index", { ascending: true });

  if (chargeError || otherError) {
    return null;
  }

  const quoteNumber = typeof quote.quote_number === "string" ? quote.quote_number : "";
  let stateCode = "PUE";
  let yearTwo = String(new Date().getFullYear()).slice(-2);
  let eightDigit = composeEightDigitQuoteNumber(1, new Date().getFullYear());

  const parseMatch = /^([A-Z]{3})(\d{2})-(\d{8})$/.exec(quoteNumber);
  if (parseMatch) {
    stateCode = parseMatch[1] ?? stateCode;
    yearTwo = parseMatch[2] ?? yearTwo;
    eightDigit = parseMatch[3] ?? eightDigit;
  }

  function takeString(...values: unknown[]) {
    for (const value of values) {
      if (typeof value === "string") return value;
    }
    return "";
  }

  function takeNullableString(...values: unknown[]) {
    for (const value of values) {
      if (typeof value === "string" && value.trim().length > 0) return value;
    }
    return "";
  }

  const currencies = Array.isArray(quote.document_currencies)
    ? (quote.document_currencies as unknown[]).filter((token): token is string => typeof token === "string").join(" / ")
    : "";

  const freeDays =
    typeof quote.route_free_days === "number" ? String(Math.trunc(quote.route_free_days)) :
    typeof quote.route_free_days === "string" ? quote.route_free_days :
    "";

  const chargeItems = (chargeRowsRaw ?? []).map((rowRaw) => {
    const row = rowRaw as Record<string, unknown>;
    return {
      conceptName: takeString(row.concept_name),
      equipmentType: takeNullableString(row.equipment_type),
      quantity: typeof row.quantity === "number" ? String(row.quantity) : takeString(row.quantity),
      price: typeof row.unit_price === "number" ? String(row.unit_price) : takeString(row.unit_price),
      vatMode: (row.vat_mode === "mas_iva" ? "mas_iva" : "sin_iva") as "sin_iva" | "mas_iva",
      currency: (["USD", "MXN", "EUR"].includes(String(row.currency ?? ""))
        ? String(row.currency)
        : "USD") as "USD" | "MXN" | "EUR",
      notes: takeNullableString(row.notes),
    };
  });

  const otherItems = (otherRowsRaw ?? []).map((rowRaw) => {
    const row = rowRaw as Record<string, unknown>;
    return {
      name: takeString(row.name),
      goodsDeclaredValue:
        typeof row.goods_declared_value === "number" ? String(row.goods_declared_value) :
        takeString(row.goods_declared_value),
      valueType: (row.value_type === "porcentaje" ? "porcentaje" : "monto") as "monto" | "porcentaje",
      value: typeof row.value === "number" ? String(row.value) : takeString(row.value),
      vatMode: (row.vat_mode === "mas_iva" ? "mas_iva" : "sin_iva") as "sin_iva" | "mas_iva",
      notes: takeNullableString(row.notes),
    };
  });

  return {
    id,
    issuer: {
      tradeName: takeString(quote.issuer_trade_name),
      legalName: takeString(quote.issuer_legal_name),
      rfc: takeString(quote.issuer_rfc),
      taxAddress: takeString(quote.issuer_tax_address),
      phone: takeString(quote.issuer_phone),
      website: takeString(quote.issuer_website),
      sellerName: takeNullableString(quote.issuer_seller_name),
      contactEmail: takeNullableString(quote.issuer_contact_email),
    },
    client: {
      companyName: takeString(quote.client_company_name),
      contactName: takeString(quote.client_contact_name),
    },
    control: {
      issueDate: takeNullableString(quote.quote_issue_date).slice(0, 10),
      validUntil: takeNullableString(quote.quote_valid_until).slice(0, 10),
      stateCode,
      yearTwo,
      eightDigit,
      currencies,
    },
    route: {
      originPort: takeString(quote.route_origin_port),
      destinationPort: takeString(quote.route_destination_port),
      incoterm: takeString(quote.route_incoterm),
      shippingLine: takeString(quote.route_shipping_line),
      freeDays,
      transitTime: takeNullableString(quote.route_transit_time),
    },
    chargeItems: chargeItems.length ? chargeItems : [{
      conceptName: "",
      equipmentType: "",
      quantity: "1",
      price: "0",
      vatMode: "sin_iva",
      currency: "USD",
      notes: "",
    }],
    otherItems: otherItems.length ? otherItems : [{
      name: "",
      goodsDeclaredValue: "0",
      valueType: "monto",
      value: "0",
      vatMode: "sin_iva",
      notes: "",
    }],
  };
}

export async function updateMaritimeQuote(
  id: string,
  formData: FormData,
): Promise<{
  ok: true;
  id: string;
  quoteNumber: string;
  eightDigit: string;
}> {
  const authClient = await createServerCookieClient();
  const {
    data: { user },
    error: authError,
  } = await authClient.auth.getUser();

  if (authError || !user) {
    throw new Error("No se autenticó al usuario.");
  }

  const supabase = createAdminClient();

  const { data: profileRow, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    throw new Error(profileError.message || "No se pudo leer tu perfil.");
  }

  const isAdmin = (profileRow as { role?: string | null } | null)?.role === "Admin";

  const { data: currentRow, error: currentError } = await supabase
    .from("maritime_quotes")
    .select("created_by, quote_number")
    .eq("id", id)
    .maybeSingle();

  if (currentError || !currentRow) {
    throw new Error("La cotización que intentas editar no existe.");
  }

  const current = currentRow as { created_by: string | null; quote_number: string | null };
  if (!isAdmin && current.created_by !== user.id) {
    throw new Error("No tienes permisos para editar esta cotización.");
  }

  const stateCode =
    (readOptionalString(formData, "quote_number_state") || "PUE").slice(0, 3).toUpperCase() ||
    "PUE";
  const yearTwo = (readOptionalString(formData, "quote_number_year") || "")
    .replace(/\D/g, "")
    .slice(0, 2)
    .padEnd(2, "0");

  const eightDigitInput = (readOptionalString(formData, "quote_number_eight_digit") || "")
    .replace(/\D/g, "")
    .slice(0, 8);

  let finalEightDigit: string;
  let finalQuoteNumber: string;

  if (eightDigitInput.length === 8) {
    finalEightDigit = eightDigitInput;
    finalQuoteNumber = `${stateCode}${yearTwo}-${finalEightDigit}`;
    const collision = await supabase
      .from("maritime_quotes")
      .select("id")
      .eq("quote_number", finalQuoteNumber)
      .neq("id", id)
      .limit(1);
    if (collision.error || (collision.data?.length ?? 0) > 0) {
      const next = await getNextMaritimeQuoteSerial({
        stateCode,
        yearTwoDigits: yearTwo,
        supabaseClient: supabase,
      });
      finalEightDigit = next.nextEightDigit;
      finalQuoteNumber = `${stateCode}${yearTwo}-${finalEightDigit}`;
    }
  } else {
    const next = await getNextMaritimeQuoteSerial({
      stateCode,
      yearTwoDigits: yearTwo,
      supabaseClient: supabase,
    });
    finalEightDigit = next.nextEightDigit;
    finalQuoteNumber = `${stateCode}${yearTwo}-${finalEightDigit}`;
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
    quote_number: finalQuoteNumber,
    document_currencies: parseCurrencies(readString(formData, "quote_currencies")),
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
        goodsDeclaredValue: Math.max(0, toNumber(fields.goods_declared_value ?? "0", 0)),
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
      const base =
        row.valueType === "monto"
          ? row.value
          : (row.goodsDeclaredValue * Math.max(0, row.value)) / 100;
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

  const { error: updateError } = await supabase
    .from("maritime_quotes")
    .update({ ...quotePayload, totals: totalsPayload })
    .eq("id", id);

  if (updateError) {
    throw new Error(updateError.message || "No se pudo actualizar la cotización.");
  }

  await supabase.from("maritime_quote_charge_items").delete().eq("quote_id", id);
  await supabase.from("maritime_quote_other_items").delete().eq("quote_id", id);

  if (chargeRows.length > 0) {
    const chargeInsert = chargeRows.map((row) => {
      const base = row.quantity * row.unitPrice;
      const vat = row.vatMode === "mas_iva" ? base * IVA_RATE : 0;
      const total = base + vat;
      return {
        quote_id: id,
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
      const base =
        row.valueType === "monto"
          ? row.value
          : (row.goodsDeclaredValue * Math.max(0, row.value)) / 100;
      const vat = row.vatMode === "mas_iva" ? base * IVA_RATE : 0;
      const total = base + vat;
      return {
        quote_id: id,
        name: row.name,
        goods_declared_value: row.goodsDeclaredValue,
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
  revalidatePath(`/platform/edit/${id}`);
  return {
    ok: true as const,
    id,
    quoteNumber: finalQuoteNumber,
    eightDigit: finalEightDigit,
  };
}

export async function duplicateMaritimeQuote(
  sourceId: string,
): Promise<{ ok: true; id: string }> {
  const authClient = await createServerCookieClient();
  const {
    data: { user },
    error: authError,
  } = await authClient.auth.getUser();

  if (authError || !user) {
    throw new Error("No se autenticó al usuario.");
  }

  const source = await getEditableQuote(sourceId);
  if (!source) {
    throw new Error("No se encontró la cotización a duplicar.");
  }

  const supabase = createAdminClient();

  const currentYearTwo = String(new Date().getFullYear()).slice(-2);
  const { nextEightDigit, nextSerial } = await getNextMaritimeQuoteSerial({
    stateCode: source.control.stateCode || "PUE",
    yearTwoDigits: source.control.yearTwo || currentYearTwo,
    supabaseClient: supabase,
  });

  const newId = crypto.randomUUID();
  const finalQuoteNumber =
    `${source.control.stateCode || "PUE"}${source.control.yearTwo || currentYearTwo}-${nextEightDigit}`;

  const _unused_nextSerial = nextSerial;

  const _unused_eightDigit =
    /^[A-Z]{3}\d{2}-(\d{8})$/.exec(finalQuoteNumber)?.[1] ??
    composeEightDigitQuoteNumber(nextSerial, new Date().getFullYear());
  void _unused_nextSerial;
  void _unused_eightDigit;

  const currencies =
    source.control.currencies.length > 0
      ? source.control.currencies
          .toUpperCase()
          .split(/[^A-Z]+/g)
          .filter(Boolean)
      : ["USD", "MXN"];

  const quotePayload = {
    id: newId,
    issuer_trade_name: source.issuer.tradeName,
    issuer_legal_name: source.issuer.legalName,
    issuer_rfc: source.issuer.rfc,
    issuer_tax_address: source.issuer.taxAddress,
    issuer_phone: source.issuer.phone,
    issuer_website: source.issuer.website,
    issuer_seller_name: source.issuer.sellerName.length > 0 ? source.issuer.sellerName : null,
    issuer_contact_email: source.issuer.contactEmail.length > 0 ? source.issuer.contactEmail : null,
    client_company_name: source.client.companyName,
    client_contact_name: source.client.contactName,
    route_origin_port: source.route.originPort,
    route_destination_port: source.route.destinationPort,
    route_incoterm: source.route.incoterm,
    route_shipping_line: source.route.shippingLine,
    route_free_days:
      source.route.freeDays.length > 0 ? Number.parseInt(source.route.freeDays, 10) || null : null,
    route_transit_time: source.route.transitTime.length > 0 ? source.route.transitTime : null,
    quote_issue_date: source.control.issueDate.length > 0 ? source.control.issueDate : null,
    quote_valid_until: source.control.validUntil.length > 0 ? source.control.validUntil : null,
    quote_number: finalQuoteNumber,
    document_currencies: currencies,
    status: "draft",
    created_by: user.id,
    version: 1,
    totals: {
      charge: {
        base: {} as Record<string, number>,
        vat: {} as Record<string, number>,
        total: {} as Record<string, number>,
      },
      other: { baseMxn: 0, vatMxn: 0, totalMxn: 0 },
    },
  };

  const { error: insertError } = await supabase
    .from("maritime_quotes")
    .insert(quotePayload);

  if (insertError) {
    throw new Error(insertError.message || "No se pudo duplicar la cotización.");
  }

  if (source.chargeItems.length > 0) {
    const chargeInsert = source.chargeItems
      .filter((row) => row.conceptName.length > 0)
      .map((row, orderIndex) => {
        const qty = toNumber(row.quantity, 1);
        const price = toNumber(row.price, 0);
        const base = qty * price;
        const vat = row.vatMode === "mas_iva" ? base * IVA_RATE : 0;
        const total = base + vat;
        return {
          quote_id: newId,
          concept_name: row.conceptName,
          equipment_type: row.equipmentType.length > 0 ? row.equipmentType : null,
          quantity: Math.max(0, qty),
          unit_price: Math.max(0, price),
          currency: row.currency,
          vat_mode: row.vatMode,
          vat_rate: IVA_RATE,
          base_amount: base,
          vat_amount: vat,
          total_amount: total,
          notes: row.notes.length > 0 ? row.notes : null,
          order_index: orderIndex,
        };
      });
    if (chargeInsert.length > 0) {
      const err = (await supabase.from("maritime_quote_charge_items").insert(chargeInsert)).error;
      if (err) {
        throw new Error(err.message || "No se pudo duplicar los conceptos de cargo.");
      }
    }
  }

  if (source.otherItems.length > 0) {
    const otherInsert = source.otherItems
      .filter((row) => row.name.length > 0)
      .map((row, orderIndex) => {
        const declared = toNumber(row.goodsDeclaredValue, 0);
        const value = toNumber(row.value, 0);
        const base =
          row.valueType === "monto"
            ? value
            : (declared * Math.max(0, value)) / 100;
        const vat = row.vatMode === "mas_iva" ? base * IVA_RATE : 0;
        const total = base + vat;
        return {
          quote_id: newId,
          name: row.name,
          goods_declared_value: Math.max(0, declared),
          value_type: row.valueType,
          value: Math.max(0, value),
          currency: "MXN",
          vat_mode: row.vatMode,
          vat_rate: IVA_RATE,
          base_amount_mxn: base,
          vat_amount_mxn: vat,
          total_amount_mxn: total,
          notes: row.notes.length > 0 ? row.notes : null,
          order_index: orderIndex,
        };
      });
    if (otherInsert.length > 0) {
      const err = (await supabase.from("maritime_quote_other_items").insert(otherInsert)).error;
      if (err) {
        throw new Error(err.message || "No se pudo duplicar los ajustes.");
      }
    }
  }

  revalidatePath("/platform");
  revalidatePath("/platform/new");
  revalidatePath(`/platform/edit/${newId}`);
  redirect(`/platform/edit/${newId}`);
}
