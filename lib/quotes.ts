import { createClient } from "@/lib/supabase/server";

type QuoteRecord = Record<string, unknown>;
type QuoteItemRecord = Record<string, unknown>;

export type PlatformQuote = {
  id: string;
  quoteNumber: string;
  clientCompanyName: string;
  clientContactName: string;
  routeOriginPort: string;
  routeDestinationPort: string;
  routeShippingLine: string;
  status: string;
  issueDateLabel: string;
  validUntilLabel: string;
  createdAtLabel: string;
  currenciesLabel: string;
  totalsSummary: string;
};

export type PlatformQuoteChargeItem = {
  id: string;
  conceptName: string;
  equipmentType: string;
  quantity: number;
  unitPrice: number;
  currency: "USD" | "MXN" | "EUR";
  vatMode: "sin_iva" | "mas_iva";
  vatRate: number | null;
  baseAmount: number;
  vatAmount: number;
  totalAmount: number;
  notes: string;
};

export type PlatformQuoteOtherItem = {
  id: string;
  name: string;
  goodsDeclaredValue: number;
  valueType: "monto" | "porcentaje";
  value: number;
  currency: "MXN";
  vatMode: "sin_iva" | "mas_iva";
  vatRate: number | null;
  baseAmountMxn: number;
  vatAmountMxn: number;
  totalAmountMxn: number;
  notes: string;
};

export type PlatformQuoteDetail = {
  id: string;
  quoteNumber: string;
  issuerTradeName: string;
  issuerLegalName: string;
  issuerRfc: string;
  issuerTaxAddress: string;
  issuerPhone: string;
  issuerWebsite: string;
  issuerSellerName: string;
  issuerContactEmail: string;
  clientCompanyName: string;
  clientContactName: string;
  routeOriginPort: string;
  routeDestinationPort: string;
  routeIncoterm: string;
  routeShippingLine: string;
  routeFreeDays: number | null;
  routeTransitTime: string;
  quoteIssueDateLabel: string;
  quoteValidUntilLabel: string;
  documentCurrencies: string[];
  status: string;
  createdAtLabel: string;
  totals: Record<string, unknown>;
  chargeItems: PlatformQuoteChargeItem[];
  otherItems: PlatformQuoteOtherItem[];
};

function pickFirstString(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }

  return null;
}

function pickNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function formatDateLabel(value: unknown) {
  if (typeof value !== "string" || value.trim().length === 0) {
    return "Sin fecha";
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Sin fecha";
  }

  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsedDate);
}

