import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

import type { PlatformQuoteDetail } from "@/lib/quotes";

const styles = StyleSheet.create({
  page: {
    padding: 28,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#0f172a",
    backgroundColor: "#ffffff",
  },
  header: {
    marginBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 10,
    color: "#475569",
  },
  grid: {
    display: "flex",
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  card: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    padding: 10,
  },
  cardTitle: {
    fontSize: 9,
    textTransform: "uppercase",
    color: "#64748b",
    marginBottom: 8,
  },
  line: {
    marginBottom: 4,
  },
  label: {
    fontSize: 8,
    color: "#64748b",
    marginBottom: 2,
  },
  value: {
    fontSize: 10,
    color: "#0f172a",
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    marginBottom: 8,
  },
  table: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f8fafc",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  colConcept: {
    flex: 2.1,
    paddingRight: 8,
  },
  colSmall: {
    flex: 0.9,
    paddingRight: 8,
  },
  colMoney: {
    flex: 1.1,
    textAlign: "right",
  },
  textRight: {
    textAlign: "right",
  },
  note: {
    fontSize: 8,
    color: "#64748b",
    marginTop: 3,
  },
  totalsGrid: {
    flexDirection: "row",
    gap: 12,
  },
  totalCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    padding: 10,
  },
  totalLabel: {
    fontSize: 9,
    color: "#64748b",
    marginBottom: 4,
  },
  totalValue: {
    fontSize: 11,
    fontWeight: 700,
  },
});

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

