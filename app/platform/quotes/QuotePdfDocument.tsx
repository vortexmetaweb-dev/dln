import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
  Image,
} from "@react-pdf/renderer";
import fs from "node:fs";
import path from "node:path";

import type { PlatformQuoteDetail } from "@/lib/quotes";

const LOGO_ABSOLUTE_PATH = path.join(
  process.cwd(),
  "public",
  "WhatsApp_Image_2026-07-16_at_3.23.02_PM-removebg-preview.png",
);

function loadLogoDataUrl(): string {
  try {
    const buffer = fs.readFileSync(LOGO_ABSOLUTE_PATH);
    return `data:image/png;base64,${buffer.toString("base64")}`;
  } catch (err) {
    console.error("[QuotePdfDocument] No se pudo cargar el logo DLN:", err);
    return "";
  }
}

const LOGO_DATA_URL = loadLogoDataUrl();

const DlnColors = {
  navy: "#0B2A6B",
  navyDark: "#061B4A",

  headerBg: "#708090",

  navySoft: "#E8EEFB",
  navyInk: "#0C1B46",
  blue: "#1D4ED8",
  blueSoft: "#E0E9FF",
  orange: "#F07A36",
  orangeDeep: "#D76A2A",
  orangeSoft: "#FDE7D8",
  ink: "#0B1220",
  muted: "#475569",
  soft: "#64748B",
  line: "#DCE4F1",
  surface: "#FFFFFF",
  surfaceAlt: "#F7F9FD",
  surfaceMuted: "#FBFCFE",
  success: "#0F766E",
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 18,
    paddingHorizontal: 32,
    paddingBottom: 24,

    fontSize: 10,
    fontFamily: "Helvetica",
    color: DlnColors.ink,
    backgroundColor: DlnColors.surface,
  },
  topRibbon: {
    height: 9,
    backgroundColor: DlnColors.orange,

    marginTop: -18,
    marginHorizontal: -32,
  },
  headerWrap: {
    marginHorizontal: -32,

    paddingHorizontal: 30,
    paddingTop: 22,
    paddingBottom: 18,

    backgroundColor: DlnColors.headerBg,
    color: "#FFFFFF",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 20,
  },
  headerBrand: {
    flex: 1.65,
  },
  brandMark: {
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 8,
  },
  brandLogo: {
    width: 210,
    height: 76,
    objectFit: "contain",
  },
  brandTitles: {
    flexDirection: "column",
    gap: 2,
  },
  brandNameFallback: {
    fontSize: 21,
    fontWeight: 800,
    color: "#FFFFFF",
    letterSpacing: 0.2,
  },
  brandTagline: {
    fontSize: 8.5,
    color: "#CFDBF3",
    letterSpacing: 1,
    textTransform: "uppercase",
    paddingLeft: 2,
  },
  issuerBlock: {
    marginTop: 12,
    flexDirection: "row",
    gap: 18,
  },
  issuerCol: {
    flex: 1,
    gap: 4,
  },
  issuerLabel: {
    fontSize: 7.5,
    color: "#A9BCE3",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  issuerValue: {
    fontSize: 9,
    color: "#EDF1FB",
    lineHeight: 1.4,
  },
  issuerValueStrong: {
    fontWeight: 700,
    color: "#FFFFFF",
  },
  headerMeta: {
    width: 246,
    backgroundColor: DlnColors.navyDark,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#16347C",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  metaLabel: {
    fontSize: 7.5,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: "#9FB3DB",
    marginBottom: 5,
  },
  quoteNumber: {
    fontSize: 16,
    fontWeight: 800,
    color: "#FFFFFF",
    letterSpacing: 0.2,
  },
  quoteKind: {
    marginTop: 4,
    fontSize: 8.5,
    color: "#D6E0F5",
  },
  metaBadge: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: DlnColors.orange,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 7.5,
    fontWeight: 800,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  metaCurrencies: {
    fontSize: 8,
    color: "#D6E0F5",
    textAlign: "right",
  },
  smallMeta: {
    marginTop: 12,
    gap: 5,
  },
  smallMetaLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    alignItems: "flex-start",
  },
  smallMetaKey: {
    fontSize: 7.5,
    color: "#A6B7DE",
  },
  smallMetaValue: {
    fontSize: 8.5,
    color: "#EDF1FB",
    fontWeight: 600,
    textAlign: "right",
    flex: 1,
  },
  accentBar: {
    height: 4,
    backgroundColor: DlnColors.orange,

    marginHorizontal: -32,
  },
  body: {
    paddingTop: 18,
  },
  summaryStrip: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    minWidth: 128,
    borderWidth: 1,
    borderColor: DlnColors.line,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: DlnColors.surfaceAlt,
  },
  summaryCardNavy: {
    backgroundColor: DlnColors.navy,
    borderColor: DlnColors.navy,
  },
  summaryCardOrange: {
    backgroundColor: DlnColors.orangeSoft,
    borderColor: "#F6C3A0",
  },
  summaryCardMuted: {
    backgroundColor: DlnColors.surfaceMuted,
  },
  summaryLabel: {
    fontSize: 7.2,
    letterSpacing: 0.85,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  summaryLabelLight: {
    color: "#B9C9EE",
  },
  summaryLabelOrange: {
    color: "#A15528",
  },
  summaryLabelDefault: {
    color: DlnColors.muted,
  },
  summaryValue: {
    fontSize: 10.5,
    fontWeight: 800,
    lineHeight: 1.22,
  },
  summaryValueNavy: {
    color: "#FFFFFF",
  },
  summaryValueOrange: {
    color: "#8A3B14",
  },
  summaryValueDefault: {
    color: DlnColors.navyInk,
  },
  summaryMeta: {
    marginTop: 4,
    fontSize: 7.6,
    lineHeight: 1.3,
  },
  summaryMetaNavy: {
    color: "#CFDBF3",
  },
  summaryMetaOrange: {
    color: "#8F4A21",
  },
  summaryMetaDefault: {
    color: DlnColors.soft,
  },
  twoCol: {
    flexDirection: "row",
    gap: 14,
    marginBottom: 16,
  },
  card: {
    flex: 1,
    backgroundColor: DlnColors.surfaceAlt,
    borderWidth: 1,
    borderColor: DlnColors.line,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderStyle: "dashed",
    borderBottomColor: DlnColors.line,
  },
  cardTitle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  chip: {
    width: 22,
    height: 22,
    borderRadius: 999,
    backgroundColor: DlnColors.navySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  chipOrange: {
    backgroundColor: DlnColors.orangeSoft,
  },
  chipText: {
    fontSize: 9.5,
    fontWeight: 800,
    color: DlnColors.navy,
  },
  chipTextOrange: {
    color: "#C05520",
  },
  cardHeaderTitle: {
    fontSize: 9,
    fontWeight: 800,
    letterSpacing: 0.4,
    textTransform: "uppercase",
    color: DlnColors.navy,
  },
  cardHeaderAccent: {
    fontSize: 7.5,
    fontWeight: 800,
    color: DlnColors.orangeDeep,
    letterSpacing: 0.9,
    textTransform: "uppercase",
  },
  line: {
    marginBottom: 7,
  },
  label: {
    fontSize: 7.5,
    letterSpacing: 0.3,
    color: DlnColors.muted,
    marginBottom: 2,
    textTransform: "uppercase",
  },
  value: {
    fontSize: 9.5,
    color: DlnColors.ink,
    lineHeight: 1.4,
  },
  valueStrong: {
    fontWeight: 700,
    color: DlnColors.navyInk,
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 10,
  },
  sectionTitleWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  sectionBar: {
    width: 4,
    height: 18,
    borderRadius: 999,
    backgroundColor: DlnColors.orange,
  },
  sectionBarBlue: {
    backgroundColor: DlnColors.blue,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: 0.15,
    color: DlnColors.navyInk,
  },
  sectionCaption: {
    fontSize: 7.5,
    color: DlnColors.muted,
    letterSpacing: 0.7,
    textTransform: "uppercase",
  },
  baseCard: {
    marginTop: 2,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
    borderWidth: 1,
    borderColor: "rgba(240,122,54,0.22)",
    backgroundColor: "#FFF7F0",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  baseCardLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  baseDot: {
    marginTop: 4,
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: DlnColors.orange,
  },
  baseEyebrow: {
    fontSize: 6.8,
    fontWeight: 800,
    letterSpacing: 1.4,
    color: "#B35421",
  },
  baseTitle: {
    marginTop: 3,
    fontSize: 11,
    fontWeight: 800,
    color: DlnColors.navyInk,
  },
  baseCaption: {
    marginTop: 4,
    fontSize: 8,
    lineHeight: 1.45,
    color: "#7C543C",
  },
  baseCaptionStrong: {
    fontWeight: 800,
    color: "#AF511D",
  },
  baseCardRight: {
    minWidth: 170,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  baseValueLabel: {
    fontSize: 7.4,
    color: "#9A572F",
    fontWeight: 700,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  baseValueAmount: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: 800,
    color: "#AF511D",
  },
  table: {
    backgroundColor: DlnColors.surface,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: DlnColors.navy,
    paddingVertical: 9,
    paddingHorizontal: 12,

    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: DlnColors.line,

    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  tableHeaderText: {
    color: "#FFFFFF",
    fontSize: 8,
    fontWeight: 700,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  row: {
    flexDirection: "row",

    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#EEF2F8",

    paddingVertical: 9,
    paddingHorizontal: 12,

    backgroundColor: DlnColors.surface,
  },
  rowAlt: {
    backgroundColor: DlnColors.surfaceAlt,
  },
  lastRow: {
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
  },
  vatPill: {
    alignSelf: "flex-start",
    marginTop: 6,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: DlnColors.orangeSoft,
  },
  vatPillText: {
    fontSize: 7.2,
    color: "#AF511D",
    fontWeight: 800,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  noVatPill: {
    backgroundColor: "#E6FFF3",
  },
  noVatPillText: {
    color: DlnColors.success,
  },
  colConcept: {
    flex: 2.4,
    paddingRight: 8,
  },
  colEquipment: {
    flex: 0.95,
    paddingRight: 8,
  },
  colTiny: {
    flex: 0.8,
    paddingRight: 6,
  },
  colMoneyFlex: {
    flex: 1.05,
  },
  colOtherType: {
    width: 62,
    paddingRight: 6,
  },
  colBase: {
    width: 104,
    paddingLeft: 6,
    paddingRight: 6,
  },
  colMoney: {
    width: 90,
    paddingLeft: 6,
    paddingRight: 0,
  },
  cellText: {
    fontSize: 9,
    color: DlnColors.ink,
  },
  cellTextLight: {
    color: DlnColors.muted,
  },
  cellTextStrong: {
    color: "#AF511D",
    fontWeight: 700,
  },
  cellTextRight: {
    textAlign: "right",
    fontSize: 9,
    color: DlnColors.ink,
    fontVariant: ["tabular-nums"],
  },
  cellTextHeaderRight: {
    textAlign: "right",
    color: "#FFFFFF",
    fontSize: 8,
    fontWeight: 700,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  note: {
    marginTop: 4,
    fontSize: 7.8,
    color: DlnColors.muted,
    lineHeight: 1.35,
  },
  totalsWrap: {
    flexDirection: "row",
    gap: 14,
    alignItems: "flex-start",
  },
  totalsStack: {
    flex: 2,
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
  },
  totalCard: {
    flex: 1,
    minWidth: 180,
    borderWidth: 1,
    borderColor: DlnColors.line,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: DlnColors.surfaceAlt,
  },
  totalCardAccent: {
    backgroundColor: DlnColors.navy,
    borderColor: DlnColors.navy,
  },
  totalLabel: {
    fontSize: 7.5,
    letterSpacing: 0.9,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  totalLabelDefault: {
    color: DlnColors.muted,
  },
  totalLabelAccent: {
    color: "#B9C9EE",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    marginBottom: 4,
  },
  totalRowKey: {
    fontSize: 8.5,
  },
  totalRowKeyDefault: {
    color: DlnColors.muted,
  },
  totalRowKeyAccent: {
    color: "#D4DDF4",
  },
  totalRowValue: {
    fontSize: 9,
    fontWeight: 700,
    fontVariant: ["tabular-nums"],
  },
  totalRowValueDefault: {
    color: DlnColors.ink,
  },
  totalRowValueAccent: {
    color: "#F8FAFF",
  },
  grandTotal: {
    marginTop: 7,
    paddingTop: 8,
    borderTopWidth: 1,
    borderStyle: "dashed",
    borderTopColor: "#3859A6",
  },
  grandTotalDefault: {
    borderTopColor: DlnColors.line,
  },
  grandTotalKey: {
    fontSize: 8.5,
    letterSpacing: 0.7,
    textTransform: "uppercase",
  },
  grandTotalKeyDefault: {
    color: DlnColors.navy,
    fontWeight: 800,
  },
  grandTotalKeyAccent: {
    color: DlnColors.orange,
    fontWeight: 800,
  },
  grandTotalValue: {
    fontSize: 12.5,
    fontWeight: 900,
    fontVariant: ["tabular-nums"],
  },
  grandTotalValueDefault: {
    color: DlnColors.navy,
  },
  grandTotalValueAccent: {
    color: "#FFFFFF",
  },
  footer: {
    marginHorizontal: 32,
    marginTop: 2,
    marginBottom: 22,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: DlnColors.orangeSoft,
    backgroundColor: "#FFFAF6",
  },
  footerTitle: {
    fontSize: 8,
    fontWeight: 800,
    color: DlnColors.orangeDeep,
    letterSpacing: 0.9,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  footerTerms: {
    flexDirection: "row",
    gap: 14,
  },
  footerCol: {
    flex: 1,
    gap: 4,
  },
  footerItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 3,
  },
  footerBullet: {
    width: 8,
    height: 8,
    marginTop: 3,
    borderRadius: 999,
    backgroundColor: DlnColors.orange,
  },
  footerText: {
    flex: 1,
    fontSize: 7.8,
    lineHeight: 1.4,
    color: "#53311A",
  },
  pageFooter: {
    position: "absolute",
    left: 32,
    right: 32,
    bottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  pageIndex: {
    fontSize: 7.5,
    color: DlnColors.muted,
  },
  brandSig: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  brandSigLogo: {
    width: 112,
    height: 40,
    objectFit: "contain",
  },
  brandSigFallbackDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: DlnColors.orange,
  },
  brandSigText: {
    fontSize: 7.5,
    fontWeight: 700,
    color: DlnColors.muted,
    letterSpacing: 0.5,
  },
  brandWatermark: {
    position: "absolute",
    right: 30,
    bottom: 58,
    width: 300,
    height: 108,
    objectFit: "contain",
    opacity: 0.13,
  },
});

const DEFAULT_TERMS = [
  "El seguro de mercancía es opcional.",
  "Precios válidos únicamente hasta la fecha de vigencia.",
  "Refacturación por errores del cliente generará un costo extra de $1,000.00 MXN + IVA.",
  "Servicios realizados en territorio mexicano son más impuestos.",
  "No incluye maniobras de carga/descarga en puerto.",
  "El emisor no se responsabiliza por retrasos ajenos (almacenajes, demoras).",
  "No aplica depósito en garantía de contenedor para clientes al contado.",
  "Considerar gastos locales adicionales por contenedor y por BL.",
  "La aceptación implica aceptación tácita de los términos.",
];

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

function formatDateLabel(value: string | null) {
  if (!value) return "Pendiente";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsed);
}

function formatFreeDays(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") {
    return "0 días";
  }

  if (typeof value === "number") {
    if (!Number.isFinite(value) || value < 0) return "0 días";
    const asInt = Math.round(value);
    return asInt === 1 ? "1 día" : `${asInt} días`;
  }

  const trimmed = String(value).trim();
  if (trimmed.length === 0) return "0 días";
  if (/^\d+(\.\d+)?$/.test(trimmed)) {
    const parsed = Number.parseFloat(trimmed);
    if (Number.isFinite(parsed) && parsed >= 0) {
      const asInt = Math.round(parsed);
      return asInt === 1 ? "1 día" : `${asInt} días`;
    }
  }

  if (/\d/.test(trimmed)) {
    return trimmed;
  }

  return `${trimmed} (días)`;
}

function formatTransitTime(value: string | null | undefined): string {
  if (value === null || value === undefined) {
    return "Tiempo de tránsito por confirmar";
  }
  const trimmed = String(value).trim();
  if (trimmed.length === 0) {
    return "Tiempo de tránsito por confirmar";
  }
  return trimmed;
}

function getChargeTotalsByCurrency(quote: PlatformQuoteDetail) {
  return quote.chargeItems.reduce<Record<string, { base: number; vat: number; total: number }>>(
    (acc, item) => {
      const key = item.currency;
      if (!acc[key]) {
        acc[key] = { base: 0, vat: 0, total: 0 };
      }
      acc[key].base += item.baseAmount;
      acc[key].vat += item.vatAmount;
      acc[key].total += item.totalAmount;
      return acc;
    },
    {},
  );
}

function getOtherItemsTotals(quote: PlatformQuoteDetail) {
  return quote.otherItems.reduce(
    (acc, item) => {
      acc.base += item.baseAmountMxn;
      acc.vat += item.vatAmountMxn;
      acc.total += item.totalAmountMxn;
      return acc;
    },
    { base: 0, vat: 0, total: 0 },
  );
}

export function QuotePdfDocument({ quote }: { quote: PlatformQuoteDetail }) {
  const chargeTotals = getChargeTotalsByCurrency(quote);
  const otherTotals = getOtherItemsTotals(quote);
  const hasOtherItems = quote.otherItems.length > 0;
  const currenciesLabel = quote.documentCurrencies.join(" / ") || "USD / MXN";
  const issuerSellerLine =
    [quote.issuerSellerName, quote.issuerContactEmail].filter(Boolean).join(" · ") ||
    "Contacto comercial";
  const chargeCurrencies = Object.keys(chargeTotals);
  const termsFirst = DEFAULT_TERMS.slice(0, 5);
  const termsSecond = DEFAULT_TERMS.slice(5, DEFAULT_TERMS.length);

  return (
    <Document
      title={`Cotizacion ${quote.quoteNumber || "DLN"}`}
      author={quote.issuerTradeName || "DLN Forwarding"}
      subject="Cotizacion DLN Forwarding"
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.topRibbon} />

        <View style={styles.headerWrap}>
          <View style={styles.headerRow}>
            <View style={styles.headerBrand}>
              <View style={styles.brandMark}>
                {LOGO_DATA_URL ? <Image src={LOGO_DATA_URL} style={styles.brandLogo} /> : (
                  <View style={styles.brandTitles}>
                    <Text style={styles.brandNameFallback}>DLN FORWARDING</Text>
                    <Text style={styles.brandTagline}>Forwarding · Logistics · Customs</Text>
                  </View>
                )}
                {LOGO_DATA_URL ? <Text style={styles.brandTagline}>Forwarding · Logistics · Customs</Text> : null}
              </View>

              <View style={styles.issuerBlock}>
                <View style={styles.issuerCol}>
                  <Text style={styles.issuerLabel}>Razón social · RFC</Text>
                  <Text style={[styles.issuerValue, styles.issuerValueStrong]}>
                    {quote.issuerLegalName}
                  </Text>
                  <Text style={styles.issuerValue}>RFC {quote.issuerRfc}</Text>
                </View>
                <View style={styles.issuerCol}>
                  <Text style={styles.issuerLabel}>Dirección fiscal</Text>
                  <Text style={styles.issuerValue}>{quote.issuerTaxAddress}</Text>
                </View>
                <View style={styles.issuerCol}>
                  <Text style={styles.issuerLabel}>Contacto</Text>
                  <Text style={styles.issuerValue}>{quote.issuerPhone}</Text>
                  <Text style={styles.issuerValue}>{quote.issuerWebsite}</Text>
                  <Text style={styles.issuerValue}>{issuerSellerLine}</Text>
                </View>
              </View>
            </View>

            <View style={styles.headerMeta}>
              <Text style={styles.metaLabel}>Cotización</Text>
              <Text style={styles.quoteNumber}>{quote.quoteNumber || "Borrador"}</Text>
              <Text style={styles.quoteKind}>Ticket de cotización marítima</Text>

              <View style={styles.metaBadge}>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>DLN · Quote</Text>
                </View>
                <Text style={styles.metaCurrencies}>{currenciesLabel}</Text>
              </View>

              <View style={styles.smallMeta}>
                <View style={styles.smallMetaLine}>
                  <Text style={styles.smallMetaKey}>Emisión</Text>
                  <Text style={styles.smallMetaValue}>
                    {formatDateLabel(quote.quoteIssueDateLabel)}
                  </Text>
                </View>
                <View style={styles.smallMetaLine}>
                  <Text style={styles.smallMetaKey}>Vigencia</Text>
                  <Text style={styles.smallMetaValue}>
                    {formatDateLabel(quote.quoteValidUntilLabel)}
                  </Text>
                </View>
                <View style={styles.smallMetaLine}>
                  <Text style={styles.smallMetaKey}>Cliente</Text>
                  <Text style={styles.smallMetaValue}>{quote.clientCompanyName}</Text>
                </View>
                <View style={styles.smallMetaLine}>
                  <Text style={styles.smallMetaKey}>Atención</Text>
                  <Text style={styles.smallMetaValue}>{quote.clientContactName}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.accentBar} />

        <View style={styles.body}>
          <View style={styles.summaryStrip}>
            <View style={[styles.summaryCard, styles.summaryCardNavy]}>
              <Text style={[styles.summaryLabel, styles.summaryLabelLight]}>Origen</Text>
              <Text style={[styles.summaryValue, styles.summaryValueNavy]}>
                {quote.routeOriginPort}
              </Text>
              <Text style={[styles.summaryMeta, styles.summaryMetaNavy]}>
                {quote.routeIncoterm || "Incoterm por confirmar"}
              </Text>
            </View>
            <View style={[styles.summaryCard, styles.summaryCardOrange]}>
              <Text style={[styles.summaryLabel, styles.summaryLabelOrange]}>Destino</Text>
              <Text style={[styles.summaryValue, styles.summaryValueOrange]}>
                {quote.routeDestinationPort}
              </Text>
              <Text style={[styles.summaryMeta, styles.summaryMetaOrange]}>
                {quote.routeShippingLine || "Naviera por confirmar"}
              </Text>
            </View>
            <View style={[styles.summaryCard, styles.summaryCardOrange]}>
              <Text style={[styles.summaryLabel, styles.summaryLabelOrange]}>Días libres</Text>
              <Text style={[styles.summaryValue, styles.summaryValueOrange]}>
                {formatFreeDays(quote.routeFreeDays)}
              </Text>
              <Text style={[styles.summaryMeta, styles.summaryMetaOrange]}>
                Sin costo extra en puerto
              </Text>
            </View>
            <View style={[styles.summaryCard, styles.summaryCardMuted]}>
              <Text style={[styles.summaryLabel, styles.summaryLabelDefault]}>Tránsito</Text>
              <Text style={[styles.summaryValue, styles.summaryValueDefault]}>
                {formatTransitTime(quote.routeTransitTime)}
              </Text>
              <Text style={[styles.summaryMeta, styles.summaryMetaDefault]}>
                Origen → destino · Est.
              </Text>
            </View>
          </View>

          <View style={styles.twoCol}>
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardTitle}>
                  <View style={styles.chip}>
                    <Text style={styles.chipText}>01</Text>
                  </View>
                  <Text style={styles.cardHeaderTitle}>Emisor / Forwarder</Text>
                </View>
                <Text style={styles.cardHeaderAccent}>DLN</Text>
              </View>
              <View style={styles.line}>
                <Text style={styles.label}>Razón social</Text>
                <Text style={[styles.value, styles.valueStrong]}>{quote.issuerLegalName}</Text>
              </View>
              <View style={styles.line}>
                <Text style={styles.label}>RFC · Web</Text>
                <Text style={styles.value}>{quote.issuerRfc} · {quote.issuerWebsite}</Text>
              </View>
              <View style={styles.line}>
                <Text style={styles.label}>Teléfono</Text>
                <Text style={styles.value}>{quote.issuerPhone}</Text>
              </View>
              <View style={styles.line}>
                <Text style={styles.label}>Vendedor / Contacto</Text>
                <Text style={styles.value}>{issuerSellerLine}</Text>
              </View>
            </View>

            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardTitle}>
                  <View style={[styles.chip, styles.chipOrange]}>
                    <Text style={[styles.chipText, styles.chipTextOrange]}>02</Text>
                  </View>
                  <Text style={styles.cardHeaderTitle}>Cliente</Text>
                </View>
                <Text style={styles.cardHeaderAccent}>Ship To</Text>
              </View>
              <View style={styles.line}>
                <Text style={styles.label}>Empresa</Text>
                <Text style={[styles.value, styles.valueStrong]}>{quote.clientCompanyName}</Text>
              </View>
              <View style={styles.line}>
                <Text style={styles.label}>Contacto principal</Text>
                <Text style={styles.value}>{quote.clientContactName}</Text>
              </View>
              <View style={styles.line}>
                <Text style={styles.label}>Folio / Referencia</Text>
                <Text style={styles.value}>{quote.quoteNumber || "Borrador DLN"}</Text>
              </View>
              <View style={styles.line}>
                <Text style={styles.label}>Vigencia de la oferta</Text>
                <Text style={styles.value}>
                  {formatDateLabel(quote.quoteIssueDateLabel)} · {formatDateLabel(quote.quoteValidUntilLabel)}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleWrap}>
                <View style={styles.sectionBar} />
                <Text style={styles.sectionTitle}>Conceptos a cobrar</Text>
              </View>
              <Text style={styles.sectionCaption}>Desglose por servicio · equipo</Text>
            </View>

            <View style={styles.table}>
              <View
                style={styles.tableHeader}
                minPresenceAhead={70}
                fixed
              >
                <Text style={[styles.tableHeaderText, styles.colConcept]}>Concepto</Text>
                <Text style={[styles.tableHeaderText, styles.colEquipment]}>Equipo</Text>
                <Text style={[styles.tableHeaderText, styles.colTiny]}>Cant.</Text>
                <Text style={[styles.cellTextHeaderRight, styles.colMoneyFlex]}>Base</Text>
                <Text style={[styles.cellTextHeaderRight, styles.colMoneyFlex]}>IVA</Text>
                <Text style={[styles.cellTextHeaderRight, styles.colMoneyFlex]}>Total</Text>
              </View>

              {quote.chargeItems.map((item, index) => {
                const isAlt = index % 2 === 1;
                const isLast = index === quote.chargeItems.length - 1;
                const rowClass = isAlt
                  ? isLast
                    ? [styles.row, styles.rowAlt, styles.lastRow]
                    : [styles.row, styles.rowAlt]
                  : isLast
                    ? [styles.row, styles.lastRow]
                    : [styles.row];

                return (
                  <View key={item.id} style={rowClass} wrap={false}>
                    <View style={styles.colConcept}>
                      <Text style={styles.cellText}>{item.conceptName}</Text>
                      <View
                        style={
                          item.vatMode === "mas_iva"
                            ? styles.vatPill
                            : [styles.vatPill, styles.noVatPill]
                        }
                      >
                        <Text
                          style={
                            item.vatMode === "mas_iva"
                              ? styles.vatPillText
                              : [styles.vatPillText, styles.noVatPillText]
                          }
                        >
                          {item.vatMode === "mas_iva"
                            ? `+ IVA ${Math.round((item.vatRate ?? 0) * 100)}%`
                            : "Sin IVA"}
                        </Text>
                      </View>
                      {item.notes ? <Text style={styles.note}>{item.notes}</Text> : null}
                    </View>
                    <Text style={[styles.cellText, styles.cellTextLight, styles.colEquipment]}>
                      {item.equipmentType || "-"}
                    </Text>
                    <Text style={[styles.cellText, styles.colTiny]}>{item.quantity.toFixed(0)}</Text>
                    <Text style={[styles.cellTextRight, styles.colMoneyFlex]}>
                      {formatMoney(item.baseAmount, item.currency)}
                    </Text>
                    <Text style={[styles.cellTextRight, styles.colMoneyFlex]}>
                      {formatMoney(item.vatAmount, item.currency)}
                    </Text>
                    <Text style={[styles.cellTextRight, styles.colMoneyFlex]}>
                      {formatMoney(item.totalAmount, item.currency)}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          {hasOtherItems ? (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleWrap}>
                  <View style={[styles.sectionBar, styles.sectionBarBlue]} />
                  <Text style={styles.sectionTitle}>Otros conceptos</Text>
                </View>
                <Text style={styles.sectionCaption}>Ajustes y adicionales · MXN</Text>
              </View>

              <View style={styles.table}>
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableHeaderText, styles.colConcept]}>Concepto</Text>
                  <Text style={[styles.tableHeaderText, styles.colOtherType]}>Tipo</Text>
                  <Text style={[styles.cellTextHeaderRight, styles.colBase]}>Monto merc. MXN</Text>
                  <Text style={[styles.cellTextHeaderRight, styles.colMoney]}>Base MXN</Text>
                  <Text style={[styles.cellTextHeaderRight, styles.colMoney]}>IVA MXN</Text>
                  <Text style={[styles.cellTextHeaderRight, styles.colMoney]}>Total MXN</Text>
                </View>

                {quote.otherItems.map((item, index) => {
                  const isAlt = index % 2 === 1;
                  const isLast = index === quote.otherItems.length - 1;
                  const rowClass = isAlt
                    ? isLast
                      ? [styles.row, styles.rowAlt, styles.lastRow]
                      : [styles.row, styles.rowAlt]
                    : isLast
                      ? [styles.row, styles.lastRow]
                      : [styles.row];

                  return (
                    <View key={item.id} style={rowClass}>
                      <View style={styles.colConcept}>
                        <Text style={styles.cellText}>{item.name}</Text>
                        <View
                          style={
                            item.vatMode === "mas_iva"
                              ? styles.vatPill
                              : [styles.vatPill, styles.noVatPill]
                          }
                        >
                          <Text
                            style={
                              item.vatMode === "mas_iva"
                                ? styles.vatPillText
                                : [styles.vatPillText, styles.noVatPillText]
                            }
                          >
                            {item.vatMode === "mas_iva"
                              ? `+ IVA ${Math.round((item.vatRate ?? 0) * 100)}%`
                              : "Sin IVA"}
                          </Text>
                        </View>
                        {item.notes ? <Text style={styles.note}>{item.notes}</Text> : null}
                      </View>
                      <Text style={[styles.cellText, styles.cellTextLight, styles.colOtherType]}>
                        {item.valueType === "porcentaje" ? `${item.value}%` : "Monto"}
                      </Text>
                      <Text
                        style={[
                          styles.cellTextRight,
                          styles.colBase,
                          item.goodsDeclaredValue > 0
                            ? styles.cellTextStrong
                            : styles.cellTextLight,
                        ]}
                      >
                        {formatMoney(item.goodsDeclaredValue, "MXN")}
                      </Text>
                      <Text style={[styles.cellTextRight, styles.colMoney]}>
                        {formatMoney(item.baseAmountMxn, "MXN")}
                      </Text>
                      <Text style={[styles.cellTextRight, styles.colMoney]}>
                        {formatMoney(item.vatAmountMxn, "MXN")}
                      </Text>
                      <Text style={[styles.cellTextRight, styles.colMoney]}>
                        {formatMoney(item.totalAmountMxn, "MXN")}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          ) : null}

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleWrap}>
                <View style={styles.sectionBar} />
                <Text style={styles.sectionTitle}>Totales</Text>
              </View>
              <Text style={styles.sectionCaption}>Resumen por moneda</Text>
            </View>

            <View style={styles.totalsWrap}>
              <View style={styles.totalsStack}>
                {chargeCurrencies.length === 0 ? null : chargeCurrencies.map((currency, idx) => {
                  const totals = chargeTotals[currency];
                  const isAccent = idx === 0;
                  return (
                    <View
                      key={currency}
                      style={isAccent ? [styles.totalCard, styles.totalCardAccent] : styles.totalCard}
                    >
                      <Text
                        style={
                          isAccent
                            ? [styles.totalLabel, styles.totalLabelAccent]
                            : [styles.totalLabel, styles.totalLabelDefault]
                        }
                      >
                        Cargos · {currency}
                      </Text>
                      <View style={styles.totalRow}>
                        <Text
                          style={
                            isAccent
                              ? [styles.totalRowKey, styles.totalRowKeyAccent]
                              : [styles.totalRowKey, styles.totalRowKeyDefault]
                          }
                        >
                          Subtotal
                        </Text>
                        <Text
                          style={
                            isAccent
                              ? [styles.totalRowValue, styles.totalRowValueAccent]
                              : [styles.totalRowValue, styles.totalRowValueDefault]
                          }
                        >
                          {formatMoney(totals.base, currency)}
                        </Text>
                      </View>
                      <View style={styles.totalRow}>
                        <Text
                          style={
                            isAccent
                              ? [styles.totalRowKey, styles.totalRowKeyAccent]
                              : [styles.totalRowKey, styles.totalRowKeyDefault]
                          }
                        >
                          IVA
                        </Text>
                        <Text
                          style={
                            isAccent
                              ? [styles.totalRowValue, styles.totalRowValueAccent]
                              : [styles.totalRowValue, styles.totalRowValueDefault]
                          }
                        >
                          {formatMoney(totals.vat, currency)}
                        </Text>
                      </View>
                      <View
                        style={
                          isAccent
                            ? [styles.grandTotal]
                            : [styles.grandTotal, styles.grandTotalDefault]
                        }
                      >
                        <View style={styles.totalRow}>
                          <Text
                            style={
                              isAccent
                                ? [styles.grandTotalKey, styles.grandTotalKeyAccent]
                                : [styles.grandTotalKey, styles.grandTotalKeyDefault]
                            }
                          >
                            Total {currency}
                          </Text>
                          <Text
                            style={
                              isAccent
                                ? [styles.grandTotalValue, styles.grandTotalValueAccent]
                                : [styles.grandTotalValue, styles.grandTotalValueDefault]
                            }
                          >
                            {formatMoney(totals.total, currency)}
                          </Text>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>

              <View
                style={
                  chargeCurrencies.length === 0
                    ? [styles.totalCard, styles.totalCardAccent]
                    : styles.totalCard
                }
              >
                <Text
                  style={
                    chargeCurrencies.length === 0
                      ? [styles.totalLabel, styles.totalLabelAccent]
                      : [styles.totalLabel, styles.totalLabelDefault]
                  }
                >
                  Otros conceptos · MXN
                </Text>
                <View style={styles.totalRow}>
                  <Text
                    style={
                      chargeCurrencies.length === 0
                        ? [styles.totalRowKey, styles.totalRowKeyAccent]
                        : [styles.totalRowKey, styles.totalRowKeyDefault]
                    }
                  >
                    Subtotal
                  </Text>
                  <Text
                    style={
                      chargeCurrencies.length === 0
                        ? [styles.totalRowValue, styles.totalRowValueAccent]
                        : [styles.totalRowValue, styles.totalRowValueDefault]
                    }
                  >
                    {formatMoney(otherTotals.base, "MXN")}
                  </Text>
                </View>
                <View style={styles.totalRow}>
                  <Text
                    style={
                      chargeCurrencies.length === 0
                        ? [styles.totalRowKey, styles.totalRowKeyAccent]
                        : [styles.totalRowKey, styles.totalRowKeyDefault]
                    }
                  >
                    IVA
                  </Text>
                  <Text
                    style={
                      chargeCurrencies.length === 0
                        ? [styles.totalRowValue, styles.totalRowValueAccent]
                        : [styles.totalRowValue, styles.totalRowValueDefault]
                    }
                  >
                    {formatMoney(otherTotals.vat, "MXN")}
                  </Text>
                </View>
                <View
                  style={
                    chargeCurrencies.length === 0
                      ? [styles.grandTotal]
                      : [styles.grandTotal, styles.grandTotalDefault]
                  }
                >
                  <View style={styles.totalRow}>
                    <Text
                      style={
                        chargeCurrencies.length === 0
                          ? [styles.grandTotalKey, styles.grandTotalKeyAccent]
                          : [styles.grandTotalKey, styles.grandTotalKeyDefault]
                      }
                    >
                      Total MXN
                    </Text>
                    <Text
                      style={
                        chargeCurrencies.length === 0
                          ? [styles.grandTotalValue, styles.grandTotalValueAccent]
                          : [styles.grandTotalValue, styles.grandTotalValueDefault]
                      }
                    >
                      {formatMoney(otherTotals.total, "MXN")}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerTitle}>Términos y condiciones comerciales</Text>
          <View style={styles.footerTerms}>
            <View style={styles.footerCol}>
              {termsFirst.map((term, index) => (
                <View key={`term-first-${index}`} style={styles.footerItem}>
                  <View style={styles.footerBullet} />
                  <Text style={styles.footerText}>{term}</Text>
                </View>
              ))}
            </View>
            <View style={styles.footerCol}>
              {termsSecond.map((term, index) => (
                <View key={`term-second-${index}`} style={styles.footerItem}>
                  <View style={styles.footerBullet} />
                  <Text style={styles.footerText}>{term}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {LOGO_DATA_URL ? <Image src={LOGO_DATA_URL} style={styles.brandWatermark} /> : null}

        <View style={styles.pageFooter}>
          <Text style={styles.pageIndex}>
            {quote.quoteNumber ? `Cotización ${quote.quoteNumber} · ` : ""}
            Página 1 de 1
          </Text>
          <View style={styles.brandSig}>
            {LOGO_DATA_URL ? (
              <Image src={LOGO_DATA_URL} style={styles.brandSigLogo} />
            ) : (
              <View style={styles.brandSigFallbackDot} />
            )}
            <Text style={styles.brandSigText}>We connect Your World</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