function formatMoney(value: number, currency: string) {
  try {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${currency} ${value.toFixed(2)}`;
  }
}

function formatTotalsSummary(totals: unknown) {
  if (!totals || typeof totals !== "object") {
    return "Sin totales";
  }

  const totalObject = (totals as { charge?: { total?: Record<string, number> } }).charge?.total;

  if (!totalObject || typeof totalObject !== "object") {
    return "Sin totales";
  }

  const entries = Object.entries(totalObject)
    .filter(([, value]) => typeof value === "number" && Number.isFinite(value))
    .map(([currency, value]) => formatMoney(value as number, currency));

  return entries.length > 0 ? entries.join(" · ") : "Sin totales";
}

function mapQuote(record: QuoteRecord): PlatformQuote {
  const id = pickFirstString(record.id) ?? "sin-id";
  const quoteNumber = pickFirstString(record.quote_number) ?? "Sin folio";
  const documentCurrencies = Array.isArray(record.document_currencies)
    ? record.document_currencies.filter((value): value is string => typeof value === "string")
    : [];

  return {
    id,
    quoteNumber,
    clientCompanyName: pickFirstString(record.client_company_name) ?? "Sin empresa",
    clientContactName: pickFirstString(record.client_contact_name) ?? "Sin contacto",
    routeOriginPort: pickFirstString(record.route_origin_port) ?? "Sin origen",
    routeDestinationPort: pickFirstString(record.route_destination_port) ?? "Sin destino",
    routeShippingLine: pickFirstString(record.route_shipping_line) ?? "Sin naviera",
    status: pickFirstString(record.status) ?? "draft",
    issueDateLabel: formatDateLabel(record.quote_issue_date),
    validUntilLabel: formatDateLabel(record.quote_valid_until),
    createdAtLabel: formatDateLabel(record.created_at),
    currenciesLabel: documentCurrencies.length > 0 ? documentCurrencies.join(" / ") : "USD / MXN",
    totalsSummary: formatTotalsSummary(record.totals),
  };
}

function mapChargeItem(record: QuoteItemRecord): PlatformQuoteChargeItem {
  return {
    id: pickFirstString(record.id) ?? crypto.randomUUID(),
    conceptName: pickFirstString(record.concept_name) ?? "Sin concepto",
    equipmentType: pickFirstString(record.equipment_type) ?? "",
    quantity: pickNumber(record.quantity),
    unitPrice: pickNumber(record.unit_price),
    currency:
      pickFirstString(record.currency) === "MXN"
        ? "MXN"
        : pickFirstString(record.currency) === "EUR"
          ? "EUR"
          : "USD",
    vatMode: pickFirstString(record.vat_mode) === "mas_iva" ? "mas_iva" : "sin_iva",
    vatRate:
      typeof record.vat_rate === "number" && Number.isFinite(record.vat_rate)
        ? (record.vat_rate as number)
        : null,
    baseAmount: pickNumber(record.base_amount),
    vatAmount: pickNumber(record.vat_amount),
    totalAmount: pickNumber(record.total_amount),
    notes: pickFirstString(record.notes) ?? "",
  };
}

function mapOtherItem(record: QuoteItemRecord): PlatformQuoteOtherItem {
  return {
    id: pickFirstString(record.id) ?? crypto.randomUUID(),
    name: pickFirstString(record.name) ?? "Sin nombre",
    goodsDeclaredValue: pickNumber(record.goods_declared_value),
    valueType: pickFirstString(record.value_type) === "porcentaje" ? "porcentaje" : "monto",
    value: pickNumber(record.value),
    currency: "MXN",
    vatMode: pickFirstString(record.vat_mode) === "mas_iva" ? "mas_iva" : "sin_iva",
    vatRate:
      typeof record.vat_rate === "number" && Number.isFinite(record.vat_rate)
        ? (record.vat_rate as number)
        : null,
    baseAmountMxn: pickNumber(record.base_amount_mxn),
    vatAmountMxn: pickNumber(record.vat_amount_mxn),
    totalAmountMxn: pickNumber(record.total_amount_mxn),
    notes: pickFirstString(record.notes) ?? "",
  };
}

export async function getPlatformQuotes() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("maritime_quotes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return {
      quotes: [] as PlatformQuote[],
      errorMessage: "No se pudieron cargar las cotizaciones.",
    };
  }

  return {
    quotes: (data ?? []).map((entry) => mapQuote(entry as QuoteRecord)),
    errorMessage: undefined,
  };
}

export async function getPlatformQuoteDetail(quoteId: string): Promise<PlatformQuoteDetail | null> {
  const supabase = await createClient();

  const { data: quote, error: quoteError } = await supabase
    .from("maritime_quotes")
    .select("*")
    .eq("id", quoteId)
    .maybeSingle();

  if (quoteError || !quote) {
    return null;
  }

  const { data: chargeItems } = await supabase
    .from("maritime_quote_charge_items")
    .select("*")
    .eq("quote_id", quoteId)
    .order("order_index", { ascending: true });

  const { data: otherItems } = await supabase
    .from("maritime_quote_other_items")
    .select("*")
    .eq("quote_id", quoteId)
    .order("order_index", { ascending: true });

  const documentCurrencies = Array.isArray((quote as QuoteRecord).document_currencies)
    ? ((quote as QuoteRecord).document_currencies as unknown[]).filter(
        (value): value is string => typeof value === "string",
      )
    : [];

  return {
    id: pickFirstString((quote as QuoteRecord).id) ?? quoteId,
    quoteNumber: pickFirstString((quote as QuoteRecord).quote_number) ?? "Sin folio",
    issuerTradeName: pickFirstString((quote as QuoteRecord).issuer_trade_name) ?? "",
    issuerLegalName: pickFirstString((quote as QuoteRecord).issuer_legal_name) ?? "",
    issuerRfc: pickFirstString((quote as QuoteRecord).issuer_rfc) ?? "",
    issuerTaxAddress: pickFirstString((quote as QuoteRecord).issuer_tax_address) ?? "",
    issuerPhone: pickFirstString((quote as QuoteRecord).issuer_phone) ?? "",
    issuerWebsite: pickFirstString((quote as QuoteRecord).issuer_website) ?? "",
    issuerSellerName: pickFirstString((quote as QuoteRecord).issuer_seller_name) ?? "",
    issuerContactEmail: pickFirstString((quote as QuoteRecord).issuer_contact_email) ?? "",
    clientCompanyName: pickFirstString((quote as QuoteRecord).client_company_name) ?? "",
    clientContactName: pickFirstString((quote as QuoteRecord).client_contact_name) ?? "",
    routeOriginPort: pickFirstString((quote as QuoteRecord).route_origin_port) ?? "",
    routeDestinationPort: pickFirstString((quote as QuoteRecord).route_destination_port) ?? "",
    routeIncoterm: pickFirstString((quote as QuoteRecord).route_incoterm) ?? "",
    routeShippingLine: pickFirstString((quote as QuoteRecord).route_shipping_line) ?? "",
    routeFreeDays:
      typeof (quote as QuoteRecord).route_free_days === "number"
        ? ((quote as QuoteRecord).route_free_days as number)
        : null,
    routeTransitTime: pickFirstString((quote as QuoteRecord).route_transit_time) ?? "",
    quoteIssueDateLabel: formatDateLabel((quote as QuoteRecord).quote_issue_date),
    quoteValidUntilLabel: formatDateLabel((quote as QuoteRecord).quote_valid_until),
    documentCurrencies,
    status: pickFirstString((quote as QuoteRecord).status) ?? "draft",
    createdAtLabel: formatDateLabel((quote as QuoteRecord).created_at),
    totals:
      typeof (quote as QuoteRecord).totals === "object" && (quote as QuoteRecord).totals !== null
        ? ((quote as QuoteRecord).totals as Record<string, unknown>)
        : {},
    chargeItems: (chargeItems ?? []).map((entry) => mapChargeItem(entry as QuoteItemRecord)),
    otherItems: (otherItems ?? []).map((entry) => mapOtherItem(entry as QuoteItemRecord)),
  };
}

export function composeEightDigitQuoteNumber(serialFour: number, fullYear: number) {
  const serial = Math.max(0, Math.floor(serialFour));
  const yearFull = String(fullYear).slice(-4).padStart(4, "0");
  const serialPadded = String(serial).padStart(4, "0").slice(-4);
  return `${serialPadded}${yearFull}`;
}

export function composeQuoteNumber(
  stateCode: string,
  yearTwoDigits: string,
  eightDigitPart: string,
) {
  const safeState = String(stateCode || "").slice(0, 3).toUpperCase();
  const safeYear = String(yearTwoDigits || "").replace(/\D/g, "").slice(0, 2).padEnd(2, "0");
  const safeEight = String(eightDigitPart || "").replace(/\D/g, "").slice(0, 8).padStart(8, "0");
  return `${safeState}${safeYear}-${safeEight}`;
}

export function splitQuoteNumberEightDigit(eightDigitPart: string): {
  serial: number | null;
  fullYear: number | null;
} {
  const clean = String(eightDigitPart || "").replace(/\D/g, "");
  if (clean.length !== 8) {
    return { serial: null, fullYear: null };
  }
  const serialPart = clean.slice(0, 4);
  const yearPart = clean.slice(4, 8);
  const serial = Number.parseInt(serialPart, 10);
  const fullYear = Number.parseInt(yearPart, 10);
  return {
    serial: Number.isFinite(serial) ? serial : null,
    fullYear: Number.isFinite(fullYear) ? fullYear : null,
  };
}

export async function getNextMaritimeQuoteSerial(params: {
  stateCode: string;
  yearTwoDigits: string;
  supabaseClient?: ReturnType<typeof createClient> extends Promise<infer T> ? T : never;
}) {
  const supabase = params.supabaseClient ?? (await createClient());
  const safeState = String(params.stateCode || "").slice(0, 3).toUpperCase();
  const safeYear = String(params.yearTwoDigits || "")
    .replace(/\D/g, "")
    .slice(0, 2)
    .padEnd(2, "0");
  const prefix = `${safeState}${safeYear}-`;

  const { data } = await supabase
    .from("maritime_quotes")
    .select("quote_number")
    .not("quote_number", "is", null)
    .like("quote_number", `${prefix}%`)
    .order("quote_number", { ascending: false })
    .limit(50);

  if (!data || data.length === 0) {
    return {
      prefix,
      nextSerial: 1,
      nextEightDigit: composeEightDigitQuoteNumber(1, 2000 + Number(safeYear)),
    };
  }

  let maxSerial = 0;
  let yearFromDb: number | null = null;

  for (const row of data) {
    const raw = (row as { quote_number?: string | null }).quote_number;
    if (!raw || !raw.startsWith(prefix)) continue;
    const eight = raw.slice(prefix.length);
    const { serial, fullYear } = splitQuoteNumberEightDigit(eight);
    if (serial === null || fullYear === null) continue;
    yearFromDb = fullYear;
    if (serial > maxSerial) {
      maxSerial = serial;
    }
  }

  const fallbackFullYear = 2000 + Number(safeYear);
  const nextSerial = maxSerial >= 0 ? maxSerial + 1 : 1;
  return {
    prefix,
    nextSerial,
    nextEightDigit: composeEightDigitQuoteNumber(
      nextSerial,
      yearFromDb ?? fallbackFullYear,
    ),
  };
}

