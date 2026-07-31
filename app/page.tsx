import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/login-form";
import { createClient } from "@/lib/supabase/server";

const DLN_LOGO_SRC =
  "/WhatsApp_Image_2026-07-16_at_3.23.02_PM-removebg-preview.png";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/platform");
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="grid min-h-screen lg:grid-cols-[1.08fr_0.92fr]">
        <section className="relative hidden min-h-screen overflow-hidden lg:flex">
          <Image
            src="/login.jpg"
            alt="Terminal logistica con contenedores"
            fill
            priority
            className="object-cover object-center"
            sizes="(min-width: 1024px) 55vw, 0vw"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,12,24,0.18)_0%,rgba(4,7,18,0.56)_38%,rgba(3,6,16,0.92)_100%)]" />
          <div className="absolute inset-y-0 left-0 w-px bg-white/10" />
          <div className="absolute inset-y-0 left-8 w-px bg-white/8" />
          <div className="relative z-10 flex h-full w-full flex-col justify-start p-14 pt-20 lg:p-16 lg:pt-20 xl:p-20 xl:pt-24">
            <Link
              href="/"
              className="mb-16 inline-flex w-fit items-center gap-2 rounded-2xl px-2 py-2 transition-colors hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
              aria-label="DLN Forwarding"
            >
              <img
                src={DLN_LOGO_SRC}
                alt="DLN Forwarding"
                className="h-20 w-auto shrink-0 object-contain"
                style={{ maxWidth: 360, filter: "drop-shadow(0 18px 34px rgba(0,0,0,0.32))" }}
              />
            </Link>
            <div className="mt-auto space-y-4 pb-2">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[0.7rem] font-medium uppercase tracking-[0.24em] text-white/80 backdrop-blur">
                Forwarding · Logistics · Customs
              </div>
              <p className="max-w-lg text-lg leading-7 text-white/80">
                We connect Your World. Plataforma interna para generación de cotizaciones
                marítimas, control documental e historial de operaciones.
              </p>
            </div>
          </div>
        </section>

        <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-14 sm:px-10 lg:px-16 xl:px-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(29,78,216,0.09),transparent_34%)]" />
          <div className="absolute inset-x-0 top-0 h-px bg-border/80" />

          <div className="relative z-10 w-full max-w-md">
            <div className="mb-12 flex flex-col gap-8">
              <Link
                href="/"
                className="inline-flex w-fit items-center gap-2 rounded-2xl px-2 py-2 transition-colors hover:bg-muted lg:hidden"
                aria-label="DLN Forwarding"
              >
                <img
                  src={DLN_LOGO_SRC}
                  alt="DLN Forwarding"
                  className="block h-14 w-auto shrink-0 object-contain sm:h-16"
                  style={{ maxWidth: 280 }}
                />
              </Link>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-3">
                  <div className="inline-flex w-fit items-center gap-2 rounded-full border border-black/8 bg-white/80 px-3 py-1 text-[0.68rem] font-medium uppercase tracking-[0.24em] text-muted-foreground backdrop-blur">
                    Plataforma interna
                  </div>
                  <h2 className="text-4xl leading-none font-semibold tracking-[-0.05em] text-foreground sm:text-5xl">
                    Cotizador DLN
                  </h2>
                </div>

                <p className="max-w-sm text-sm leading-7 text-muted-foreground sm:text-base">
                  Ingresa tu correo y contraseña para acceder a tu cuenta y
                  continuar dentro de la plataforma.
                </p>
              </div>
            </div>

            <LoginForm />

            <div className="mt-14 flex flex-col gap-5 text-center text-sm text-muted-foreground">
              <p className="text-balance">
                Plataforma desarrollada por{" "}
                <span className="font-medium text-foreground">
                  MetaWeb Dev Solutions
                </span>
              </p>

              <div className="flex items-center justify-center gap-5">
                <Link
                  href="#"
                  className="transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-none"
                >
                  Políticas
                </Link>
                <span className="text-border">•</span>
                <Link
                  href="#"
                  className="transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-none"
                >
                  Privacidad
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
