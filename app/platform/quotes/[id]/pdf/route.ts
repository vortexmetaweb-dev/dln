import { Readable } from "node:stream";

import { renderToStream } from "@react-pdf/renderer";

import { QuotePdfDocument } from "@/app/platform/quotes/QuotePdfDocument";
import { getPlatformQuoteDetail } from "@/lib/quotes";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const quote = await getPlatformQuoteDetail(id);

  if (!quote) {
    return new Response("Cotizacion no encontrada.", { status: 404 });
  }

  const pdfStream = await renderToStream(QuotePdfDocument({ quote }));
  const webStream = Readable.toWeb(pdfStream as unknown as Readable) as ReadableStream;
  const download = new URL(request.url).searchParams.get("download") === "1";
  const safeFileName = `${quote.quoteNumber || quote.id}`.replace(/[^\w.-]+/g, "_");

  return new Response(webStream, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${download ? "attachment" : "inline"}; filename="${safeFileName}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
