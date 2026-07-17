import { redirect } from "next/navigation";
import Link from "next/link";
import { FileTextIcon } from "lucide-react";

import { QuotesTable } from "@/app/platform/QuotesTable";
import { Navbar } from "@/app/platform/components/navbar";
import { Button } from "@/components/ui/button";
import { getPlatformQuotes } from "@/lib/quotes";
import { createClient } from "@/lib/supabase/server";

export default async function PlatformPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const userName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email ||
    "Usuario";
  const userAvatarUrl =
    user.user_metadata?.avatar_url ||
    user.user_metadata?.picture ||
    user.user_metadata?.photo_url ||
    "";
  const quotesResult = await getPlatformQuotes();

  return (
    <main className="h-screen overflow-hidden bg-background text-foreground">
      <Navbar userName={userName} userAvatarUrl={userAvatarUrl} />

      <section className="relative h-[calc(100vh-3.5rem)] overflow-hidden px-6 py-8 lg:px-8 lg:py-10">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(250,250,252,0.96)_0%,rgba(245,248,252,0.92)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(173,206,243,0.28),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.9),transparent_58%)]" />

        <div className="relative mx-auto flex h-full w-full max-w-[1600px] flex-col">
          <div className="flex flex-col gap-3 border-b border-black/5 pb-5">
            <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-2">
                <h1 className="text-3xl font-normal tracking-[-0.05em] text-foreground sm:text-4xl">
                  Historial de cotizaciones
                </h1>
                <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                  Revisa tus cotizaciones guardadas, abre el ticket PDF y descarga el documento cuando lo necesites.
                </p>
              </div>

              <Button asChild size="lg" className="rounded-full">
                <Link href="/platform/new">
                  <FileTextIcon />
                  Nueva cotizacion
                </Link>
              </Button>
            </div>
          </div>

          <div className="min-h-0 flex-1 pt-6">
            {quotesResult.errorMessage ? (
              <div className="flex h-full items-center justify-center rounded-[1.75rem] border border-dashed border-black/10 bg-white/65 px-6 text-center backdrop-blur">
                <div className="max-w-md space-y-2">
                  <p className="text-lg font-medium text-foreground">No se pudo cargar el historial.</p>
                  <p className="text-sm leading-6 text-muted-foreground">
                    {quotesResult.errorMessage}
                  </p>
                </div>
              </div>
            ) : (
              <QuotesTable quotes={quotesResult.quotes} />
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
