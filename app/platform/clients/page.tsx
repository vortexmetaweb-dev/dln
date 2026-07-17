import { redirect } from "next/navigation";
import { Building2Icon } from "lucide-react";

import { Hore } from "@/app/platform/components/hore";
import { Navbar } from "@/app/platform/components/navbar";
import { ClientsHeaderActions } from "@/app/platform/clients/ClientsHeaderActions";
import { ClientsTable } from "@/app/platform/clients/ClientsTable";
import { getPlatformClients } from "@/lib/clients";
import { createClient } from "@/lib/supabase/server";

export default async function PlatformClientsPage() {
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

  const clientsResult = await getPlatformClients();

  return (
    <main className="h-screen overflow-hidden bg-background text-foreground">
      <Navbar userName={userName} userAvatarUrl={userAvatarUrl} />

      <section className="relative h-[calc(100vh-3.5rem)] overflow-hidden px-6 py-8 lg:px-8 lg:py-10">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(250,250,252,0.96)_0%,rgba(245,248,252,0.92)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(173,206,243,0.28),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.9),transparent_58%)]" />

        <div className="relative mx-auto flex h-full w-full max-w-6xl flex-col">
          <div className="flex flex-col gap-3 border-b border-black/5 pb-5">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-black/8 bg-white/70 px-3 py-1 text-[0.72rem] uppercase tracking-[0.18em] text-muted-foreground backdrop-blur">
              <Building2Icon className="size-3.5" />
              Clientes
            </div>

            <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-2">
                <h1 className="text-3xl font-normal tracking-[-0.05em] text-foreground sm:text-4xl">
                  Clientes
                </h1>
                <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                  Directorio interno con empresa, contacto y pais.
                </p>
              </div>

              {clientsResult.authorized ? (
                <ClientsHeaderActions
                  count={clientsResult.clients.length}
                  className="items-start lg:items-end lg:text-right"
                />
              ) : (
                <p className="text-sm text-muted-foreground">
                  Inicia sesion para ver los clientes
                </p>
              )}
            </div>
          </div>

          <div className="min-h-0 flex-1 pt-6">
            {clientsResult.authorized ? (
              <ClientsTable clients={clientsResult.clients} />
            ) : (
              <div className="flex h-full items-center justify-center rounded-[1.75rem] border border-black/6 bg-white/75 px-6 text-center shadow-[0_20px_80px_rgba(15,23,42,0.05)] backdrop-blur">
                <div className="max-w-lg space-y-3">
                  <div className="mx-auto flex size-12 items-center justify-center rounded-full border border-black/8 bg-black/[0.03]">
                    <Building2Icon className="size-5 text-foreground" />
                  </div>
                  <p className="text-lg font-medium text-foreground">
                    No se pudo cargar clientes
                  </p>
                  <p className="text-sm leading-6 text-muted-foreground">
                    {clientsResult.errorMessage ?? "Verifica acceso a public.clients."}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="absolute bottom-6 right-6 z-10 w-[min(100%,22rem)] max-sm:left-6 max-sm:right-6 lg:bottom-8 lg:right-8">
          <Hore />
        </div>
      </section>
    </main>
  );
}
