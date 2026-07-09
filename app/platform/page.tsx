import { redirect } from "next/navigation";
import {
  ChevronDownIcon,
  MicIcon,
  PlusIcon,
} from "lucide-react";

import { Navbar } from "@/app/platform/components/navbar";
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

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar userName={userName} />

      <section className="relative flex min-h-[calc(100vh-3.5rem)] items-center justify-center overflow-hidden px-6 py-16 lg:px-8">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(250,250,252,0.96)_0%,rgba(245,248,252,0.92)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(173,206,243,0.48),transparent_36%),radial-gradient(circle_at_center,rgba(255,255,255,0.92),transparent_72%)]" />

        <div className="relative mx-auto flex w-full max-w-4xl flex-col items-center gap-8 text-center">
          <div className="flex flex-col items-center gap-5">
            <h1 className="max-w-3xl text-4xl font-normal tracking-[-0.05em] text-foreground sm:text-5xl lg:text-6xl">
              Hola, {userName}. Tu cotizador de fletes maritimos ya esta listo.
            </h1>
            <p className="max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">
              Calcula rutas, revisa puertos, estima transit time y prepara
              propuestas comerciales para embarques FCL y LCL desde una sola
              interfaz.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