export function QuotePdfDocument({ quote }: { quote: PlatformQuoteDetail }) {
  const chargeTotals = getChargeTotalsByCurrency(quote);

  return (
    <Document
      title={`Cotizacion ${quote.quoteNumber}`}
      author={quote.issuerTradeName}
      subject="Ticket de cotizacion"
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>{quote.issuerTradeName || "DLN Forwarding"}</Text>
          <Text style={styles.subtitle}>Ticket de cotizacion · {quote.quoteNumber}</Text>
        </View>

        <View style={styles.grid}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Emisor</Text>
            <View style={styles.line}>
              <Text style={styles.label}>Razon social</Text>
              <Text style={styles.value}>{quote.issuerLegalName}</Text>
            </View>
            <View style={styles.line}>
              <Text style={styles.label}>RFC</Text>
              <Text style={styles.value}>{quote.issuerRfc}</Text>
            </View>
            <View style={styles.line}>
              <Text style={styles.label}>Direccion</Text>
              <Text style={styles.value}>{quote.issuerTaxAddress}</Text>
            </View>
            <View style={styles.line}>
              <Text style={styles.label}>Contacto</Text>
              <Text style={styles.value}>
                {quote.issuerSellerName || "Sin vendedor"} · {quote.issuerContactEmail || "Sin correo"}
              </Text>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Cliente</Text>
            <View style={styles.line}>
              <Text style={styles.label}>Empresa</Text>
              <Text style={styles.value}>{quote.clientCompanyName}</Text>
            </View>
            <View style={styles.line}>
              <Text style={styles.label}>Contacto</Text>
              <Text style={styles.value}>{quote.clientContactName}</Text>
            </View>
            <View style={styles.line}>
              <Text style={styles.label}>Emision / Vigencia</Text>
              <Text style={styles.value}>
                {quote.quoteIssueDateLabel} · {quote.quoteValidUntilLabel}
              </Text>
            </View>
            <View style={styles.line}>
              <Text style={styles.label}>Monedas</Text>
              <Text style={styles.value}>{quote.documentCurrencies.join(" / ") || "USD / MXN"}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ruta</Text>
          <View style={styles.grid}>
            <View style={styles.card}>
              <Text style={styles.label}>Origen</Text>
              <Text style={styles.value}>{quote.routeOriginPort}</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.label}>Destino</Text>
              <Text style={styles.value}>{quote.routeDestinationPort}</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.label}>Incoterm / Naviera</Text>
              <Text style={styles.value}>{quote.routeIncoterm} · {quote.routeShippingLine}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Conceptos a cobrar</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.colConcept}>Concepto</Text>
              <Text style={styles.colSmall}>Equipo</Text>
              <Text style={styles.colSmall}>Cant.</Text>
              <Text style={styles.colMoney}>Base</Text>
              <Text style={styles.colMoney}>IVA</Text>
              <Text style={styles.colMoney}>Total</Text>
            </View>
            {quote.chargeItems.map((item, index) => (
              <View
                key={item.id}
                  style={index === quote.chargeItems.length - 1 ? [styles.row, styles.lastRow] : styles.row}
              >
                <View style={styles.colConcept}>
                  <Text>{item.conceptName}</Text>
                  {item.notes ? <Text style={styles.note}>{item.notes}</Text> : null}
                </View>
                <Text style={styles.colSmall}>{item.equipmentType || "-"}</Text>
                <Text style={styles.colSmall}>{item.quantity.toFixed(0)}</Text>
                <Text style={styles.colMoney}>{formatMoney(item.baseAmount, item.currency)}</Text>
                <Text style={styles.colMoney}>{formatMoney(item.vatAmount, item.currency)}</Text>
                <Text style={styles.colMoney}>{formatMoney(item.totalAmount, item.currency)}</Text>
              </View>
            ))}
          </View>
        </View>

        {quote.otherItems.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Otros conceptos</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={styles.colConcept}>Nombre</Text>
                <Text style={styles.colSmall}>Tipo</Text>
                <Text style={styles.colMoney}>Base MXN</Text>
                <Text style={styles.colMoney}>IVA MXN</Text>
                <Text style={styles.colMoney}>Total MXN</Text>
              </View>
              {quote.otherItems.map((item, index) => (
                <View
                  key={item.id}
                  style={index === quote.otherItems.length - 1 ? [styles.row, styles.lastRow] : styles.row}
                >
                  <View style={styles.colConcept}>
                    <Text>{item.name}</Text>
                    {item.notes ? <Text style={styles.note}>{item.notes}</Text> : null}
                  </View>
                  <Text style={styles.colSmall}>
                    {item.valueType === "porcentaje" ? `${item.value}%` : "Monto"}
                  </Text>
                  <Text style={styles.colMoney}>{formatMoney(item.baseAmountMxn, "MXN")}</Text>
                  <Text style={styles.colMoney}>{formatMoney(item.vatAmountMxn, "MXN")}</Text>
                  <Text style={styles.colMoney}>{formatMoney(item.totalAmountMxn, "MXN")}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Totales</Text>
          <View style={styles.totalsGrid}>
            {Object.entries(chargeTotals).map(([currency, totals]) => (
              <View key={currency} style={styles.totalCard}>
                <Text style={styles.totalLabel}>Cargos {currency}</Text>
                <Text style={styles.value}>Base: {formatMoney(totals.base, currency)}</Text>
                <Text style={styles.value}>IVA: {formatMoney(totals.vat, currency)}</Text>
                <Text style={styles.totalValue}>Total: {formatMoney(totals.total, currency)}</Text>
              </View>
            ))}
            <View style={styles.totalCard}>
              <Text style={styles.totalLabel}>Otros conceptos MXN</Text>
              <Text style={styles.value}>
                Base: {formatMoney(quote.otherItems.reduce((acc, item) => acc + item.baseAmountMxn, 0), "MXN")}
              </Text>
              <Text style={styles.value}>
                IVA: {formatMoney(quote.otherItems.reduce((acc, item) => acc + item.vatAmountMxn, 0), "MXN")}
              </Text>
              <Text style={styles.totalValue}>
                Total: {formatMoney(quote.otherItems.reduce((acc, item) => acc + item.totalAmountMxn, 0), "MXN")}
              </Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}
