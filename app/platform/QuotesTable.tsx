import Link from "next/link";
import { ArrowUpRightIcon, FileDownIcon, FileTextIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { PlatformQuote } from "@/lib/quotes";

type QuotesTableProps = {
  quotes: PlatformQuote[];
};

function getStatusLabel(status: string) {
  const normalized = status.trim().toLowerCase();

  if (normalized === "draft") return "Borrador";
  if (normalized === "sent") return "Enviada";
  if (normalized === "accepted") return "Aceptada";
  if (normalized === "rejected") return "Rechazada";
  if (normalized === "expired") return "Expirada";
  return status;
}

function getStatusClassName(status: string) {
  const normalized = status.trim().toLowerCase();

  if (normalized === "accepted") {
    return "border-emerald-200/80 bg-emerald-50 text-emerald-700";
  }

  if (normalized === "sent") {
    return "border-sky-200/80 bg-sky-50 text-sky-700";
  }

  if (normalized === "rejected") {
    return "border-rose-200/80 bg-rose-50 text-rose-700";
  }

  if (normalized === "expired") {
    return "border-amber-200/80 bg-amber-50 text-amber-700";
  }

  return "border-slate-200/90 bg-slate-100/90 text-slate-600";
}

export function QuotesTable({ quotes }: QuotesTableProps) {
  if (quotes.length === 0) {
    return (
      <div className="flex h-full items-center justify-center rounded-[1.75rem] border border-dashed border-black/10 bg-white/65 px-6 text-center backdrop-blur">
        <div className="max-w-md space-y-2">
          <p className="text-lg font-medium text-foreground">Aun no hay cotizaciones.</p>
          <p className="text-sm leading-6 text-muted-foreground">
            Guarda tu primera cotizacion para verla aqui y generar su PDF.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[2rem] border border-[#d7e2f1] bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(248,250,255,0.98)_100%)] shadow-[0_18px_60px_rgba(16,24,40,0.08)] backdrop-blur-xl">
      <div className="border-b border-[#dfe7f3] bg-[linear-gradient(180deg,rgba(255,255,255,0.92)_0%,rgba(249,251,255,0.82)_100%)] px-6 py-4">
        <div className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,1.4fr)_minmax(0,1fr)_9rem_12rem] items-center gap-4 text-[0.69rem] font-medium uppercase tracking-[0.18em] text-[#6b7280]">
          <span>Cotizacion</span>
          <span>Cliente y ruta</span>
          <span>Totales</span>
          <span>Estado</span>
          <span className="text-right">Acciones</span>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3">
        {quotes.map((quote) => (
          <div
            key={quote.id}
            className="group grid grid-cols-[minmax(0,1.2fr)_minmax(0,1.4fr)_minmax(0,1fr)_9rem_12rem] items-center gap-4 border-b border-[#e8edf5] px-3 py-3.5 transition-colors duration-200 hover:bg-[#f7faff] last:border-b-0"
          >
            <div className="min-w-0 space-y-1">
              <p className="truncate text-[0.95rem] font-medium tracking-[-0.02em] text-[#111827]">
                {quote.quoteNumber}
              </p>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.78rem] text-[#6b7280]">
                <span>{quote.issueDateLabel}</span>
                <span>Vence {quote.validUntilLabel}</span>
                <span>{quote.currenciesLabel}</span>
              </div>
            </div>

            <div className="min-w-0 space-y-1">
              <p className="truncate text-[0.88rem] font-medium text-[#111827]">
                {quote.clientCompanyName}
              </p>
              <p className="truncate text-[0.78rem] text-[#6b7280]">{quote.clientContactName}</p>
              <p className="truncate text-[0.78rem] text-[#6b7280]">
                {quote.routeOriginPort} → {quote.routeDestinationPort} · {quote.routeShippingLine}
              </p>
            </div>

            <div className="min-w-0">
              <p className="truncate text-[0.88rem] font-medium text-[#111827]">
                {quote.totalsSummary}
              </p>
              <p className="truncate text-[0.78rem] text-[#6b7280]">Creada {quote.createdAtLabel}</p>
            </div>

            <div>
              <span
                className={[
                  "inline-flex rounded-full border px-2.5 py-1 text-[0.72rem] font-medium",
                  getStatusClassName(quote.status),
                ].join(" ")}
              >
                {getStatusLabel(quote.status)}
              </span>
            </div>

            <div className="flex items-center justify-end gap-2">
              <Button asChild size="sm" variant="outline" className="rounded-full">
                <Link href={`/platform/quotes/${quote.id}/pdf`} target="_blank">
                  <FileTextIcon />
                  Ver PDF
                </Link>
              </Button>
              <Button asChild size="sm" variant="outline" className="rounded-full">
                <Link href={`/platform/quotes/${quote.id}/pdf?download=1`}>
                  <FileDownIcon />
                  Descargar
                </Link>
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-[#e8edf5] bg-white/65 px-6 py-3">
        <div className="flex items-center justify-between gap-3 text-[0.78rem] text-[#6b7280]">
          <div className="inline-flex items-center gap-2">
            <FileTextIcon className="size-3.5 text-[#94a3b8]" />
            <span>Cotizaciones guardadas en `maritime_quotes`</span>
          </div>
          <Link
            href="/platform/new"
            className="inline-flex items-center gap-1.5 text-[0.8rem] font-medium text-[#111827]"
          >
            Nueva cotizacion
            <ArrowUpRightIcon className="size-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
